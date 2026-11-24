// Local fixture QA only; this helper never enters application code.
import assert from 'node:assert/strict';
import { invitationScenario } from '../family/http.ts';
import { openChrome } from './chrome.ts';
import type { CookieJar } from './server.ts';

const scenario = await invitationScenario();
const browser = await openChrome();
const longEmail = `${'family-member-'.repeat(6)}@example.test`;
async function cookies(jar?: CookieJar) {
  await browser.send('Network.clearBrowserCookies');
  if (jar) await browser.send('Network.setCookies', {
    cookies: [...jar.values].map(([name, value]) => ({ name, value, url: scenario.server.origin, httpOnly: true, sameSite: 'Lax' })),
  });
}
async function tab() {
  await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
}
let sharedBackground: string | undefined;
async function inspect(name: string) {
  for (const width of [320, 1440]) {
    await browser.viewport(width);
    assert.deepEqual(await browser.evaluate(`({
      header: document.querySelectorAll('header').length,
      main: document.querySelectorAll('main').length,
      h1: document.querySelectorAll('h1').length,
      links: [...document.querySelectorAll('header a')].map(a => a.getAttribute('href')),
      navigation: document.querySelector('header nav')?.getAttribute('aria-label')
    })`), { header: 1, main: 1, h1: 1, links: ['/', '/', '/family'], navigation: 'Primary' });
    const background = await browser.evaluate<string>('getComputedStyle(document.body).backgroundColor');
    sharedBackground ??= background;
    assert.equal(background, sharedBackground, 'all pages inherit the same background');
    assert.ok(!['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)'].includes(background), 'shared shell background is visible');
    await browser.screenshot(`org/reviews/shared-site-layout-${name}-${width}.png`);
  }
}
async function noProtectedPrefetch(start: number) {
  await new Promise(resolve => setTimeout(resolve, 350));
  assert.equal(browser.requests.slice(start).some(url => {
    const parsed = new URL(url);
    return parsed.origin === scenario.server.origin && ['/', '/family'].includes(parsed.pathname);
  }), false, 'static header does not eagerly request protected routes');
}
try {
  await cookies();
  const publicStart = browser.requests.length;
  await browser.navigate(`${scenario.server.origin}/sign-in`);
  await inspect('sign-in');
  await noProtectedPrefetch(publicStart);
  // The shared brand and both navigation destinations are reachable by real Tab keys.
  await browser.navigate(`${scenario.server.origin}/sign-in`);
  for (const label of ['Meal Planner', 'Recipes', 'Family']) {
    await tab();
    assert.equal(await browser.evaluate('document.activeElement.textContent.trim()'), label);
    assert.equal(await browser.evaluate('parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2'), true);
  }
  const navigationStart = browser.requests.length;
  await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await browser.waitFor(`performance.getEntriesByType('resource').some(entry => new URL(entry.name).pathname === '/family')`);
  assert.ok(browser.requests.slice(navigationStart).some(url => new URL(url).pathname === '/family'));
  await browser.waitFor("location.pathname === '/sign-in' && document.querySelector('h1')?.textContent === 'Sign in to Meal Planner'");

  await cookies(scenario.owner);
  await browser.navigate(`${scenario.server.origin}/`);
  await browser.waitFor('Boolean(document.querySelector("#recipe-query"))');
  await inspect('home');
  await browser.click('header a[href="/family"]');
  await browser.waitFor('Boolean(document.querySelector("#recipient-email"))');
  await browser.click('#recipient-email');
  await browser.send('Input.insertText', { text: longEmail });
  await browser.click('button[type="submit"]');
  await browser.waitFor('Boolean(document.querySelector("#invitation-link"))');
  assert.equal(await browser.evaluate('document.querySelector("#invitation-link").value.length > 70'), true);
  await inspect('family');
  await browser.click(`button[aria-label="Revoke invitation for ${longEmail}"]`);
  await browser.waitFor(`!document.querySelector('button[aria-label="Revoke invitation for ${longEmail}"]')`);
  await browser.navigate(`${scenario.server.origin}/sign-out`);
  await inspect('sign-out');

  assert.deepEqual(browser.errors, []);
  await cookies();
  const diagnostic = await browser.send<{ identifier: string }>('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.sharedLayoutResponses = [];
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      window.sharedLayoutResponses.push({ path: new URL(response.url).pathname, status: response.status });
      return response;
    };
  ` });
  await browser.navigate(`${scenario.server.origin}/invite`);
  await browser.waitFor('Boolean(document.querySelector("[role=alert]"))');
  await inspect('invite');
  // Missing invitation context deliberately returns 400 and renders the fallback alert.
  const expectedInviteError = ['Failed to load resource: the server responded with a status of 400 (Bad Request)'];
  assert.deepEqual(browser.errors, expectedInviteError);
  assert.deepEqual(await browser.evaluate(`window.sharedLayoutResponses.filter(response => response.status === 400).map(response => response.path)`), ['/api/invitation-context'], 'only the deliberate invalid invitation request returns 400');
  await browser.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: diagnostic.identifier });
  await cookies(scenario.invitee);
  const pendingStart = browser.requests.length;
  await browser.navigate(`${scenario.server.origin}/onboarding`);
  await browser.waitFor("document.body.innerText.includes('Join family')");
  await inspect('onboarding');
  await noProtectedPrefetch(pendingStart);
  await browser.navigate(`${scenario.server.origin}/family`);
  await browser.waitFor("location.pathname === '/onboarding'");
  assert.equal(await browser.evaluate('Boolean(document.querySelector("#recipient-email"))'), false);
  assert.deepEqual(browser.errors, expectedInviteError);
  console.log('Shared layout Chrome QA passed: six visible routes at 320/1440, landmarks/background, header keyboard focus, navigation guards, no eager protected prefetch, long invitation email/URL, create/revoke; empty paid keys and isolated test DB.');
} finally {
  await browser.close();
  await scenario.close();
}
