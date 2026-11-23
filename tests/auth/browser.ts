// Optional isolated real-Chrome QA; never imported by application code.
import assert from 'node:assert/strict';
import { openChrome } from './chrome.ts';
import { CookieJar, startServer } from './server.ts';
import { provision, signInWithGoogle } from './flow.ts';
const browser = await openChrome(); const server = await startServer({}, true);
try {
  const jar = new CookieJar(); assert.equal((await signInWithGoogle(server.origin, jar)).callback.status, 302); assert.equal((await provision(server.origin, jar)).status, 200);
  for (const width of [320, 1440]) {
    await browser.viewport(width); await browser.send('Network.clearBrowserCookies'); await browser.navigate(`${server.origin}/sign-in`);
    await browser.waitFor('Boolean(document.querySelector("button"))');
    assert.equal(await browser.evaluate('document.title'), 'Meal Planner'); assert.equal(await browser.evaluate('document.documentElement.lang'), 'en');
    assert.equal(await browser.evaluate('document.querySelectorAll("h1").length'), 1); assert.equal(await browser.evaluate('document.querySelector("button").textContent.trim()'), 'Continue with Google');
    await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.equal(await browser.evaluate('document.activeElement.tagName'), 'BUTTON'); await browser.viewport(width);
    await browser.screenshot(`org/reviews/family-membership-auth-sign-in-${width}.png`);
    await browser.send('Network.setCookies', { cookies: [...jar.values].map(([name, value]) => ({ name, value, url: server.origin, httpOnly: true, sameSite: 'Lax' })) });
    await browser.navigate(`${server.origin}/`); await browser.waitFor("location.pathname === '/' && document.body.innerText.trim() === 'Meal Planner'");
    assert.equal(await browser.evaluate('document.querySelectorAll("h1").length'), 1); await browser.viewport(width);
    await browser.screenshot(`org/reviews/family-membership-auth-home-${width}.png`);
  }
  await browser.navigate(`${server.origin}/sign-out`); await browser.click('button'); await browser.waitFor("location.pathname === '/sign-in'");
  await browser.navigate(`${server.origin}/`); await browser.waitFor("location.pathname === '/sign-in'");
  await browser.google(server.origin, 'test-code'); await browser.click('button'); await browser.waitFor("location.pathname === '/' && document.body.innerText.trim() === 'Meal Planner'");
  assert.deepEqual(browser.errors, []);
  console.log('Chrome auth: title/lang, heading-only home, keyboard/focus, logout and real-button mocked Google login passed at 320/1440; no application errors.');
} finally { await server.stop(); await browser.close(); }
