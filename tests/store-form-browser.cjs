/* NODE_PATH=<node_modules with playwright> node tests/store-form-browser.cjs
 * Optional PLAYWRIGHT_MODULE, CHROME_PATH, BASE_URL. Defaults to installed playwright/Chromium.
 * Isolated browser and synthetic data; BASE_URL may select another app server. */
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
const probe = `<!doctype html><html><body><main></main><script type="module">
window.Store=await import('./assets/v2/store.js');window.Forms=await import('./assets/v3/form-drafts.js');Forms.installFormDrafts();
window.openForm=(kind='person',context='new')=>{document.querySelector('main').innerHTML=kind==='person'?'<form id="person-form"><input name="name" value="Valor previo del registro"><textarea name="help"></textarea><textarea name="availability"></textarea><input type="checkbox" name="accepted"><button>Guardar</button></form>':'<form id="review-form"><textarea name="note"></textarea><select name="origin"><option value="declarado">Declarado</option><option value="verificado">Verificado</option></select><textarea name="verification"></textarea><button>Guardar</button></form>';const f=document.querySelector('form');f.dataset.draftContext=context;f.onsubmit=e=>e.preventDefault();return f;};
openForm();window.ready=true;</script></body></html>`;
const server = http.createServer((req, res) => {
  const route = new URL(req.url, "http://localhost").pathname;
  if (route === "/probe") {
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
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    const base =
      process.env.BASE_URL || `http://127.0.0.1:${server.address().port}/`;
    const url = new URL("probe", base.endsWith("/") ? base : base + "/").href;
    await page.route(url, (route) =>
      route.fulfill({ contentType: "text/html", body: probe }),
    );
    await page.goto(url);
    await page.waitForFunction(() => window.ready);
    await page.locator("[data-form-draft-status]").waitFor();
    ok(
      "No blank draft overwrites generated initial values",
      (await page.locator("[name=name]").inputValue()) ===
        "Valor previo del registro" &&
        (await page.evaluate(
          () => Object.keys(Store.get().drafts.forms).length === 0,
        )),
    );
    await page.locator("[name=name]").fill("Hermana");
    await page.locator("[name=help]").fill("Acordar una tarea");
    await page.locator("[name=accepted]").check();
    await page.locator("[name=accepted]").uncheck();
    await page.reload();
    await page.waitForFunction(() => window.ready);
    await page.locator("[data-form-draft-status]").waitFor();
    ok(
      "Modal draft survives browser reload and reopening",
      (await page.locator("[name=name]").inputValue()) === "Hermana" &&
        (await page.locator("[name=help]").inputValue()) ===
          "Acordar una tarea",
    );
    ok(
      "Unchecked availability remains false",
      !(await page.locator("[name=accepted]").isChecked()),
    );
    await page.evaluate(() => openForm("person", "other"));
    await page.locator("[data-form-draft-status]").waitFor();
    ok(
      "Different support contexts do not share draft fields",
      (await page.locator("[name=name]").inputValue()) ===
        "Valor previo del registro",
    );
    await page.locator("[name=name]").fill("Compañero");
    await page.evaluate(() => openForm("review", "action-1"));
    await page.locator("[data-form-draft-status]").waitFor();
    await page.locator("[name=note]").fill("Aún no lo hemos observado");
    await page.locator("[name=origin]").selectOption("verificado");
    await page
      .locator("[name=verification]")
      .fill("Procedimiento pendiente de contrastar");
    await page.evaluate(() => openForm("review", "action-2"));
    await page.locator("[data-form-draft-status]").waitFor();
    ok(
      "Reviews remain separated by action",
      (await page.locator("[name=note]").inputValue()) === "",
    );
    await page.evaluate(() => openForm("review", "action-1"));
    await page.locator("[data-form-draft-status]").waitFor();
    ok(
      "Return choices and conditional requirement recover together",
      (await page.locator("[name=origin]").inputValue()) === "verificado" &&
        (await page.locator("[name=verification]").getAttribute("required")) !==
          null &&
        (await page.locator("[name=note]").inputValue()) ===
          "Aún no lo hemos observado",
    );
    await page.evaluate(() => {
      Forms.clearFormDraft(document.querySelector("form"));
      Store.save();
    });
    await page.locator("[name=note]").fill("Late event");
    ok(
      "Successful clear cannot resurrect a submitted draft",
      await page.evaluate(() => !Store.get().drafts.forms["review/action-1"]),
    );
    await page.evaluate(() => {
      openForm("person", "other");
    });
    await page.locator("[data-form-draft-status]").waitFor();
    await page.evaluate(() => {
      const imported = Store.fresh();
      imported.drafts.forms["person/other"] = { name: "Copia restaurada" };
      Store.restore(imported);
    });
    await page.locator("[name=name]").fill("Evento antiguo");
    ok(
      "Old modal cannot overwrite a restored workspace",
      await page.evaluate(
        () =>
          Store.get().drafts.forms["person/other"].name === "Copia restaurada",
      ),
    );
    await page.evaluate(() => {
      document.querySelector("main").innerHTML =
        '<form id="feedback-form" data-draft-context="new"><textarea name="message"></textarea></form>';
    });
    await page.locator("[name=message]").fill("Sólo formulario de opiniones");
    ok(
      "Feedback text never enters workspace drafts",
      await page.evaluate(
        () =>
          Object.keys(Store.get().drafts.forms).every(
            (k) => !k.includes("feedback"),
          ) && document.querySelector("[data-form-draft-status]") === null,
      ),
    );
    await page.evaluate(() => {
      openForm("person", "quota");
    });
    await page.locator("[data-form-draft-status]").waitFor();
    await page.evaluate(() => {
      Storage.prototype.setItem = function () {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      };
    });
    await page.locator("[name=name]").fill("Texto aún en pantalla");
    ok(
      "Quota failure preserves live text and gives an accurate warning",
      (await page.locator("[name=name]").inputValue()) ===
        "Texto aún en pantalla" &&
        (await page
          .locator("[data-form-draft-status]")
          .innerText()
          .then((t) => t.includes("exporta"))) &&
        (await page.evaluate(
          () => Store.getStorageStatus().hasUnstoredChanges,
        )),
    );
    const result = {
      checkedAt: new Date().toISOString(),
      passed: tests.length,
      tests,
    };
    fs.writeFileSync(
      path.resolve(app, "../qa/store-form-browser.json"),
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
