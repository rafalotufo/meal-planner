// Real Chrome and real menu HTTP/storage; only Google/search/photos are fixtures.
import assert from 'node:assert/strict';
import { openChrome } from '../auth/chrome.ts';
import { startServer } from '../auth/server.ts';
import { restrictedMenuDatabase } from './database.ts';

const fixture = await restrictedMenuDatabase();
const browser = await openChrome();
let server: Awaited<ReturnType<typeof startServer>> | undefined;
try {
  server = await startServer({ DATABASE_URL: fixture.runtimeUrl }, true);
  await browser.google(server.origin, 'test-code');
  await browser.recipes(server.origin);
  await browser.navigate(`${server.origin}/sign-in`);
  await browser.click('button');
  await browser.waitFor("location.pathname === '/' && Boolean(document.querySelector('#recipe-query'))", 'member home');
  await browser.click('#recipe-query');
  await browser.send('Input.insertText', { text: 'gnocchi' });
  await browser.click('button[type="submit"]');
  await browser.waitFor("Boolean(document.querySelector('[data-save-recipe]'))", 'Add to menu action');
  await browser.evaluate("document.querySelector('[data-save-recipe]').scrollIntoView({block:'center'})");
  await browser.click('[data-save-recipe]');
  await browser.waitFor("document.querySelector('[data-save-recipe]')?.textContent.includes('Added to menu')", 'confirmed durable save');
  await browser.click('a[href="/menu"]');
  await browser.waitFor("location.pathname === '/menu' && document.querySelectorAll('article').length === 1", 'fresh menu after save');
  assert.equal(await browser.evaluate("document.querySelector('article img')?.getAttribute('src')"), 'https://images.recipe-fixture.test/photo.svg');
  await browser.navigate(`${server.origin}/menu`);
  await browser.waitFor("document.querySelectorAll('article').length === 1", 'save survives reload');
  for (const width of [390, 1440]) {
    await browser.viewport(width);
    await browser.screenshot(`org/reviews/saved-recipe-menu-saved-${width}.png`);
  }
  assert.deepEqual(browser.errors, []);
  console.log('Production Chrome: search → real save → fresh menu → reload; retained photo, 390/1440 no overflow or console errors.');
} catch (error) {
  console.error(error);
  throw error;
} finally {
  await server?.stop();
  await browser.close();
  await fixture.cleanup();
}
