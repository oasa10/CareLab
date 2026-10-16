/* Accessible appearance menu, using the real page in an isolated browser. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const app = path.resolve(__dirname, '..');
let server, browser;
const checks = [], errors = [];
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
  const context = await browser.newContext({reducedMotion:'reduce',colorScheme:'light',viewport:{width:390,height:844}});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const base = `http://127.0.0.1:${server.address().port}/`;
  async function check(name, fn) { await fn(); checks.push(name); console.log('PASS ' + name); }
  async function mode(choice) {
    await page.locator('#theme-toggle').click();
    await page.locator(`[data-theme-mode="${choice}"]`).click();
  }
  await page.goto(base+'#/bienvenida');
  await page.locator('.quiet-arrival').waitFor();
  await check('Only an icon is visible; default follows system and exposes an accessible name',async()=>{
    assert.equal((await page.locator('#theme-toggle').textContent()).trim(),'');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-label'),'Cambiar aspecto. Actual: Sistema');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#theme-menu').isVisible(),false);
    await page.emulateMedia({colorScheme:'dark'});
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-label'),'Cambiar aspecto. Actual: Sistema');
  });
  await check('Keyboard opens the selected item, wraps focus and applies only a confirmed choice',async()=>{
    await page.locator('#theme-toggle').focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('[data-theme-mode="system"]').evaluate(e=>e===document.activeElement),true);
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.locator('[data-theme-mode="dark"]').evaluate(e=>e===document.activeElement),true);
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('[data-theme-mode="light"]').evaluate(e=>e===document.activeElement),true);
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
    assert.equal(await page.locator('#theme-toggle').evaluate(e=>e===document.activeElement),true);
    assert.equal(await page.locator('#theme-menu').isVisible(),false);
    await page.reload();await page.locator('.quiet-arrival').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
    assert.equal(await page.locator('#theme-toggle').getAttribute('aria-label'),'Cambiar aspecto. Actual: Claro');
  });
  await check('Escape, outside click and Tab close the menu without trapping focus',async()=>{
    await page.locator('#theme-toggle').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#theme-menu').isVisible(),false);
    assert.equal(await page.locator('#theme-toggle').evaluate(e=>e===document.activeElement),true);
    await page.locator('#theme-toggle').click();
    await page.mouse.click(4, 400);
    assert.equal(await page.locator('#theme-menu').isVisible(),false);
    await page.locator('#theme-toggle').click();
    await page.keyboard.press('Tab');
    await page.waitForFunction(()=>document.querySelector('#theme-menu').hidden);
    assert.equal(await page.locator('#font-toggle').evaluate(e=>e===document.activeElement),true);
  });
  await check('Header and Settings stay synchronized in all three modes, preserving other saved state',async()=>{
    await page.evaluate(async()=>{
      const Store=await import('./assets/v2/store.js');
      Store.get().profile='familia';Store.save();
    });
    await page.goto(base+'#/ajustes');await page.locator('[data-theme-choice]').waitFor();
    for(const choice of ['dark','system','light']) {
      await mode(choice);
      assert.equal(await page.locator('[data-theme-choice]').inputValue(),choice);
      await page.locator('[data-theme-choice]').selectOption(choice==='light'?'dark':'light');
      assert.match(await page.locator('#theme-toggle').getAttribute('aria-label'),choice==='light'?/Oscuro$/:/Claro$/);
    }
    assert.equal(await page.evaluate(async()=>(await import('./assets/v2/store.js')).get().profile),'familia');
  });
  await check('Menu remains inside the viewport with touch-sized options and enlarged text',async()=>{
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:844});
      for(const large of [false,true]) {
        if((await page.locator('#font-toggle').getAttribute('aria-pressed')==='true')!==large) await page.locator('#font-toggle').click();
        await page.locator('#theme-toggle').click();
        const geometry=await page.locator('#theme-menu').evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,width:innerWidth,items:[...e.children].map(i=>i.getBoundingClientRect().height)}));
        assert(geometry.left>=0 && geometry.right<=width,JSON.stringify({width,large,geometry}));
        assert(geometry.items.every(h=>h>=44));
        await page.keyboard.press('Escape');
      }
    }
  });
  await check('Device persistence honors the existing opt-in',async()=>{
    await page.evaluate(async()=>{const Store=await import('./assets/v2/store.js');Store.enable()});
    await mode('system');
    const next=await context.newPage();await next.goto(base+'#/hoy');await next.locator('main h1').waitFor();
    assert.equal(await next.locator('#theme-toggle').getAttribute('aria-label'),'Cambiar aspecto. Actual: Sistema');
    assert.equal(await next.evaluate(async()=>(await import('./assets/v2/store.js')).get().profile),'familia');
    await next.close();
  });
  assert.deepEqual(errors,[]);
  const report={status:'passed',checks:checks.length,details:checks,errors};
  if(process.env.QA_OUTPUT) {
    fs.mkdirSync(process.env.QA_OUTPUT,{recursive:true});
    await page.goto(base+'#/bienvenida');await page.locator('.quiet-arrival').waitFor();
    if(await page.locator('#font-toggle').getAttribute('aria-pressed')==='true') await page.locator('#font-toggle').click();
    for(const [width,label] of [[390,'movil'],[1440,'ordenador']]) {
      await page.setViewportSize({width,height:900});
      await mode('system');
      await page.screenshot({path:path.join(process.env.QA_OUTPUT,`aspecto_${label}_cerrado.png`),animations:'disabled'});
      await page.locator('#theme-toggle').click();
      await page.screenshot({path:path.join(process.env.QA_OUTPUT,`aspecto_${label}_abierto.png`),animations:'disabled'});
      await page.keyboard.press('Escape');
    }
    fs.writeFileSync(path.join(process.env.QA_OUTPUT,'verificacion_aspecto.json'),JSON.stringify(report,null,2));
  }
  console.log(JSON.stringify(report));
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close();});
