/* Run with a normal Playwright install, or set PLAYWRIGHT_MODULE to its module path.
 * Optional CHROME_PATH selects a browser executable; otherwise Playwright Chromium is used.
 * Optional BASE_URL tests a running app, including a subdirectory such as /CareLab/.
 * Without BASE_URL this script starts an ephemeral localhost static server.
 * All state is synthetic in an isolated browser context; no feedback API is used. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const app = path.resolve(__dirname, "..");
let server, browser;
async function run() {
  if (!process.env.BASE_URL) {
    server = http.createServer((req, res) => {
      const route = new URL(req.url, "http://localhost").pathname;
      const file = path.resolve(app, "." + decodeURIComponent(route));
      if (
        !file.startsWith(app + path.sep) ||
        !fs.existsSync(file) ||
        !fs.statSync(file).isFile()
      ) {
        res.statusCode = 404;
        res.end();
        return;
      }
      res.setHeader(
        "Content-Type",
        {
          ".js": "text/javascript",
          ".json": "application/json",
          ".html": "text/html",
        }[path.extname(file)] || "application/octet-stream",
      );
      fs.createReadStream(file).pipe(res);
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
  }
  const origin =
    process.env.BASE_URL || `http://127.0.0.1:${server.address().port}/`;
  const base = new URL(origin.endsWith("/") ? origin : origin + "/");
  const qaURL = new URL("_journey_qa", base).href;
  const modules = {
    store: new URL("assets/v2/store.js", base).href,
    journey: new URL("assets/v3/journey.js", base).href,
  };
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [],
    checks = [];
  page.setDefaultTimeout(6000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(qaURL, (r) =>
    r.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="es"><body><main id="test"></main></body></html>',
    }),
  );
  await page.goto(qaURL);
  await page.evaluate(async (urls) => {
    window.Store = await import(urls.store);
    window.J = await import(urls.journey);
    window.audioCalls = [];
    window.planCalls = 0;
    window.notifications = [];
    window.reviewCalls = [];
    window.options = {
      Store,
      notify: (t) => notifications.push(t),
      readText: (...a) => audioCalls.push(a),
      onAction: async (a) => {
        planCalls++;
        await new Promise((r) => setTimeout(r, 30));
        const i = Store.get().actions.findIndex((x) => x.id === a.id);
        if (i < 0) Store.get().actions.push(a);
        else Store.get().actions[i] = a;
        Store.save();
        return a;
      },
      onReview: (...a) => reviewCalls.push(a),
    };
    window.cleanup = J.mountLivingJourney(
      document.getElementById("test"),
      options,
    );
  }, modules);
  async function check(n, fn) {
    await fn();
    checks.push(n);
    console.log("PASS " + n);
  }
  async function choice(name, value) {
    await page
      .locator(`[data-choice="${name}"][data-value="${value}"]`)
      .click();
  }
  const next = () => page.locator("[data-next]").click();
  await check(
    "unknown and inherited route IDs do not mutate the workspace",
    async () => {
      for (const id of ["constructor", "__proto__", "toString", "missing"]) {
        const before = await page.evaluate(() => JSON.stringify(Store.get()));
        await page.evaluate((id) => {
          cleanup();
          cleanup = J.mountLivingJourney(document.getElementById("test"), {
            ...options,
            id,
          });
        }, id);
        assert.equal(
          await page.locator("h1").textContent(),
          "No encontramos ese recorrido",
        );
        assert.equal(
          await page.evaluate(() => JSON.stringify(Store.get())),
          before,
        );
        await page.evaluate(() => Store.validate(Store.get()));
      }
      await page.evaluate(() => {
        cleanup();
        cleanup = J.mountLivingJourney(
          document.getElementById("test"),
          options,
        );
      });
    },
  );
  await check("scenario picker and scope before method", async () => {
    assert.equal(await page.locator("[data-scenario]").count(), 4);
    await page.locator('[data-scenario="relevo"]').click();
    assert.equal(await page.locator('[data-choice="scope"]').count(), 3);
    assert.equal(await page.locator('[data-choice="feeling"]').count(), 0);
    await choice("scope", "cotidiano");
    await next();
  });
  await check("audio only editorial two args", async () => {
    await page.locator("[data-read]").click();
    assert.equal((await page.evaluate(() => audioCalls[0])).length, 2);
    assert(!(await page.evaluate(() => audioCalls[0][1])).includes("Antes:"));
  });
  await choice("route", "apoyo");
  await next();
  await page.locator('[data-choice="feeling"]').first().click();
  await next();
  await page.locator('[data-choice="automatic"]').first().click();
  await next();
  await page.locator('[data-choice="thought"]').first().click();
  await next();
  await check("example contrast corrective and not a score", async () => {
    await choice("c0", "supuesto");
    assert(
      (await page.locator(".lv-feedback").textContent()).includes(
        "respuesta concreta",
      ),
    );
    await choice("c0", "hecho");
    assert.equal(
      await page
        .locator('[data-choice="c0"][data-value="hecho"]')
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      await page.evaluate(() => document.activeElement.dataset.value),
      "hecho",
    );
    await page.locator("[data-example-next]").click();
    await choice("c1", "supuesto");
    await page.locator("[data-example-next]").click();
    await choice("c2", "experiencia");
    await page.locator("[data-example-next]").click();
    assert.equal(
      await page.evaluate(
        () => Store.get().journey.sessions[0].fields.before_observation,
      ),
      undefined,
    );
  });
  await check(
    "Saber reversible; example not imported as personal fact",
    async () => {
      await page.locator('[data-choice="before_observation"]').first().click();
      await page.locator('[data-knowledge="1"]').click();
      assert.equal(
        await page.evaluate(
          () => Store.get().journey.sessions[0].fields.knowledge_level,
        ),
        "1",
      );
      await page.locator('[data-knowledge="-1"]').click();
      assert.equal(
        await page.evaluate(
          () => Store.get().journey.sessions[0].fields.knowledge_level,
        ),
        "0",
      );
      await next();
    },
  );
  await check(
    "mini rehearsal gives feedback and remains only rehearsal",
    async () => {
      await choice("rehearsal_choice", "0");
      assert(
        (await page.locator(".lv-feedback").textContent()).includes(
          "adivinarlas",
        ),
      );
      await choice("rehearsal_choice", "1");
      await page.locator('[data-choice="barrier"]').first().click();
      await next();
      assert.equal(await page.evaluate(() => Store.get().actions.length), 0);
    },
  );
  await next();
  await next();
  await choice("story_mode", "hechos");
  await check(
    "save double click creates single planned action and linked episode",
    async () => {
      await page.locator("[data-plan-save]").evaluate((b) => {
        b.click();
        b.click();
      });
      await page.waitForSelector("[data-copy]");
      const x = await page.evaluate(() => ({
        calls: planCalls,
        actions: Store.get().actions,
        s: Store.get().journey.sessions[0],
      }));
      assert.equal(x.calls, 1);
      assert.equal(x.actions.length, 1);
      assert.equal(x.actions[0].status, "propuesto");
      assert.equal(x.s.status, "planned");
      assert.equal(Object.keys(x.actions[0].fields).length <= 30, true);
      assert.equal(x.s.actionId, x.actions[0].id);
      assert.equal(
        await page.locator(".lv-related a").getAttribute("href"),
        "#/recursos/reparto",
      );
    },
  );
  await check(
    "return allowed immediately without invented success",
    async () => {
      await page.evaluate(() => {
        cleanup();
        cleanup = J.mountLivingReturn(document.getElementById("test"), {
          ...options,
          id: Store.get().journey.sessions[0].id,
        });
      });
      await choice("return_done", "no");
      await next();
      await page.locator('[data-choice="return_observation"]').last().click();
      await page.selectOption('[name="return_source"]', "no_visto");
      await next();
      await choice("return_worth", "incierto");
      await page.selectOption(
        '[name="return_cost"]',
        "No tengo información suficiente sobre los costes.",
      );
      await next();
      await page.locator('[data-choice="return_attribution"]').last().click();
      await next();
      assert.equal(
        await page.locator('[data-choice="turn1"]:visible').count(),
        0,
      );
      await next();
      await choice("decision", "pausar");
      await page
        .getByText("Mi relato: mirarlo de otra manera, si me sirve", {
          exact: true,
        })
        .click();
      await choice("narrative_mode", "explorar");
      for (const [key, title, value] of [
        ["reframe", "Reencuadrar · cambiar la pregunta", "peticion"],
        ["context", "Recontextualizar · mirar las condiciones", "condiciones"],
        ["meaning", "Resignificar · proponer un sentido provisional", "ensayo"],
      ]) {
        await page.getByText(title, { exact: true }).click();
        await choice("narrative_" + key, value);
      }
      const selected = await page.evaluate(
        () => Store.get().journey.sessions[0].fields,
      );
      assert.equal(selected.narrative_reframe, "peticion");
      assert.equal(selected.narrative_context, "condiciones");
      assert.equal(selected.narrative_meaning, "ensayo");
      await page.locator("[data-return-save]").evaluate((b) => {
        b.click();
        b.click();
      });
      assert.equal(await page.evaluate(() => Store.get().reviews.length), 1);
      const r = await page.evaluate(() => Store.get().reviews[0]);
      assert.equal(r.result, "No pude probarlo");
      assert.equal(r.fields.bb_disponibilidad, "No ocurrió");
      assert(r.fields.bb_relato.includes("Reencuadre:"));
      assert(r.fields.bb_relato.includes("Recontextualización:"));
      assert(r.fields.bb_relato.includes("Resignificación:"));
      assert.equal(
        await page
          .getByText("La lectura provisional que he conservado", {
            exact: true,
          })
          .count(),
        1,
      );
      assert.equal(
        await page.evaluate(() => Store.get().actions[0].status),
        "pausado",
      );
      assert.equal(
        await page.locator(".lv-related a").getAttribute("href"),
        "#/recursos/reparto",
      );
    },
  );
  await check(
    "reopen return edits original rather than duplicate",
    async () => {
      await page.locator("[data-back]").click();
      await choice("decision", "indagar");
      await page.locator("[data-return-save]").click();
      assert.equal(await page.evaluate(() => Store.get().reviews.length), 1);
      assert.equal(
        await page.evaluate(() => Store.get().reviews[0].next),
        "Buscar un dato que falta",
      );
    },
  );
  await check(
    "correcting a return recomputes action status without duplicating review",
    async () => {
      for (const [done, status] of [
        ["hecho", "realizado"],
        ["no", "propuesto"],
      ]) {
        for (let i = 0; i < 6; i++) await page.locator("[data-back]").click();
        await choice("return_done", done);
        for (let i = 0; i < 5; i++) await next();
        await choice("decision", "indagar");
        await page.locator("[data-return-save]").click();
        assert.equal(
          await page.evaluate(() => Store.get().actions[0].status),
          status,
        );
        assert.equal(await page.evaluate(() => Store.get().reviews.length), 1);
      }
    },
  );
  await check(
    "new loop creates a different episode and changes route",
    async () => {
      const previous = await page.evaluate(() => Store.get().journey.currentId);
      await page.locator("[data-new-loop]").click();
      const x = await page.evaluate(() => ({
        hash: location.hash,
        j: Store.get().journey,
      }));
      assert.equal(x.j.sessions.length, 2);
      assert.notEqual(x.j.currentId, previous);
      assert.equal(x.hash, "#/vivir/" + x.j.currentId);
      const fresh = x.j.sessions.find((s) => s.id === x.j.currentId);
      assert(
        fresh.fields.previous_narrative.includes(
          "no son observaciones ni explicaciones verificadas",
        ),
      );
      assert(!fresh.fields.before_observation.includes("Reencuadre:"));
    },
  );
  await check(
    "persisted state validates and no example enters factual baseline",
    async () => {
      const x = await page.evaluate(() => {
        const v = Store.validate(Store.get());
        return JSON.stringify(v);
      });
      assert(!x.includes("Alex"));
      assert(!x.includes("jueves"));
    },
  );
  await check("STOP then no method exercise", async () => {
    await page.evaluate(() => {
      cleanup();
      cleanup = J.mountLivingJourney(document.getElementById("test"), {
        ...options,
        id: "limites",
      });
    });
    await choice("scope", "urgente");
    await next();
    assert((await page.locator("h1").textContent()).includes("ayuda"));
    assert.equal(await page.locator('[data-choice="feeling"]').count(), 0);
    assert.equal(await page.locator("[data-next]").count(), 0);
  });
  await check(
    "STOP survives remount and requires delimiting again",
    async () => {
      await page.evaluate(() => {
        const id = Store.get().journey.currentId;
        cleanup();
        cleanup = J.mountLivingJourney(document.getElementById("test"), {
          ...options,
          id,
        });
      });
      assert.equal(await page.locator("[data-next]").count(), 0);
      assert.equal(await page.locator('[data-choice="feeling"]').count(), 0);
      await page.locator("[data-rescope]").click();
      assert.equal(await page.locator('[data-choice="scope"]').count(), 3);
      assert.equal(
        await page.evaluate(
          () =>
            Store.get().journey.sessions.find(
              (x) => x.id === Store.get().journey.currentId,
            ).fields.scope,
        ),
        "",
      );
    },
  );
  await check(
    "withheld observations stay out of cycle, narrative summary and next baseline",
    async () => {
      await page.evaluate(() => {
        const first = Store.get().journey.sessions[0];
        first.returnStep = 4;
        Object.assign(first.fields, {
          return_done: "reservado",
          return_source: "reservado",
          return_observation: "PRIVATE_QA_OBSERVATION_NOT_TO_REDISPLAY",
        });
        Store.save();
        cleanup();
        cleanup = J.mountLivingReturn(document.getElementById("test"), {
          ...options,
          id: first.id,
        });
      });
      assert(
        !(await page.locator("#test").textContent()).includes(
          "PRIVATE_QA_OBSERVATION_NOT_TO_REDISPLAY",
        ),
      );
      await next();
      await page
        .getByText("Mi relato: mirarlo de otra manera, si me sirve", {
          exact: true,
        })
        .click();
      assert(
        !(await page.locator("#test").textContent()).includes(
          "PRIVATE_QA_OBSERVATION_NOT_TO_REDISPLAY",
        ),
      );
      await page.locator("[data-return-save]").click();
      await page.locator("[data-new-loop]").click();
      const observation = await page.evaluate(
        () =>
          Store.get().journey.sessions.find(
            (x) => x.id === Store.get().journey.currentId,
          ).fields.before_observation,
      );
      assert.equal(observation, "");
      await page.evaluate(() => Store.validate(Store.get()));
    },
  );
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks: checks.length, errors }));
}
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    if (server) await new Promise((resolve) => server.close(resolve));
  });
