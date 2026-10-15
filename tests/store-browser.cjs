/* NODE_PATH=<node_modules containing playwright> node tests/store-browser.cjs
 * Optional PLAYWRIGHT_MODULE, CHROME_PATH, BASE_URL. Defaults to installed playwright/Chromium.
 * Uses an isolated browser profile and an ephemeral local server. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("fs"),
  path = require("path"),
  http = require("http"),
  assert = require("assert");
const app = path.resolve(__dirname, ".."),
  tests = [];
const ok = (name, value) => {
  assert(value, name);
  tests.push(name);
};
const probe =
  '<!doctype html><html lang="es"><body><main></main><script type="module">window.Store=await import("./assets/v2/store.js");window.BB=await import("./assets/v2/brainbox.js");window.mount=()=>window.cleanup=BB.mountBrainBox(document.querySelector("main"));mount();</script></body></html>';
const server = http.createServer((req, res) => {
  const route = new URL(req.url, "http://localhost").pathname;
  if (route === "/store-probe") {
    res.setHeader("Content-Type", "text/html");
    return res.end(probe);
  }
  const file = path.resolve(app, "." + route);
  if (!file.startsWith(app + path.sep) || !fs.existsSync(file)) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader(
    "Content-Type",
    path.extname(file) === ".js"
      ? "text/javascript"
      : "application/octet-stream",
  );
  res.end(fs.readFileSync(file));
});
(async () => {
  if (!process.env.BASE_URL)
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  });
  try {
    const context = await browser.newContext(),
      page = await context.newPage();
    page.setDefaultTimeout(5000);
    page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
    const base =
      process.env.BASE_URL || `http://127.0.0.1:${server.address().port}/`;
    const url = new URL("store-probe", base.endsWith("/") ? base : base + "/")
      .href;
    await context.route(url, (route) =>
      route.fulfill({ contentType: "text/html", body: probe }),
    );
    await page.goto(url);
    await page.waitForFunction(() => window.Store && window.BB);
    await page.locator("[data-enter]").click();
    await page
      .locator('[name="situation"]')
      .fill("Una gestión cotidiana por compartir");
    await page
      .locator('[name="bb_siento"]')
      .fill("Me siento cargada de tareas");
    await page.locator('[data-stage="1"]').click();
    await page.locator('[name="bb_actuo"]').fill("Me apresuro");
    await page.locator('[name="bb_pienso"]').fill("Puedo acordar un paso");
    await page.locator('[data-stage="3"]').click();
    await page
      .locator('[name="bb_saber"]')
      .fill("Todavía no he confirmado disponibilidad");
    ok(
      "A draft is in sessionStorage before navigation",
      await page.evaluate(() =>
        JSON.parse(
          sessionStorage.getItem(Store.SESSION_KEY),
        ).workspace.drafts.brainbox.new.draft.bb_saber.includes(
          "disponibilidad",
        ),
      ),
    );
    ok(
      "Default draft never opts into device storage",
      await page.evaluate(
        () => localStorage.getItem(Store.KEY) === null && !Store.isPersistent(),
      ),
    );
    await page.reload();
    await page.waitForFunction(() => window.Store && window.BB);
    ok(
      "Real browser reload resumes stage3",
      (await page.locator('[data-stage="3"]').getAttribute("aria-current")) ===
        "step",
    );
    ok(
      "All SAP fields survive reload",
      await page.evaluate(() => {
        const d = Store.get().drafts.brainbox.new.draft;
        return (
          d.bb_siento === "Me siento cargada de tareas" &&
          d.bb_actuo === "Me apresuro" &&
          d.bb_pienso === "Puedo acordar un paso"
        );
      }),
    );
    ok(
      "Visible draft answer survives reload",
      (await page.locator('[name="bb_saber"]').inputValue()) ===
        "Todavía no he confirmado disponibilidad",
    );
    ok(
      "Recovery label is accurate",
      await page
        .locator(".bb-local")
        .innerText()
        .then((t) => t.includes("recargar")),
    );
    const second = await context.newPage();
    await second.goto(url);
    await second.waitForFunction(() => window.Store);
    ok(
      "A separate tab has no implicit access to session-only draft",
      await second.evaluate(
        () => Object.keys(Store.get().drafts.brainbox).length === 0,
      ),
    );
    await second.close();
    await page.evaluate(() => Store.enable());
    const deviceTab = await context.newPage();
    await deviceTab.goto(url);
    await deviceTab.waitForFunction(() => window.Store);
    ok(
      "Explicit device opt-in makes the draft recoverable between visits",
      await deviceTab.evaluate(
        () =>
          Store.isPersistent() &&
          Store.get().drafts.brainbox.new.draft.bb_saber.includes(
            "disponibilidad",
          ),
      ),
    );
    await deviceTab.close();
    await page.evaluate(() => Store.disable());
    ok(
      "Disabling device storage retains session draft",
      await page.evaluate(
        () =>
          localStorage.getItem(Store.KEY) === null &&
          Store.getStorageStatus().mode === "session",
      ),
    );
    await page.evaluate(() => {
      const restored = Store.fresh();
      restored.drafts.brainbox.new = {
        draft: {
          bb_siento: "Borrador de la copia restaurada",
          status: "propuesto",
        },
        stage: 0,
        entered: true,
      };
      Store.restore(restored);
      cleanup();
      mount();
    });
    ok(
      "Old mounted component cleanup cannot overwrite restored draft",
      (await page.locator('[name="bb_siento"]').inputValue()) ===
        "Borrador de la copia restaurada",
    );
    ok(
      "Restored draft is stored for reload",
      await page.evaluate(
        () =>
          JSON.parse(sessionStorage.getItem(Store.SESSION_KEY)).workspace.drafts
            .brainbox.new.draft.bb_siento === "Borrador de la copia restaurada",
      ),
    );
    await page.locator('[name="bb_siento"]').fill("Cambio antes del borrado");
    await page.evaluate(() => {
      Store.reset();
      cleanup();
    });
    ok(
      "Mounted component cleanup cannot recreate a deleted workspace",
      await page.evaluate(
        () =>
          sessionStorage.getItem(Store.SESSION_KEY) === null &&
          localStorage.getItem(Store.KEY) === null &&
          Object.keys(Store.get().drafts.brainbox).length === 0,
      ),
    );
    const result = {
      checkedAt: new Date().toISOString(),
      passed: tests.length,
      tests,
    };
    fs.writeFileSync(
      path.resolve(app, "../qa/store-browser.json"),
      JSON.stringify(result, null, 2) + "\n",
    );
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
  server.close();
});
