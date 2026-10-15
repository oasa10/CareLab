/* Test the prepared library in an isolated browser, including a deployment prefix.
 * PLAYWRIGHT_MODULE and CHROME_PATH may select a local test runtime/browser.
 * Uses synthetic state, localhost only, and never follows external source links. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { createHash } = require("node:crypto");
const app = path.resolve(__dirname, "..");
const libraryBytes = fs.readFileSync(path.join(app, "data/biblioteca.json"));
const libraryHash = createHash("sha256").update(libraryBytes).digest("hex");
const expected = JSON.parse(libraryBytes);
const release = fs.readFileSync(path.join(app, "sw.js"), "utf8").match(/const RELEASE = "([^"]+)"/)[1];
const checks = [];
let server, browser;

async function run() {
  server = http.createServer((req, res) => {
    const route = new URL(req.url, "http://localhost").pathname;
    if (!route.startsWith("/CareLab/")) { res.writeHead(404).end(); return; }
    let relative = decodeURIComponent(route.slice("/CareLab/".length));
    if (!relative) relative = "index.html";
    const file = path.resolve(app, relative);
    if (!file.startsWith(app + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end(); return;
    }
    res.setHeader("Content-Type", ({ ".js": "text/javascript", ".json": "application/json", ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" })[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}/CareLab/`;
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "index.html#/ficha/ct-b058");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Marco IDDSI"));
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
  });
  const status = await page.evaluate(() => new Promise(resolve => {
    const channel = new MessageChannel();
    channel.port1.onmessage = event => resolve(event.data);
    navigator.serviceWorker.controller.postMessage({ type: "OFFLINE_STATUS" }, [channel.port2]);
  }));
  assert.equal(status.coreReady, true);
  assert.equal(status.version, release);
  checks.push("prepared current complete cache under /CareLab/");
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Marco IDDSI"));
  const offline = await page.evaluate(async () => {
    const bytes = await (await fetch("data/biblioteca.json")).arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return { hash: [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2,"0")).join(""), data: JSON.parse(new TextDecoder().decode(bytes)) };
  });
  assert.equal(offline.hash, libraryHash);
  assert.deepEqual(offline.data.items.map(x => x.id), expected.items.map(x => x.id));
  assert.equal(offline.data.items.length, 1087);
  checks.push("offline reload serves identical library and 1,087 IDs");
  const iddsi = offline.data.items.find(x => x.id === "ct-b058");
  assert(iddsi.links.some(x => x.title.includes("definiciones 2.2") && x.title.includes("prueba 2.0")));
  assert(iddsi.body.some(x => x.label.includes("IDDSI 2.0") && x.text.includes("referencia histórica")));
  const iddsiLabel = await page.locator('a[href="https://www.iddsi.org/resources/framework-documents"]').textContent();
  assert(iddsiLabel.includes("definiciones 2.2"));
  checks.push("offline UI distinguishes historical IDDSI citation and current alternative");
  await page.goto(base + "index.html#/ficha/ct-d044");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("System Usability Scale"));
  assert.equal(await page.locator('a[href*="JUS_Brooke_February_2013.pdf"]').count(), 0);
  assert((await page.locator("body").textContent()).includes("SUS A Retrospective"));
  checks.push("withdrawn SUS link is absent while its citation remains visible");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks, release, library_sha256: libraryHash, browser_errors: errors }, null, 2));
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});
