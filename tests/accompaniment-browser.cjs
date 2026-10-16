/* Real-page group and local evaluation flows. Synthetic data, isolated browser;
 * no external feedback requests, personal browser profile or network publishing. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const app = path.resolve(__dirname, '..');
let server, browser;
const checks = [], errors = [], requests = [];
async function run() {
  server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(app, '.' + pathname);
    if (!file.startsWith(app + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end(); return;
    }
    res.setHeader('Content-Type', ({'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  const context = await browser.newContext({reducedMotion:'reduce',colorScheme:'light',viewport:{width:390,height:844},acceptDownloads:true});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => requests.push({url:r.url(),method:r.method()}));
  const base = `http://127.0.0.1:${server.address().port}/`;
  async function check(name, fn) { await fn(); checks.push(name); console.log('PASS ' + name); }
  async function navigate(route, selector) {
    await page.evaluate(route => { location.hash = '#/' + route; }, route);
    await page.locator(selector).first().waitFor();
  }
  const state = async () => page.evaluate(async () => {
    const Store = await import('./assets/v2/store.js');
    return {workspace:JSON.stringify(Store.get()), session:sessionStorage.getItem(Store.SESSION_KEY), device:localStorage.getItem(Store.KEY)};
  });
  await page.goto(base+'#/grupo');
  await page.locator('[data-case]').first().waitFor();
  await page.evaluate(async () => {
    const Store = await import('./assets/v2/store.js');
    Store.get().profile = 'familia';
    Store.get().reflections.u01 = 'CONTROL_PRIVADO_NO_PROYECTAR';
    Store.save();
    window.print = () => { window.printCalled = true; };
  });
  const baseline = await state();
  await check('Integrated group is a preparation demonstration and never reveals saved notes', async () => {
    assert.equal(await page.locator('link[href="assets/v3/accompaniment.css"]').count(),1);
    assert.match(await page.locator('.ac-status-note').innerText(),/revisión clínica está pendiente/);
    assert.equal(await page.locator('[data-case]').count(),4);
    assert.equal((await page.locator('main').innerText()).includes('CONTROL_PRIVADO_NO_PROYECTAR'),false);
    assert.equal(await page.locator('main input,main textarea').count(),0);
  });
  await check('Four fictional cases complete without reading or changing the personal workspace', async () => {
    for(const id of ['relevo','mente','pausa','limites']) {
      await page.locator(`[data-case="${id}"]`).click();
      for(let n=0;n<4;n++) await page.locator('[data-group-next]').click();
      await page.locator('[data-group-print]').click();
      assert.equal(await page.locator('.ac-print-sheet').count(),1);
      assert.equal((await page.locator('.ac-print-sheet').innerText()).includes('CONTROL_PRIVADO_NO_PROYECTAR'),false);
      await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      await page.getByRole('button',{name:'Terminar demostración',exact:true}).click();
      assert.deepEqual(await state(),baseline);
    }
  });
  await check('Four optional feedback answers stay local and remain editable', async () => {
    await navigate('feedback','.ac-evaluation');
    for(const choice of ['Sí, bastante','Leer o escuchar','Un poco']) {
      await page.getByLabel(choice,{exact:true}).check();
      await page.getByRole('button',{name:'Continuar',exact:true}).click();
    }
    await page.locator('#ac-improvement').fill('Un enlace <seguro> y texto de prueba.');
    await page.getByRole('button',{name:'Revisar mis respuestas',exact:true}).click();
    assert.equal(await page.locator('.ac-answer-list dd').last().innerText(),'Un enlace <seguro> y texto de prueba.');
    await page.locator('[data-eval-prev]').click();
    assert.equal(await page.locator('#ac-improvement').inputValue(),'Un enlace <seguro> y texto de prueba.');
    await page.getByRole('button',{name:'Revisar mis respuestas',exact:true}).click();
    assert.deepEqual(await state(),baseline);
  });
  await check('Explicit feedback exports contain only questionnaire answers', async () => {
    const download = page.waitForEvent('download');
    await page.locator('[data-eval-download]').click();
    const output = await download;
    assert.equal(output.suggestedFilename(),'CareLab-mi-experiencia.txt');
    const stream = await output.createReadStream();
    let text = ''; for await (const chunk of stream) text += chunk.toString();
    assert.match(text,/Un enlace <seguro>/);
    assert.doesNotMatch(text,/CONTROL_PRIVADO_NO_PROYECTAR/);
    await page.locator('[data-eval-print]').click();
    assert.equal(await page.locator('.ac-print-sheet').count(),1);
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    await page.locator('[data-eval-copy]').click();
    await page.waitForFunction(()=>document.querySelector('[data-ac-status]').textContent.length>0);
    assert.deepEqual(await state(),baseline);
  });
  await check('Leaving feedback erases its transient draft but keeps the workspace intact', async () => {
    await navigate('profundizar','.ac-shell h1');
    assert.equal(await page.locator('.ac-answer-list').count(),0);
    assert.equal(await page.locator('.ac-print-sheet').count(),0);
    assert.equal(await page.locator('main a[href="#/vivir"]').count(),1);
    assert.equal(await page.locator('.bb-shell').count(),0);
    await navigate('feedback','.ac-evaluation');
    assert.equal(await page.locator('main input:checked').count(),0);
    assert.equal(await page.locator('#ac-improvement').count(),0);
    for(let n=0;n<4;n++) await page.locator('[data-eval-skip]').click();
    assert.deepEqual(await page.locator('.ac-answer-list dd').allTextContents(),Array(4).fill('Sin responder'));
    await page.locator('[data-eval-clear]').click();
    assert.equal(await page.locator('main input:checked').count(),0);
    assert.deepEqual(await state(),baseline);
  });
  await check('New pages reflow in small/mobile/tablet/desktop sizes and both themes', async () => {
    for(const width of [320,390,768,1440])for(const theme of ['light','dark'])for(const route of ['grupo','feedback','profundizar']) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; },theme);
      await navigate(route,'.ac-shell');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${theme} ${route}`);
    }
    assert.deepEqual(await state(),baseline);
  });
  await check('No feedback network traffic, JavaScript failures or persistent corruption', async () => {
    assert.deepEqual(errors,[]);
    assert.equal(requests.some(r=>r.method!=='GET'),false);
    assert.equal(requests.some(r=>!r.url.startsWith(base)),false);
    assert.deepEqual(await state(),baseline);
  });
  console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server?.close();});
