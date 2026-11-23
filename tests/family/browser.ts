// Real isolated Chrome QA with test-process Google transport only.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { openChrome } from '../auth/chrome.ts';
import { startServer } from '../auth/server.ts';
const browser = await openChrome();
let server: Awaited<ReturnType<typeof startServer>> | undefined;
try {
  if (!process.argv.includes('--dev-only')) {
    server = await startServer({}, true);
    await browser.send('Browser.grantPermissions', { origin: server.origin, permissions: ['clipboardSanitizedWrite'] });
    await browser.google(server.origin, 'test-code');
    await browser.navigate(`${server.origin}/sign-in`);
    await browser.waitFor('Boolean(document.querySelector("button"))');
    await browser.click('button');
    await browser.waitFor("location.pathname === '/' && document.body.innerText.trim() === 'Meal Planner'", 'automatic first-login setup');
    await browser.navigate(`${server.origin}/family`);
    await browser.waitFor('Boolean(document.querySelector("#recipient-email"))');
    await browser.click('#recipient-email'); await browser.send('Input.insertText', { text: 'invitee@example.test' });
    await browser.click('button[type="submit"]');
    await browser.waitFor('Boolean(document.querySelector("#invitation-link"))', 'created copied invitation');
    // Read only this test-owned generated share link, never auth cookies/storage.
    const link = await browser.evaluate<string>('document.querySelector("#invitation-link").value');
    for (let i = 0; i < 4 && await browser.evaluate("document.activeElement.textContent.trim()") !== 'Copy invitation link'; i++) { await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); }
    assert.equal(await browser.evaluate("document.activeElement.textContent.trim()"), 'Copy invitation link');
    assert.equal(await browser.evaluate('parseFloat(getComputedStyle(document.activeElement).outlineWidth) > 0'), true);
    await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' }); await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    try { await browser.waitFor("document.body.innerText.includes('Invitation link copied.') || document.body.innerText.includes('Select and copy the invitation link below.')", 'keyboard Copy control feedback'); } catch (error) { await browser.screenshot('org/reviews/family-membership-copy-failure.png'); console.log(JSON.stringify({ errors: browser.errors, focusedLabel: await browser.evaluate('document.activeElement.textContent'), feedback: await browser.evaluate("document.querySelector('[role=status]')?.textContent") })); throw error; }
    assert.equal(new URL(link).origin, server.origin);
    for (const width of [320, 1440]) { await browser.viewport(width); await browser.screenshot(`org/reviews/family-membership-management-${width}.png`); }
    await browser.send('Network.clearBrowserCookies');
    await browser.google(server.origin, 'invitee');
    await browser.navigate(link);
    await browser.waitFor("location.pathname === '/sign-in'", 'fragment captured before sign-in');
    assert.equal(await browser.evaluate('location.hash'), '');
    await browser.click('button');
    await browser.waitFor("location.pathname === '/onboarding' && document.body.innerText.includes('Join family')", 'unlisted invited onboarding');
    for (const width of [320, 1440]) { await browser.viewport(width); await browser.screenshot(`org/reviews/family-membership-join-${width}.png`); }
    await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.equal(await browser.evaluate("document.activeElement.textContent.trim()"), 'Join family');
    assert.equal(await browser.evaluate('parseFloat(getComputedStyle(document.activeElement).outlineWidth) > 0'), true);
    await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' }); await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await browser.waitFor("location.pathname === '/' && document.body.innerText.trim() === 'Meal Planner'", 'invited acceptance');
    await browser.navigate(`${server.origin}/family`);
    await browser.waitFor('document.querySelectorAll("#members-heading + ul li").length === 2', 'joined family has two members');
    await browser.click('#recipient-email'); await browser.send('Input.insertText', { text: 'revoke@example.test' }); await browser.click('button[type="submit"]');
    await browser.waitFor('Boolean(document.querySelector(\'button[aria-label="Revoke invitation for revoke@example.test"]\'))');
    await browser.click('button[aria-label="Revoke invitation for revoke@example.test"]');
    await browser.waitFor('!document.querySelector(\'button[aria-label="Revoke invitation for revoke@example.test"]\')');
    for (const width of [320, 1440]) { await browser.viewport(width); await browser.screenshot(`org/reviews/family-membership-joined-${width}.png`); }
    await browser.navigate(`${server.origin}/sign-out`); await browser.waitFor('Boolean(document.querySelector("button"))'); await browser.click('button'); await browser.waitFor("location.pathname === '/sign-in'");
    assert.equal(browser.requests.some((url) => url.includes(new URL(link).hash.slice(1))), false, 'fragment secret never enters server request URL');
    assert.deepEqual(browser.errors, []);
    console.log('Production Chrome: automatic setup, copied-link unlisted Google login/acceptance, shared family, revoke/logout; 320/1440 no overflow or application errors.');
    await server.stop(); server = undefined;
  }
  server = await startServer({}, true, true);
  await browser.send('Network.clearBrowserCookies'); browser.errors.length = 0;
  await browser.navigate(`${server.origin}/invite#${randomBytes(32).toString('base64url')}`);
  try { await browser.waitFor("location.pathname === '/sign-in' && document.querySelector('button')?.textContent.includes('Continue with Google')", 'development StrictMode invitation context'); }
  catch (error) { await browser.screenshot('org/reviews/family-membership-dev-context-failure.png'); console.log(JSON.stringify({ errors: browser.errors, paths: browser.requests.map((url) => new URL(url).pathname), server: server.output() }, null, 2)); throw error; }
  assert.equal(await browser.evaluate('location.hash'), '');
  assert.deepEqual(browser.errors, []);
  await browser.screenshot('org/reviews/family-membership-dev-context.png');
  console.log('Development Chrome: StrictMode fragment capture preserved and sign-in reached without application errors.');
} finally { await server?.stop(); await browser.close(); }
