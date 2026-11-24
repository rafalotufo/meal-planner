// Real Chrome and real menu HTTP/storage; only Google/search/photos are fixtures.
import assert from 'node:assert/strict';
import { openChrome } from '../auth/chrome.ts';
import { startServer } from '../auth/server.ts';
import { restrictedMenuDatabase } from './database.ts';

const fixture = await restrictedMenuDatabase();
let ownedBrowser: Awaited<ReturnType<typeof openChrome>> | undefined;
let failed = false;
let server: Awaited<ReturnType<typeof startServer>> | undefined;
let owner: Awaited<ReturnType<typeof fixture.open>> | undefined;
try {
  const browser = await openChrome();
  ownedBrowser = browser;
  async function key(key: string, code: string, windowsVirtualKeyCode: number, modifiers = 0) {
    await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode, modifiers });
    await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode, modifiers });
  }
  async function confirmFirst() {
    await browser.click('[data-remove-recipe]');
    await browser.waitFor("Boolean(document.querySelector('dialog[open]'))", 'confirmed-removal dialog');
    await browser.click('dialog [data-confirm-removal]');
  }
  async function size(count: number) { await browser.waitFor(`document.querySelectorAll('article').length === ${count}`, `${count} real menu cards`); }
  async function menuReady() {
    // Observe hydration of a real React control, without depending on title focus
    // or adding a test signal to production. React's version is pinned here.
    await browser.waitFor("(() => { const control=document.querySelector('[data-remove-recipe],#menu-empty-link'); return control && Object.keys(control).some(key=>key.startsWith('__reactProps$')); })()", 'menu controls hydrated');
  }
  async function unselectedTitle() {
    await menuReady();
    assert.notEqual(await browser.evaluate('document.activeElement.id'), 'menu-heading', 'opening a menu page must not automatically focus its title');
    assert.equal(await browser.evaluate('getSelection()?.toString()'), '', 'menu title text is not selected');
  }
  server = await startServer({ DATABASE_URL: fixture.runtimeUrl }, true, false, process.env.MENU_TEST_BUILD_DIRECTORY);
  await browser.google(server.origin, 'test-code');
  await browser.recipes(server.origin);
  await browser.navigate(`${server.origin}/sign-in`);
  await browser.click('button');
  await browser.waitFor("location.pathname === '/' && Boolean(document.querySelector('#recipe-query'))", 'member home');
  await browser.navigate(`${server.origin}/menu`);
  await browser.waitFor("Boolean(document.querySelector('#menu-empty-link'))", 'initial real empty menu');
  await menuReady();
  for (const width of [390, 1440]) {
    await browser.viewport(width);
    await browser.screenshot(`org/reviews/saved-recipe-menu-title-focus-after-${width}.png`);
  }
  await unselectedTitle();
  await key('Tab', 'Tab', 9);
  assert.equal(await browser.evaluate('document.activeElement.tagName'), 'A', 'normal Tab navigation reaches a link');
  assert.equal(await browser.evaluate('document.activeElement.matches(":focus-visible")'), true, 'keyboard focus remains visible');
  await key('Tab', 'Tab', 9);
  assert.equal(await browser.evaluate('document.activeElement.getAttribute("href")'), '/menu', 'Tab continues through navigation without a trap');
  await browser.click('a[href="/"]');
  await browser.waitFor("Boolean(document.querySelector('#recipe-query'))");
  await browser.click('#recipe-query');
  await browser.send('Input.insertText', { text: 'gnocchi' });
  await browser.click('button[type="submit"]');
  await browser.waitFor("Boolean(document.querySelector('[data-save-recipe]'))", 'Add to menu action');
  await browser.evaluate("document.querySelector('[data-save-recipe]').scrollIntoView({block:'center'})");
  browser.failNext('/api/menu', 503, 500);
  await browser.click('[data-save-recipe]');
  await browser.waitFor("document.querySelector('[data-save-recipe]')?.disabled", 'save pending');
  await browser.waitFor("document.body.innerText.includes('Could not save this recipe')", 'recoverable save failure');
  assert.equal(await browser.evaluate("document.body.innerText.includes('Fixture request failure')"), false);
  await browser.click('[data-save-recipe]');
  await browser.waitFor("document.querySelector('[data-save-recipe]')?.textContent.includes('Added to menu')", 'confirmed durable save');
  assert.equal(await browser.evaluate("document.querySelector('[data-save-recipe]').disabled"), false, 'save stays available after success');
  await browser.click('[data-save-recipe]');
  await browser.waitFor("!document.querySelector('[data-save-recipe]').disabled", 'safe duplicate save');
  await browser.click('a[href="/menu"]');
  await browser.waitFor("location.pathname === '/menu' && document.querySelectorAll('article').length === 1", 'fresh menu after save');
  await unselectedTitle();
  assert.equal(await browser.evaluate("document.querySelector('article img')?.getAttribute('src')"), 'https://images.recipe-fixture.test/photo.svg');
  await browser.navigate(`${server.origin}/menu`);
  await browser.waitFor("document.querySelectorAll('article').length === 1", 'save survives reload');
  await unselectedTitle();
  for (const width of [390, 1440]) {
    await browser.viewport(width);
    await browser.screenshot(`org/reviews/saved-recipe-menu-controls-${width}.png`);
  }
  const removalsBefore = browser.requests.filter(url => new URL(url).pathname.endsWith('/remove')).length;
  await browser.click('[data-remove-recipe]');
  await browser.waitFor("Boolean(document.querySelector('dialog[open]'))", 'removal requires confirmation');
  assert.equal(await browser.evaluate('document.activeElement.textContent'), 'Cancel');
  for (const width of [320, 390, 1440]) {
    await browser.viewport(width);
    assert.equal(await browser.evaluate("(() => { const r=document.querySelector('dialog').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.height <= innerHeight; })()"), true);
    await browser.screenshot(`org/reviews/saved-recipe-menu-confirm-${width}.png`);
  }
  await key('Tab', 'Tab', 9);
  assert.equal(await browser.evaluate('document.activeElement.hasAttribute("data-confirm-removal")'), true);
  await key('Tab', 'Tab', 9);
  assert.equal(await browser.evaluate('document.activeElement.hasAttribute("data-cancel-removal")'), true, 'native modal traps Tab');
  await browser.click('dialog [data-cancel-removal]');
  await browser.waitFor("!document.querySelector('dialog[open]')", 'cancel closes confirmation');
  assert.equal(await browser.evaluate("document.activeElement.hasAttribute('data-remove-recipe')"), true);
  assert.equal(await browser.evaluate("document.querySelectorAll('article').length"), 1);
  await browser.click('[data-remove-recipe]');
  await key('Escape', 'Escape', 27);
  await browser.waitFor("!document.querySelector('dialog[open]')", 'Escape dismisses');
  await browser.click('[data-remove-recipe]');
  await browser.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 2, y: 2, button: 'left', clickCount: 1 });
  await browser.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 2, y: 2, button: 'left', clickCount: 1 });
  await browser.waitFor("!document.querySelector('dialog[open]')", 'backdrop dismisses');
  assert.equal(browser.requests.filter(url => new URL(url).pathname.endsWith('/remove')).length, removalsBefore, 'Cancel/Escape/backdrop send zero POST');
  const id = await browser.evaluate<string>("document.querySelector('[data-remove-recipe]').getAttribute('data-remove-recipe')");
  browser.failNext(`/api/menu/${id}/remove`, 503, 500);
  await confirmFirst();
  await browser.waitFor("document.querySelector('[data-remove-recipe]')?.disabled", 'remove pending keeps card');
  await browser.waitFor("document.body.innerText.includes('Could not remove this recipe')", 'failed removal keeps card');
  assert.equal(await browser.evaluate("document.querySelectorAll('article').length"), 1);
  const attempts = browser.requests.filter(url => new URL(url).pathname.endsWith('/remove')).length;
  await browser.click('[data-remove-recipe]');
  assert.equal(await browser.evaluate('document.activeElement.textContent'), 'Cancel', 'retry reconfirms');
  await browser.click('dialog [data-cancel-removal]');
  assert.equal(browser.requests.filter(url => new URL(url).pathname.endsWith('/remove')).length, attempts);
  await confirmFirst();
  await browser.waitFor("document.querySelectorAll('article').length === 0 && Boolean(document.querySelector('#menu-empty-link'))", 'confirmed removal refreshes real menu');
  await browser.waitFor("document.activeElement.id === 'menu-empty-link'", 'empty-state focus');
  await browser.navigate(`${server.origin}/menu`);
  await browser.waitFor("document.querySelectorAll('article').length === 0", 'removal survives reload');
  console.log('Chrome: save retry/duplicate/cache freshness; cancel/Escape/backdrop zero POST; confirmed removal retry/persistence/focus passed.');
  // Real-store read failure, distinct from an empty menu, with successful reload.
  owner = await fixture.open();
  await owner.execute('REVOKE SELECT ON menu_recipes FROM mp_runtime');
  try {
    await browser.navigate(`${server.origin}/menu`);
    await browser.waitFor("document.body.innerText.includes('Could not load your menu')", 'actual storage error state');
    assert.equal(await browser.evaluate("Boolean(document.querySelector('#menu-empty-link'))"), false);
  } finally { await owner.execute('GRANT SELECT ON menu_recipes TO mp_runtime'); }
  await browser.click('section a[href="/menu"]');
  await browser.waitFor("Boolean(document.querySelector('#menu-empty-link'))", 'reload recovers storage read');
  await browser.navigate(`${server.origin}/menu?after=invalid`);
  await browser.waitFor("document.body.innerText.includes('This menu page is invalid')");
  await browser.navigate(`${server.origin}/menu?after=a&after=b`);
  await browser.waitFor("document.body.innerText.includes('This menu page is invalid')");
  await browser.navigate(`${server.origin}/`);
  await browser.waitFor("Boolean(document.querySelector('#recipe-query'))");
  const special = [
    { title: 'Lemony chickpea supper', sourceUrl: 'https://example.test/lemon', imageUrl: 'https://images.recipe-fixture.test/photo.svg', summary: 'Warm chickpeas with lemon and herbs.', time: { kind: 'total' as const, text: '20 minutes' } },
    { title: '<b>Literal recipe title</b>', sourceUrl: 'https://example.test/literal', imageUrl: null, summary: '<script>window.menuInjected=true</script>' + 'x'.repeat(540), time: null },
    { title: 'Missing publisher photo', sourceUrl: 'https://example.test/missing', imageUrl: 'https://images.recipe-fixture.test/missing.svg', summary: 'The publisher image is unavailable; the recipe stays readable.', time: null },
  ];
  await browser.recipes(server.origin, special);
  await browser.click('#recipe-query'); await browser.send('Input.insertText', { text: 'chickpea supper' }); await browser.click('button[type="submit"]');
  await browser.waitFor("document.querySelectorAll('[data-save-recipe]').length === 3");
  await browser.click('[data-save-recipe]');
  await browser.waitFor("document.querySelector('[data-save-recipe]').textContent.includes('Added to menu')");
  await browser.click('a[href="/menu"]'); await size(1);
  assert.equal(await browser.evaluate("document.querySelector('article h4').textContent"), 'Lemony chickpea supper', 'revisited menu never uses old cached page');
  // Additional snapshots enter through actual protected HTTP, as another family device would.
  assert.deepEqual(await browser.evaluate(`Promise.all(${JSON.stringify(special.slice(1))}.map(async recipe => (await fetch('/api/menu',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(recipe)})).status))`), [200, 200]);
  await browser.navigate(`${server.origin}/menu`); await size(3);
  await browser.waitFor("document.querySelectorAll('article img').length === 1", 'missing and failed image fallbacks');
  assert.equal(await browser.evaluate("document.querySelectorAll('article b,article script').length"), 0, 'saved HTML remains literal text');
  assert.equal(await browser.evaluate("document.body.innerText.includes('<b>Literal recipe title</b>')"), true);
  for (const width of [390,1440]) { await browser.viewport(width); await browser.screenshot(`org/reviews/saved-recipe-menu-photos-${width}.png`); }
  // Reset only our disposable menu, then populate through real API (no provider use).
  await owner.execute('DELETE FROM menu_recipes');
  assert.equal(await browser.evaluate(`(async()=>{for(let i=0;i<54;i++){const recipe={title:'Saved recipe '+i,sourceUrl:'https://example.test/page/'+i,imageUrl:null,summary:'Family recipe '+i,time:null};const r=await fetch('/api/menu',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(recipe)});if(r.status!==200)return false;}return true;})()`), true);
  await browser.navigate(`${server.origin}/menu`); await size(50);
  const second = await browser.evaluate<string>("document.querySelectorAll('[data-remove-recipe]')[1].getAttribute('data-remove-recipe')");
  await confirmFirst(); await browser.waitFor(`document.activeElement.getAttribute('data-remove-recipe') === ${JSON.stringify(second)}`, 'next remove control focus');
  await size(50);
  await browser.click('nav[aria-label="Menu pages"] a[href*="after="]'); await size(3);
  await browser.waitFor("document.activeElement.id === 'menu-heading'", 'explicit Older navigation targets heading');
  await menuReady();
  const cursorUrl = await browser.evaluate<string>('location.href');
  const previous = await browser.evaluate<string>("document.querySelectorAll('[data-remove-recipe]')[1].getAttribute('data-remove-recipe')");
  await browser.click('article:last-child [data-remove-recipe]'); await browser.click('dialog [data-confirm-removal]'); await size(2);
  await browser.waitFor(`document.activeElement.getAttribute('data-remove-recipe') === ${JSON.stringify(previous)}`, 'previous remove control focus');
  await confirmFirst(); await size(1); await confirmFirst(); await size(0);
  await browser.waitFor("document.activeElement.id === 'menu-empty-link'", 'empty older page focus');
  assert.equal(await browser.evaluate('location.href'), cursorUrl, 'remove refreshes same cursor');
  assert.equal(await browser.evaluate("document.body.innerText.includes('No recipes on this page')"), true);
  assert.equal(await browser.evaluate("document.querySelector('#menu-empty-link').textContent"), 'Newest recipes');
  await browser.click('#menu-empty-link'); await size(50);
  await browser.waitFor("document.activeElement.id === 'menu-heading'", 'explicit Newest navigation targets heading');
  await menuReady();
  const existing = await browser.evaluate<string>("document.querySelector('[data-remove-recipe]').getAttribute('data-remove-recipe')");
  browser.failNext(`/api/menu/${existing}/remove`, 403);
  await confirmFirst(); await browser.waitFor("document.body.innerText.includes('Family access changed')", 'family-loss guidance');
  await browser.send('Network.clearBrowserCookies');
  await confirmFirst(); await browser.waitFor("document.body.innerText.includes('Your session ended')", 'actual expired/absent session guidance');
  assert.equal((await owner.one<{n:number}>('SELECT count(*) AS n FROM menu_recipes'))?.n, 50, 'failed admission never removes saved recipes');
  const unexpected = browser.errors.filter(error => !/Failed to load resource: the server responded with a status of (401|403|404|503)\b/.test(error));
  assert.deepEqual(unexpected, []);
  console.log('Chrome: actual read-error/reload, invalid cursor, literal text, retained/missing/failed photos, 50-entry refill/older-empty pages, next/previous/empty focus, session/family loss passed.');
  console.log('Production Chrome: search → real save → fresh menu → reload; retained photo, 390/1440 no overflow or console errors.');
} catch (error) {
  failed = true;
  throw error;
} finally {
  const services = await Promise.allSettled([server?.stop(), ownedBrowser?.close(), owner?.close()]);
  const database = await Promise.allSettled([fixture.cleanup()]);
  if ([...services, ...database].some(result => result.status === 'rejected')) {
    if (!failed) throw new Error('Menu browser fixture cleanup failed');
    console.error('Menu browser fixture cleanup failed after the primary test failure.');
  }
}
