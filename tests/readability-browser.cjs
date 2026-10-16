/* Real-page layout regression in an isolated browser, never a user's session.
 * PLAYWRIGHT_MODULE and CHROME_PATH may point to a local installation.
 * QA_OUTPUT optionally writes screenshots and the verification manifest. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const app = path.resolve(__dirname, '..');
const output = process.env.QA_OUTPUT;
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
  const context = await browser.newContext({reducedMotion:'reduce'});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const base = `http://127.0.0.1:${server.address().port}/`;
  async function check(name, fn) { await fn(); checks.push(name); console.log('PASS ' + name); }
  async function route(name) { await page.goto(base+'#/'+name); await page.locator('main h1').waitFor(); await page.evaluate(() => document.fonts.ready); }
  async function geometry() {
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const data = await page.evaluate(() => ({ route:location.hash, width:innerWidth, scroll:document.documentElement.scrollWidth, overflowing:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({c:e.className,r:e.getBoundingClientRect().toJSON(),t:e.textContent.slice(0,80)})).slice(0,8),
      overlaps:[...document.querySelectorAll('.quiet-header a,.quiet-header button,.quiet-header select')].filter(e=>e.getBoundingClientRect().width).map(e=>({text:e.textContent.trim(),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),
      hero:document.querySelector('.quiet-arrival') && (()=>{const h=document.querySelector('.quiet-arrival').getBoundingClientRect(),i=document.querySelector('.quiet-arrival .quiet-window').getBoundingClientRect(), c=document.querySelector('.quiet-copy').getBoundingClientRect(),header=document.querySelector('.quiet-header').getBoundingClientRect();return {h:h.height,img:i.height,w:i.width,copyTop:c.top,headerBottom:header.bottom}})()
    }));
    assert(data.scroll <= data.width+1, 'horizontal overflow: '+JSON.stringify(data));
    assert(data.overlaps.every(e=>e.left>=-1 && e.right<=data.width+1), 'header clipped');
    if(data.hero) { assert(data.hero.h>=await page.evaluate(()=>innerHeight)-1); assert.equal(data.hero.img,data.hero.h); assert(data.hero.w>=data.width-1); assert(data.hero.copyTop>=data.hero.headerBottom, 'hero/header overlap: '+JSON.stringify(data.hero)); }
  }
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:width<760?844:900});
    for (const theme of ['light','dark','system']) {
      await route('bienvenida');
      await page.locator('#theme-always').selectOption(theme);
      if(await page.locator('#font-toggle').getAttribute('aria-pressed')==='true') await page.locator('#font-toggle').click();
      await check(`${width}px ${theme}: home photograph, header and text enlargement`, async()=>{
        await geometry();
        const before=await page.locator('.quiet-intro').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
        assert(before>=22);
        await page.locator('#font-toggle').click();
        const after=await page.locator('.quiet-intro').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
        assert(after>before);await geometry();
        await page.locator('[data-next]').click();await geometry();
        await page.locator('[data-next]').click();await geometry();
        assert(await page.locator('[data-device]').isVisible());
        await page.locator('#font-toggle').click();
      });
      for(const name of ['micamino','explorar','vivir','ajustes','recursos','programa','herramientas','mapa','plan','red','biblioteca','media','pausa','feedback']) {
        await route(name);
        await check(`${width}px ${theme}: ${name} reflows`,async()=>{
          assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('is-arrival')),false);
          await geometry();
          if(name==='micamino')assert(await page.locator('.quiet-milestones p').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=18);
          if(name==='explorar')assert(await page.locator('.quiet-index-link small').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=18);
        });
      }
    }
  }
  await check('System appearance responds to OS changes',async()=>{
    await page.locator('#theme-always').selectOption('system');
    await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  });
  await check('Returning home, resized text persistence and a missing image remain usable', async()=>{
    await route('bienvenida');await page.locator('[data-next]').click();await page.locator('[data-next]').click();await page.locator('[data-session]').click();
    await route('hoy');assert(await page.locator('.quiet-arrival').isVisible());
    await page.locator('#font-toggle').click();await page.reload();await page.locator('.quiet-arrival').waitFor();assert.equal(await page.locator('#font-toggle').getAttribute('aria-pressed'),'true');
    await page.route('**/ventana-lago.png',r=>r.abort());await page.reload();await page.locator('.quiet-arrival').waitFor();await geometry();
    assert(await page.locator('.quiet-copy .lv-primary').isVisible());await page.unroute('**/ventana-lago.png');await page.locator('#font-toggle').click();
  });
  await check('200% text enlargement and a 200% desktop reflow equivalent',async()=>{
    await page.setViewportSize({width:720,height:450});
    for(const name of ['bienvenida','micamino','explorar','vivir','ajustes']){
      await route(name);await page.addStyleTag({content:'html{font-size:250% !important}'});await geometry();
    }
  });
  if(output){
    await page.reload();
    await page.locator('main h1').waitFor();
    assert.equal(await page.locator('html').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),20);
    fs.mkdirSync(output,{recursive:true});
    for (const [width,height,label] of [[1440,1000,'ordenador'],[390,844,'movil']]) {
      await page.setViewportSize({width,height});
      for(const theme of ['light','dark'])for(const routeName of ['bienvenida','micamino','explorar']){
        await route(routeName);await page.locator('#theme-always').selectOption(theme);
        await page.evaluate(() => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        await page.screenshot({path:path.join(output,`${label}_${routeName}_${theme}.png`),fullPage:false,animations:'disabled'});
      }
    }
  }
  assert.deepEqual(errors,[]);
  const report={status:'passed',date:new Date().toISOString(),checks:checks.length,details:checks,browser:'Chromium, isolated context',errors,limits:'Emulated viewports; not an independent test with the four users or a certification.'};
  if(output)fs.writeFileSync(path.join(output,'verificacion_visual.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:'passed',checks:checks.length}));
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close();});
