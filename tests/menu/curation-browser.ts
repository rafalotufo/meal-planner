// Real Chrome, guarded HTTP, native publisher fixture, parser and PostgreSQL.
// Successful application API responses are never intercepted.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { openChrome } from '../auth/chrome.ts';
import { startCurationServer } from './curation-server.ts';

const fixture = await startCurationServer({ development: process.argv.includes('--development') });
let browser: Awaited<ReturnType<typeof openChrome>> | undefined;
let failed = false;
try {
  browser = await openChrome();
  const chrome = browser;
  const { server, db } = fixture;
  await chrome.google(server.origin, 'test-code');
  await chrome.recipes(server.origin); // Google/photos/search only; real menu requests continue.
  await chrome.navigate(`${server.origin}/sign-in`);
  await chrome.click('button');
  await chrome.waitFor("location.pathname === '/' && Boolean(document.querySelector('#recipe-query'))", 'member home');
  await chrome.navigate(`${server.origin}/menu`);
  await chrome.waitFor("Boolean(document.querySelector('#menu-empty-link'))", 'owned empty menu');
  assert.equal(await chrome.evaluate("Boolean(document.querySelector('label[for=recipe-url]'))"), true, 'the shared menu offers a labelled direct recipe URL field');
  assert.equal(await chrome.evaluate("document.querySelector('#recipe-url')?.getAttribute('type')"), 'url');
  async function fill(source: string) {
    await chrome.click('#recipe-url');
    await chrome.evaluate("document.querySelector('#recipe-url').select()");
    await chrome.send('Input.insertText', { text: source });
  }
  async function add(path: string) {
    await fill(fixture.source(path));
    await chrome.click('[data-add-recipe-url]');
    await chrome.waitFor("!document.querySelector('#recipe-url').disabled && document.querySelector('#recipe-url-feedback').textContent.includes('Link saved')", 'committed link feedback');
    const entry = await db.one<{ id: string; familyId: string }>('SELECT id,family_id AS "familyId" FROM menu_recipes WHERE source_url=$1', [fixture.source(path)]);
    assert.ok(entry, 'save feedback corresponds to an actual committed menu row');
    return entry;
  }
  async function state(id: string, value: string) {
    await chrome.waitFor(`document.querySelector('[data-menu-entry="${id}"]')?.getAttribute('data-curation-state') === ${JSON.stringify(value)}`, `entry ${value}`);
  }
  async function shot(name: string, widths = [320, 390, 1440], entryId?: string) {
    for (const width of widths) {
      await chrome.viewport(width);
      if (entryId) await chrome.evaluate(`document.querySelector('[data-menu-entry="${entryId}"]').scrollIntoView({block:'center'})`);
      await chrome.screenshot(`org/reviews/recipe-url-menu-${name}-${width}.png`);
    }
  }
  await shot('empty');
  await chrome.click('#recipe-url');
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.equal(await chrome.evaluate("document.activeElement.hasAttribute('data-add-recipe-url') && document.activeElement.matches(':focus-visible')"), true, 'keyboard reaches the visible submit control');
  await fill('http://example.test/recipe');
  await chrome.click('[data-add-recipe-url]');
  await chrome.waitFor("document.querySelector('#recipe-url-feedback').textContent.includes('valid direct HTTPS')", 'safe URL guidance');
  assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
  assert.equal(await chrome.evaluate("document.querySelector('#recipe-url').value"), 'http://example.test/recipe');

  await fill(fixture.source('/unconfirmed-save-browser'));
  chrome.failNext('/api/menu?import=url', 503);
  await chrome.click('[data-add-recipe-url]');
  await chrome.waitFor("document.querySelector('#recipe-url-feedback').textContent.includes('Could not confirm the save')", 'unconfirmed save feedback is honest');
  assert.equal(await chrome.evaluate("document.querySelector('#recipe-url').value"), fixture.source('/unconfirmed-save-browser'));
  assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);

  await fixture.set('/stalled-browser', 'stall');
  const pending = await add('/stalled-browser');
  await fixture.waitForRequest('/stalled-browser');
  await chrome.waitFor(`['pending','processing'].includes(document.querySelector('[data-menu-entry="${pending.id}"]')?.getAttribute('data-curation-state'))`, 'immediate pending card before publisher reply');
  assert.equal((await db.one<{ title: string }>('SELECT title FROM menu_recipes WHERE id=$1', [pending.id]))?.title, 'Saved recipe link');
  assert.equal(await chrome.evaluate(`document.querySelector('[data-menu-entry="${pending.id}"] a').getAttribute('href')`), fixture.source('/stalled-browser'));
  await shot('pending', [390], pending.id);
  await chrome.click(`[data-remove-recipe="${pending.id}"]`);
  await chrome.waitFor("Boolean(document.querySelector('dialog[open]'))", 'pending confirmation stays open during curation');
  await fixture.release('/stalled-browser');
  await state(pending.id, 'ready');
  await chrome.click('dialog [data-cancel-removal]');
  assert.equal(await chrome.evaluate("document.activeElement.getAttribute('data-remove-recipe')"), pending.id, 'Cancel restores the current remove control after pending card becomes ready');
  assert.equal(await chrome.evaluate(`document.querySelector('[data-menu-entry="${pending.id}"] img')?.getAttribute('src')`), 'https://images.recipe-fixture.test/photo.svg');
  assert.match(await chrome.evaluate<string>(`document.querySelector('[data-menu-entry="${pending.id}"]').textContent`), /20 minutes/);
  assert.match(await chrome.evaluate<string>(`document.querySelector('[data-menu-entry="${pending.id}"]').textContent`), /Imported fixture recipe/);
  assert.equal(await chrome.evaluate(`document.querySelector('[data-menu-entry="${pending.id}"] [role=status]').getAttribute('aria-live')`), 'polite');
  await shot('ready', [320, 390, 1440], pending.id);
  const acquisitionCount = await fixture.requests('/stalled-browser');
  await fill(fixture.source('/stalled-browser')); await chrome.click('[data-add-recipe-url]');
  await chrome.waitFor("document.querySelector('#recipe-url-feedback').textContent.includes('Already in your menu')", 'duplicate feedback');
  assert.equal(await fixture.requests('/stalled-browser'), acquisitionCount, 'duplicate does not launch curation');
  assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 1);
  await chrome.navigate(`${server.origin}/menu`); await state(pending.id, 'ready');

  await fixture.set('/retry-browser', 'failure');
  const retry = await add('/retry-browser'); await state(retry.id, 'failed');
  await shot('failed', [320, 1440], retry.id);
  chrome.failNext('/api/menu?curate=retry', 503);
  await chrome.click(`[data-retry-recipe-details="${retry.id}"]`);
  await chrome.waitFor("document.body.textContent.includes('Could not confirm the retry')", 'retry request failure remains recoverable');
  await fixture.set('/retry-browser', 'success');
  await chrome.click(`[data-retry-recipe-details="${retry.id}"]`); await state(retry.id, 'ready');
  assert.equal((await db.one<{ id: string }>('SELECT id FROM menu_recipes WHERE source_url=$1', [fixture.source('/retry-browser')]))?.id, retry.id);

  await fixture.set('/missing-browser', 'missing');
  const missing = await add('/missing-browser'); await state(missing.id, 'ready');
  const missingCopy = await chrome.evaluate<string>(`document.querySelector('[data-menu-entry="${missing.id}"]').textContent`);
  assert.match(missingCopy, /Summary unavailable\./); assert.match(missingCopy, /Time not provided/); assert.match(missingCopy, /Photo unavailable/);
  await shot('missing', [390], missing.id);

  const now = Date.now();
  await db.execute("UPDATE menu_recipe_curations SET state='pending',lease=NULL,scheduled_at=$2,expires_at=$3 WHERE entry_id=$1", [missing.id, now - 30000, now - 1]);
  const beforeRead = await fixture.requests('/missing-browser');
  await chrome.navigate(`${server.origin}/menu`); await state(missing.id, 'interrupted');
  assert.equal(await fixture.requests('/missing-browser'), beforeRead, 'reading interruption never starts work');
  await chrome.click(`[data-retry-recipe-details="${missing.id}"]`); await state(missing.id, 'ready');

  await fixture.set('/removed-browser', 'stall');
  const removed = await add('/removed-browser'); await fixture.waitForRequest('/removed-browser');
  await chrome.click(`[data-remove-recipe="${removed.id}"]`);
  await chrome.waitFor("Boolean(document.querySelector('dialog[open]'))", 'pending link removal confirmation');
  assert.equal(await chrome.evaluate('document.activeElement.textContent'), 'Cancel');
  await chrome.click('dialog [data-cancel-removal]');
  assert.ok(await db.one('SELECT id FROM menu_recipes WHERE id=$1', [removed.id]));
  await chrome.click(`[data-remove-recipe="${removed.id}"]`); await chrome.click('dialog [data-confirm-removal]');
  await chrome.waitFor(`!document.querySelector('[data-menu-entry="${removed.id}"]')`, 'confirmed pending link removal');
  await fixture.release('/removed-browser');
  assert.equal(await db.one('SELECT id FROM menu_recipes WHERE id=$1', [removed.id]), undefined);
  assert.equal(await db.one('SELECT entry_id FROM menu_recipe_curations WHERE entry_id=$1', [removed.id]), undefined);

  await db.execute("INSERT INTO menu_recipes (id,family_id,source_url,title,summary,saved_at) SELECT gen_random_uuid()::text,$1,'https://example.test/seed/'||n,'Seed recipe '||n,'A seed recipe.',n FROM generate_series(1,52) n", [pending.familyId]);
  await chrome.navigate(`${server.origin}/menu`);
  await chrome.click('nav[aria-label="Menu pages"] a[href*="after="]');
  await chrome.waitFor("location.search.includes('after=') && document.body.textContent.includes('Seed recipe 1')", 'older page navigation settled');
  const cursor = await chrome.evaluate<string>('location.href');
  const older = await add('/older-browser');
  assert.equal(await chrome.evaluate('location.href'), cursor, 'URL save preserves older page');
  await chrome.click('form a[href="/menu#menu-heading"]');
  await chrome.waitFor("!location.search", 'explicit newest navigation');
  await state(older.id, 'ready');
  assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 56, 'all entries remain in the unbounded family collection');

  // Seed an interrupted executor's valid pending row, without scheduling a callback.
  // Its first genuine read proves polling is read-only. Subsequent intentional
  // network failures keep the client pending long enough to exercise its40s cap.
  const pollingId = randomUUID(), generation = randomUUID(), at = Date.now();
  await db.execute('INSERT INTO menu_recipes (id,family_id,source_url,title,summary,saved_at) VALUES ($1,$2,$3,$4,$5,$6)', [pollingId, pending.familyId, fixture.source('/polling-browser'), 'Saved recipe link', 'Recipe details are not available yet.', at + 1]);
  await db.execute("INSERT INTO menu_recipe_curations (entry_id,state,generation,scheduled_at,expires_at,lease,google_subject,verified_email,credential_expires_at) SELECT $1,'pending',$2,$3,$4,NULL,google_subject,verified_email,$5 FROM app_users WHERE family_id=$6 LIMIT 1", [pollingId, generation, at, at + 30000, at + 3600000, pending.familyId]);
  await chrome.navigate(`${server.origin}/menu`); await state(pollingId, 'pending');
  await fill(fixture.source('/polling-browser'));
  await chrome.waitFor(`document.querySelector('#recipe-url').value === ${JSON.stringify(fixture.source('/polling-browser'))} && !document.querySelector('[data-add-recipe-url]').disabled`, 'polling page input is interactive without submitting');
  await chrome.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const menuReads = () => chrome.requests.filter(url => { const parsed = new URL(url); return parsed.origin === server.origin && parsed.pathname === '/api/menu' && !parsed.search; }).length;
  const readsBefore = menuReads();
  const pollingBefore = Date.now();
  await chrome.waitFor(`performance.getEntriesByType('resource').some(entry => { const url=new URL(entry.name); return url.origin === location.origin && url.pathname === '/api/menu' && !url.search; })`, 'first genuine read-only poll');
  let capped = false;
  for (let attempt = 0; attempt < 250; attempt++) {
    // Intentional outage coverage only; the first successful poll above and all
    // successful save/curation/retry responses use the real protected API.
    chrome.failNext('/api/menu', 503);
    if (await chrome.evaluate("Boolean(document.querySelector('[data-refresh-menu]'))")) { capped = true; break; }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.equal(capped, true, 'interrupted polling ends with explicit Refresh menu');
  assert.ok(Date.now() - pollingBefore <= 50000, 'the real polling cap completes within the bounded waiter');
  assert.ok(menuReads() - readsBefore >= 1 && menuReads() - readsBefore <= 8, 'polling is bounded to eight reads');
  assert.equal(await fixture.requests('/polling-browser'), 0, 'polling cannot schedule publisher work');
  assert.equal((await db.one<{ state: string }>('SELECT state FROM menu_recipe_curations WHERE entry_id=$1', [pollingId]))?.state, 'pending', 'polling does not claim or mutate tasks');
  const unexpected = chrome.errors.filter(error => !/Failed to load resource: the server responded with a status of (400|503)\b/.test(error));
  assert.deepEqual(unexpected, []);
  console.log('Chrome curation: immediate committed link, ready metadata, duplicate, failed/manual retry, unavailable fields, interrupted status, confirmed removal, older-page save and bounded read-only polling passed at mobile/desktop widths.');
} catch (error) {
  failed = true;
  if (browser) {
    console.error('Curation browser failure state:', await browser.evaluate("({path:location.pathname+location.search,input:document.querySelector('#recipe-url')?.value,disabled:document.querySelector('#recipe-url')?.disabled,feedback:document.querySelector('#recipe-url-feedback')?.textContent,cards:document.querySelectorAll('article').length})").catch(() => 'page unavailable'));
    await browser.screenshot('org/reviews/recipe-url-menu-browser-failure.png').catch(() => {});
  }
  throw error;
}
finally {
  const cleanup = await Promise.allSettled([browser?.close(), fixture.stop()]);
  if (cleanup.some(result => result.status === 'rejected')) {
    if (!failed) throw new Error('Curation browser fixture cleanup failed');
    console.error('Curation browser fixture cleanup failed after primary failure.');
  }
}
