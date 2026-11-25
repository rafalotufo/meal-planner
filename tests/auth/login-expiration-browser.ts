// Focused real-Chrome login QA; Google alone uses the test-process transport.
import assert from 'node:assert/strict';
import { openChrome } from './chrome.ts';
import { startServer } from './server.ts';

let browser: Awaited<ReturnType<typeof openChrome>> | undefined;
let server: Awaited<ReturnType<typeof startServer>> | undefined;
try {
  server = await startServer({}, true);
  browser = await openChrome();
  await browser.google(server.origin, 'test-code');
  for (const width of [390, 1440]) {
    await browser.viewport(width);
    await browser.navigate(`${server.origin}/sign-in`);
    await browser.waitFor("document.querySelector('button')?.textContent === 'Continue with Google'");
    await browser.screenshot(`org/reviews/login-session-expiration-sign-in-${width}.png`);
    await browser.click('button');
    await browser.waitFor("location.pathname === '/' && Boolean(document.querySelector('#recipe-query'))", 'Google fixture login and automatic family setup');
    await browser.viewport(width);
    assert.equal(await browser.evaluate("document.querySelector('h1')?.textContent"), 'Meal Planner');
    await browser.screenshot(`org/reviews/login-session-expiration-home-${width}.png`);
    await browser.navigate(`${server.origin}/`);
    await browser.waitFor("Boolean(document.querySelector('#recipe-query'))", 'login survives navigation');
    await browser.navigate(`${server.origin}/sign-out`);
    await browser.waitFor("document.querySelector('button')?.textContent === 'Sign out'");
    await browser.screenshot(`org/reviews/login-session-expiration-sign-out-${width}.png`);
    await browser.click('button');
    await browser.waitFor("location.pathname === '/sign-in' && document.querySelector('button')?.textContent === 'Continue with Google'", 'logout returns to sign in');
    await browser.navigate(`${server.origin}/`);
    await browser.waitFor("location.pathname === '/sign-in'", 'logout blocks protected home');
  }
  assert.deepEqual(browser.errors, [], 'clean browser console and network');
  console.log('Chrome login/navigation/logout passed at 390px and 1440px; six screenshots captured.');
} finally {
  await browser?.close();
  await server?.stop();
}
