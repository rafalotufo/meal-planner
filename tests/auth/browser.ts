// Optional isolated real-Chrome QA; never imported by application code.
import assert from 'node:assert/strict';
import { openChrome } from './chrome.ts';
import { CookieJar, startServer } from './server.ts';
import { provision, signInWithGoogle } from './flow.ts';
const browser = await openChrome(); const server = await startServer({}, true);
try {
  await browser.recipes(server.origin);
  const jar = new CookieJar(); assert.equal((await signInWithGoogle(server.origin, jar)).callback.status, 302); assert.equal((await provision(server.origin, jar)).status, 200);
  for (const width of [320, 1440]) {
    await browser.viewport(width); await browser.send('Network.clearBrowserCookies'); await browser.navigate(`${server.origin}/sign-in`);
    await browser.waitFor('Boolean(document.querySelector("button"))');
    assert.equal(await browser.evaluate('document.title'), 'Meal Planner'); assert.equal(await browser.evaluate('document.documentElement.lang'), 'en');
    assert.equal(await browser.evaluate('document.querySelectorAll("h1").length'), 1); assert.equal(await browser.evaluate('document.querySelector("button").textContent.trim()'), 'Continue with Google');
    await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.equal(await browser.evaluate('document.activeElement.tagName'), 'BUTTON'); await browser.viewport(width);
    await browser.screenshot(`org/reviews/postgresql-auth-sign-in-${width}.png`);
    await browser.send('Network.setCookies', { cookies: [...jar.values].map(([name, value]) => ({ name, value, url: server.origin, httpOnly: true, sameSite: 'Lax' })) });
    await browser.navigate(`${server.origin}/`); await browser.waitFor("location.pathname === '/' && document.querySelector('h1')?.textContent === 'Meal Planner' && Boolean(document.querySelector('#recipe-query'))");
    assert.equal(await browser.evaluate('document.querySelectorAll("h1").length'), 1); await browser.viewport(width);
    await browser.click('#recipe-query'); await browser.send('Input.insertText', { text: 'potato gnocchi' }); await browser.click('button[type="submit"]');
    await browser.waitFor('document.querySelector("article img")?.naturalWidth === 500', 'fixture recipe photo');
    assert.equal(await browser.evaluate('document.querySelector("article h3")?.textContent'), 'Potato Gnocchi');
    assert.equal(await browser.evaluate('document.querySelector("article img")?.naturalHeight'), 500);
    assert.equal(await browser.evaluate('document.querySelector("article a")?.href'), 'https://www.loveandlemons.com/gnocchi-recipe/');
    assert.equal(await browser.evaluate('document.querySelector("article").innerText.includes("Cook time: 30 minutes")'), true);
    await browser.viewport(width);
    await browser.screenshot(`org/reviews/postgresql-auth-home-${width}.png`);
  }
  await browser.navigate(`${server.origin}/sign-out`); await browser.click('button'); await browser.waitFor("location.pathname === '/sign-in'");
  await browser.navigate(`${server.origin}/`); await browser.waitFor("location.pathname === '/sign-in'");
  await browser.google(server.origin, 'test-code'); await browser.click('button'); await browser.waitFor("location.pathname === '/' && document.querySelector('h1')?.textContent === 'Meal Planner' && Boolean(document.querySelector('#recipe-query'))");
  assert.deepEqual(browser.errors, []);
  console.log('Chrome auth: title/lang, guarded recipe-search home and fixture photo, keyboard/focus, logout and real-button mocked Google login passed at 320/1440; no application errors.');
} finally { await server.stop(); await browser.close(); }
