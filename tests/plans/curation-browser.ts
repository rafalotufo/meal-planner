// Owned Chrome/server/database/native publisher fixtures; no fabricated successful APIs.
import assert from 'node:assert/strict';
import { openChrome } from '../auth/chrome.ts';
import { startCurationServer } from '../menu/curation-server.ts';
import { saveMenuRecipe, updateMenuRecipeCategory } from '../../lib/menu/store.ts';
import { generateDuePlans } from '../../lib/plans/generate.ts';
import { readPlans } from '../../lib/plans/store.ts';
import { torontoClock } from '../../lib/plans/calendar.ts';

const fixture = await startCurationServer();
let browser: Awaited<ReturnType<typeof openChrome>> | undefined;
let failed = false;
try {
  browser = await openChrome();
  const chrome = browser, { db, server } = fixture;
  await chrome.google(server.origin, 'test-code');
  await chrome.recipes(server.origin); // Google/search/photo fixtures only; menu/plans stay real HTTP.
  await chrome.navigate(server.origin + '/sign-in');
  await chrome.click('button');
  await chrome.waitFor("location.pathname === '/' && Boolean(document.querySelector('#recipe-query'))", 'eligible member home');
  const user = await db.one<{ googleSubject: string; email: string }>('SELECT google_subject AS "googleSubject",verified_email AS email FROM app_users LIMIT 1');
  assert.ok(user);
  const identity = { ...user, emailVerified: true as const }, allowed = [user.email];
  const original = await saveMenuRecipe(db, identity, allowed, { title: 'Existing family dinner', sourceUrl: 'https://example.test/existing-family-dinner', summary: 'A preserved saved dinner.', imageUrl: null, time: null, category: 'main' });
  const local = torontoClock(new Date()), due = new Date(local.date + 'T23:00:00Z');

  fixture.set('/combined-browser', 'stall');
  await chrome.navigate(server.origin + '/menu');
  await chrome.waitFor("Boolean(document.querySelector('#recipe-url'))", 'direct URL form');
  await chrome.click('#recipe-url');
  await chrome.send('Input.insertText', { text: fixture.source('/combined-browser') });
  await chrome.click('[data-add-recipe-url]');
  await chrome.waitFor("document.querySelector('#recipe-url-feedback').textContent.includes('Link saved')", 'actual committed link feedback');
  const saved = await db.one<{ id: string; title: string; state: string }>('SELECT m.id,m.title,c.state FROM menu_recipes m JOIN menu_recipe_curations c ON c.entry_id=m.id WHERE m.source_url=$1', [fixture.source('/combined-browser')]);
  assert.ok(saved); assert.equal(saved.title, 'Saved recipe link');
  assert.ok(saved.state === 'pending' || saved.state === 'processing', 'new link is durably pending before publisher release');
  await fixture.waitForRequest('/combined-browser');
  await generateDuePlans(db, allowed, local.day, due);
  const initial = await readPlans(db, identity, allowed, {}, due);
  assert.ok(initial.plan);
  assert.deepEqual(initial.plan.meals.map(meal => meal.sourceUrl), [original.entry.recipe.sourceUrl], 'generation excludes the actual pending URL placeholder');

  await chrome.navigate(server.origin + '/plans');
  await chrome.waitFor("Boolean(document.querySelector('[data-plan-suggest=\"0\"]'))", 'existing weekly plan');
  await chrome.click('[data-plan-suggest="0"]');
  await chrome.waitFor("Boolean(document.querySelector('dialog[open]')) && document.querySelector('dialog [aria-busy]')?.getAttribute('aria-busy') === 'false'", 'actual saved-menu picker response');
  assert.equal(await chrome.evaluate(`Boolean(document.querySelector('[data-swap-choice="${saved.id}"]'))`), false, 'picker excludes the pending URL entry');
  assert.equal(await chrome.evaluate("document.querySelector('[data-swap-confirm]').disabled"), true, 'a pending link cannot be suggested');
  await chrome.click('[data-swap-cancel]');
  await chrome.waitFor("!document.querySelector('dialog[open]') && document.activeElement.hasAttribute('data-plan-suggest')", 'pending-picker cancellation restores focus');
  fixture.release('/combined-browser');

  await chrome.navigate(server.origin + '/menu');
  await chrome.waitFor(`['ready','failed','interrupted'].includes(document.querySelector('[data-menu-entry="${saved.id}"]')?.getAttribute('data-curation-state'))`, 'the saved link reaches a truthful source outcome');
  const retried = await chrome.evaluate(`document.querySelector('[data-menu-entry="${saved.id}"]').getAttribute('data-curation-state') !== 'ready'`);
  if (retried) {
    await chrome.click(`[data-retry-recipe-details="${saved.id}"]`);
    await chrome.waitFor(`document.querySelector('[data-menu-entry="${saved.id}"]')?.getAttribute('data-curation-state') === 'ready'`, 'explicit Retry finishes the same saved entry');
    console.log('Initial bounded source attempt was interrupted; actual explicit Retry recovered the saved link.');
  }
  assert.equal(fixture.requests('/combined-browser'), retried ? 2 : 1);
  assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 2);
  const stillOriginal = await readPlans(db, identity, allowed, {}, due);
  assert.equal(stillOriginal.plan?.id, initial.plan.id);
  assert.deepEqual(stillOriginal.plan?.meals, initial.plan.meals, 'curation never regenerates an existing weekly draft');
  for (const width of [320, 390, 1440]) {
    await chrome.viewport(width);
    await chrome.evaluate(`document.querySelector('[data-menu-entry="${saved.id}"]').scrollIntoView({block:'center'})`);
    assert.equal(await chrome.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await chrome.screenshot(`org/reviews/classified-weekly-planning-curation-menu-ready-${width}.png`);
  }

  await updateMenuRecipeCategory(db, identity, allowed, saved.id, 'main');
  await chrome.navigate(server.origin + '/plans');
  await chrome.click('[data-plan-suggest="0"]');
  await chrome.waitFor("document.activeElement.id === 'swap-search' && document.querySelector('dialog [aria-busy]')?.getAttribute('aria-busy') === 'false'", 'hydrated picker search');
  await chrome.send('Input.insertText', { text: 'Imported fixture' });
  await chrome.waitFor(`document.querySelector('dialog [aria-busy]')?.getAttribute('aria-busy') === 'false' && document.querySelector('dialog').textContent.includes('Showing results for “Imported fixture”') && Boolean(document.querySelector('[data-swap-choice="${saved.id}"]'))`, 'real title search finds curated recipe');
  assert.ok(chrome.requests.some(url => { const parsed = new URL(url); return parsed.origin === server.origin && parsed.pathname === '/api/menu' && parsed.searchParams.get('q') === 'Imported fixture'; }), 'picker uses the protected q search contract');
  await chrome.click(`[data-swap-choice="${saved.id}"]`);
  await chrome.waitFor(`document.querySelector('[data-swap-choice="${saved.id}"]')?.getAttribute('aria-pressed') === 'true'`, 'native recipe button selection');
  for (const width of [320, 390, 1440]) {
    await chrome.viewport(width);
    assert.equal(await chrome.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await chrome.screenshot(`org/reviews/classified-weekly-planning-curation-picker-ready-${width}.png`);
  }
  await chrome.click('[data-swap-confirm]');
  await chrome.waitFor("!document.querySelector('dialog[open]') && Boolean(document.querySelector('[data-plan-accept]'))", 'actual suggestion saved');
  await chrome.click('[data-plan-accept]');
  await chrome.waitFor("document.querySelector('article h3')?.textContent === 'Imported fixture recipe' && !document.querySelector('[data-plan-accept]')", 'actual curated recipe swap accepted');
  const final = await readPlans(db, identity, allowed, {}, due);
  assert.equal(final.plan?.id, initial.plan.id);
  assert.equal(final.plan?.revision, initial.plan.revision + 1);
  assert.deepEqual(final.plan?.meals.map(meal => meal.sourceUrl), [fixture.source('/combined-browser')]);
  assert.equal(new Set(final.plan?.meals.map(meal => meal.sourceUrl)).size, final.plan?.meals.length, 'accepted plan stays source-unique');
  for (const width of [320, 390, 1440]) {
    await chrome.viewport(width);
    assert.equal(await chrome.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await chrome.screenshot(`org/reviews/classified-weekly-planning-curation-plan-ready-${width}.png`);
  }
  assert.deepEqual(chrome.errors, []);
  console.log('Combined Chrome320/390/1440: immediate URL save, pending excluded from generation/picker, same-entry curation, unchanged draft, protected q search, actual suggest/accept and unique plan passed; no overflow/console errors.');
} catch (error) {
  failed = true;
  if (browser) console.error('Combined browser diagnostic:', await browser.evaluate("({path:location.pathname+location.search,feedback:document.querySelector('[role=alert],[role=status]')?.textContent,active:document.activeElement?.getAttribute('data-swap-choice')})").catch(() => 'page unavailable'));
  throw error;
} finally {
  const cleanup = await Promise.allSettled([browser?.close(), fixture.stop()]);
  if (cleanup.some(result => result.status === 'rejected')) {
    if (!failed) throw new Error('Combined curation/plans fixture cleanup failed');
    console.error('Combined curation/plans fixture cleanup failed after primary error.');
  }
}
