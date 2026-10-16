/* Real-page checks for fixed help, ephemeral directory choices and narrow layouts. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const app = path.resolve(__dirname, '..');
let server, browser;
const checks = [], errors = [], externalRequests = [];

async function run() {
  server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(app, '.' + pathname);
    if (!file.startsWith(app + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream');
    const send = () => fs.createReadStream(file).pipe(res);
    if (pathname.endsWith('/data/apoyos.json')) setTimeout(send, 150); else send();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light', viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const base = `http://127.0.0.1:${server.address().port}/`;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (!request.url().startsWith(base)) externalRequests.push(request.url()); });
  const check = async (name, fn) => { await fn(); checks.push(name); console.log('PASS ' + name); };
  const route = async (hash, selector = '.support-shell') => {
    await page.evaluate((value) => new Promise((resolve) => {
      location.hash = '#/' + value;
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }), hash);
    await page.locator(selector).first().waitFor();
  };
  const saved = () => page.evaluate(() => ({ session: { ...sessionStorage }, local: { ...localStorage } }));
  await page.goto(base + '#/ayuda');
  await page.locator('.support-shell').waitFor();
  await check('Urgency is visible on direct arrival, without forms or exercise prerequisites', async () => {
    assert.equal(await page.locator('.support-urgent a').getAttribute('href'), 'tel:112');
    assert.equal(await page.locator('main input,main textarea,main form').count(), 0);
    assert(await page.locator('link[href="assets/v3/support.css"]').count());
    assert.equal(await page.locator('.support-choices a').count(), 7);
  });
  const initialStorage = await saved();
  await check('All seven help choices resolve and clean telephone URIs preserve the urgent exit', async () => {
    for (const id of ['suicidio', 'control', 'violencia', 'menores', 'agotamiento', 'salud', 'practico']) {
      await route('ayuda/' + id, '#support-topic-title');
      assert.equal(await page.locator('.support-urgent a').getAttribute('href'), 'tel:112');
      assert.equal(await page.locator('main input,main textarea,main form').count(), 0);
      for (const href of await page.locator('main a[href^="tel:"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) assert.match(href, /^tel:\d{3}(\d{6})?$/);
    }
    await route('ayuda/violencia', '#support-topic-title');
    await page.locator('.support-extra summary').click();
    assert.equal(await page.locator('a[href="tel:900840111"]').count(), 1);
    assert.equal(await page.locator('a[href="https://wa.me/34600000016"]').count(), 1);
  });
  await check('A late local directory response cannot repaint a different route', async () => {
    await route('apoyos');
    await route('ayuda');
    await page.waitForTimeout(220);
    assert.equal(await page.locator('.support-choices').count(), 1);
    assert.equal(await page.locator('.support-regions').count(), 0);
  });
  await check('Territory switches are local, render verified sources and keep selection ephemeral', async () => {
    for (const region of ['euskadi', 'araba', 'bizkaia', 'gipuzkoa', 'espana', 'laboral']) {
      await route('apoyos/' + region, '.support-regions');
      await page.locator(`.support-regions a[href="#/apoyos/${region}"][aria-current]`).waitFor();
      assert(await page.locator('.support-resource').count());
      await page.locator('.support-resource > summary').first().click();
      assert.match(await page.locator('.support-resource-content a[href^="https:"]').first().getAttribute('href'), /^https:/);
    }
    assert.deepEqual(await saved(), initialStorage);
    assert.deepEqual(externalRequests, []);
  });
  await check('General procedures point to real tools and preserve legal timing and limitations', async () => {
    await route('tramites', '.support-procedures');
    assert.equal(await page.locator('.support-procedures details').count(), 5);
    await page.locator('.support-procedures details').nth(3).locator('summary').click();
    assert.equal(await page.locator('a[href="#/tool/economia"]').count(), 1);
    await page.locator('.support-verification summary').click();
    assert.match(await page.locator('.support-verification').textContent(), /23 de octubre de 2026/);
    assert.match(await page.locator('.support-verification').textContent(), /no significa que exista una prestación individual inmediata/);
  });
  await check('New and legacy workspaces keep markers off without deleting completed work', async () => {
    await route('ajustes', '#gamification');
    assert.equal(await page.locator('#gamification').isChecked(), false);
    await route('micamino', '.quiet-journal');
    assert.equal(await page.locator('.quiet-milestones').count(), 0);
    await route('programa', '.module-card');
    assert.equal(await page.locator('.module-card .progress').count(), 0);
    await route('logros', '.note');
    assert.equal(await page.locator('.badges').count(), 0);
    await page.evaluate(async () => {
      const Store = await import('./assets/v2/store.js');
      const legacy = Store.fresh();
      legacy.completed = ['u01', 'u11'];
      legacy.practice = ['reparto'];
      legacy.settings.gamification = true;
      delete legacy.settings.gamificationChoice;
      sessionStorage.setItem(Store.SESSION_KEY, JSON.stringify({ version: 1, mode: 'session', workspace: legacy }));
    });
    await page.reload();
    await page.locator('.note').first().waitFor();
    assert.equal(await page.locator('.badges').count(), 0);
    const state = await page.evaluate(async () => (await import('./assets/v2/store.js')).get());
    assert.equal(state.settings.gamification, false);
    assert.deepEqual(state.completed, ['u01', 'u11']);
    assert.deepEqual(state.practice, ['reparto']);
  });
  await check('Marker opt-in is explicit, survives reload and can be withdrawn without deleting work', async () => {
    await route('ajustes', '#gamification');
    assert.equal(await page.locator('#gamification').isChecked(), false);
    await page.locator('#gamification').check();
    await page.reload();
    await page.locator('#gamification').waitFor();
    assert.equal(await page.locator('#gamification').isChecked(), true);
    assert.equal(await page.evaluate(async () => (await import('./assets/v2/store.js')).get().settings.gamificationChoice), true);
    await route('micamino', '.quiet-journal');
    assert.equal(await page.locator('.quiet-milestones > li').count(), 4);
    await route('programa', '.module-card');
    assert.equal(await page.locator('.module-card .progress').count(), 12);
    await route('logros', '.badges');
    assert(await page.locator('.badge').count());
    await route('ajustes', '#gamification');
    await page.locator('#gamification').uncheck();
    await page.reload();
    await page.locator('#gamification').waitFor();
    assert.equal(await page.locator('#gamification').isChecked(), false);
    const state = await page.evaluate(async () => (await import('./assets/v2/store.js')).get());
    assert.deepEqual(state.completed, ['u01', 'u11']);
    assert.deepEqual(state.practice, ['reparto']);
  });
  await check('Sensitive units, glossary, guide and contingency share the same visible support notice', async () => {
    const expected = await page.evaluate(async () => (await import('./assets/v3/support.js')).SHARED_SUPPORT_NOTICE);
    for (const hash of ['unidad/u11', 'ficha/cp-a151', 'ficha/gu-ac06', 'tool/contingencia']) {
      await route(hash, '.library-safety');
      assert.equal(await page.locator('.library-safety p').textContent(), expected);
      assert.equal(await page.locator('.library-safety a').getAttribute('href'), '#/ayuda');
      if (hash.startsWith('ficha/')) assert.equal(await page.locator('.reading > .section.card.soft a').getAttribute('href'), '#/ayuda');
    }
  });
  await check('Help, directory and procedures reflow in light and dark, including large type at 320 px', async () => {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate((mode) => { document.documentElement.dataset.theme = mode; document.documentElement.classList.add('large-text'); }, theme);
        for (const hash of ['ayuda', 'ayuda/suicidio', 'ayuda/violencia', 'apoyos/euskadi', 'tramites']) {
          await route(hash, hash.startsWith('apoyos') ? '.support-regions' : '.support-shell');
          const geometry = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, urgent: document.querySelector('.support-urgent')?.getBoundingClientRect().toJSON() }));
          assert(geometry.scroll <= width + 1, JSON.stringify({ width, theme, hash, geometry }));
          if (geometry.urgent) assert(geometry.urgent.right <= width && geometry.urgent.left >= 0, JSON.stringify(geometry));
        }
      }
    }
  });
  await check('Prepared offline installation reloads emergency routes and the local directory', async () => {
    const offlineContext = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'allow' });
    const offlinePage = await offlineContext.newPage();
    offlinePage.on('pageerror', (error) => errors.push(error.message));
    await offlinePage.goto(base + '#/ayuda');
    await offlinePage.locator('.support-shell').waitFor();
    await offlinePage.evaluate(async () => {
      await navigator.serviceWorker.register('./sw.js');
      await navigator.serviceWorker.ready;
    });
    await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await offlineContext.setOffline(true);
    const contacts = { suicidio: '024', violencia: '016', menores: '900202010', salud: '900203050' };
    for (const [topic, number] of Object.entries(contacts)) {
      await offlinePage.goto(base + '#/ayuda/' + topic);
      await offlinePage.reload();
      await offlinePage.locator('#support-topic-title').waitFor();
      assert.equal(await offlinePage.locator('.support-urgent a').getAttribute('href'), 'tel:112');
      assert.equal(await offlinePage.locator(`main a[href="tel:${number}"]`).count(), 1);
    }
    await offlinePage.goto(base + '#/apoyos/euskadi');
    await offlinePage.reload();
    await offlinePage.locator('.support-regions').waitFor();
    assert.equal(await offlinePage.locator('.support-resource').count(), 4);
    await offlineContext.close();
  });
  assert.deepEqual(errors, []);
  const report = { status: 'passed', checks: checks.length, details: checks, errors, externalRequests };
  if (process.env.QA_OUTPUT) {
    fs.mkdirSync(process.env.QA_OUTPUT, { recursive: true });
    for (const [width, label] of [[390, 'movil'], [1440, 'ordenador']]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; document.documentElement.classList.remove('large-text'); });
      for (const [hash, suffix] of [['ayuda', 'ayuda'], ['ayuda/suicidio', 'contacto'], ['apoyos/euskadi', 'apoyos']]) {
        await route(hash, hash.startsWith('apoyos') ? '.support-regions' : '.support-shell');
        await page.screenshot({ path: path.join(process.env.QA_OUTPUT, `${suffix}_${label}.png`), fullPage: true, animations: 'disabled' });
      }
    }
    fs.writeFileSync(path.join(process.env.QA_OUTPUT, 'verificacion_apoyos.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report));
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server?.close(); });
