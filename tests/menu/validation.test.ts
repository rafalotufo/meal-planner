import assert from 'node:assert/strict';
import { test } from 'node:test';
import { encodeMenuCursor, menuEntryFromRow, parseMenuCursor, parseMenuId, parseMenuRecipe, parseSavedMenuEntry, parseMenuSourceUrls } from '../../lib/menu/validation.ts';

test('saved lookup sources are a bounded normalized set, never ownership or page selectors', () => {
  assert.deepEqual(parseMenuSourceUrls(['https://EXAMPLE.test:443/recipe#method', 'https://example.test/recipe']), ['https://example.test/recipe']);
  assert.equal(parseMenuSourceUrls(Array.from({length:6}, (_,i) => `https://example.test/${i}`))?.length, 6);
  for (const value of [undefined, {}, [], Array(7).fill('https://example.test/recipe'), [null], ['http://example.test/recipe'], ['https://127.0.0.1/recipe'], ['https://example.test/' + 'x'.repeat(2048)]]) assert.equal(parseMenuSourceUrls(value), null);
});

const id = 'a53f8c90-2345-4789-9234-abcd01234567';
const recipe = { title: 'Lemony chickpeas', sourceUrl: 'https://example.test/recipe?a=1&b=2', imageUrl: 'https://images.example.test/photo.jpg', summary: 'Warm chickpeas and add lemon.', time: { kind: 'total', text: '20 minutes' } };

test('snapshots require exact fields and normalize text, URL identity and optional photo/time', () => {
  assert.deepEqual(parseMenuRecipe({ ...recipe, title: '  Lemony chickpeas  ', sourceUrl: 'https://EXAMPLE.test:443/recipe?a=1&b=2#method' }), recipe);
  assert.deepEqual(parseMenuRecipe({ ...recipe, imageUrl: null, time: null }), { ...recipe, imageUrl: null, time: null });
  assert.notEqual(parseMenuRecipe({ ...recipe, sourceUrl: 'https://example.test/recipe?b=2&a=1' })?.sourceUrl, recipe.sourceUrl);
  assert.equal(parseMenuRecipe({ ...recipe, sourceUrl: 'https://example.test/Recipe/' })?.sourceUrl, 'https://example.test/Recipe/');
  for (const key of Object.keys(recipe)) {
    const input: Record<string, unknown> = { ...recipe }; delete input[key];
    assert.equal(parseMenuRecipe(input), null, `missing ${key}`);
  }
  for (const input of [null, [], 'recipe', { ...recipe, familyId: id }, { ...recipe, time: { ...recipe.time, minutes: 20 } }, { ...recipe, time: { kind: 'guess', text: '20 minutes' } }, { ...recipe, time: { kind: 'cook' } }, { ...recipe, imageUrl: undefined }]) assert.equal(parseMenuRecipe(input), null);
});

test('text limits use UTF-16 and reject empty, malformed Unicode and unsafe controls', () => {
  for (const [key, maximum] of [['title', 160], ['summary', 600]] as const) {
    assert.ok(parseMenuRecipe({ ...recipe, [key]: 'x'.repeat(maximum) }));
    for (const value of [' '.repeat(4), 'x'.repeat(maximum + 1), '\u0000bad', '\u000bbad', '\u007fbad', '\ud800bad', 'bad\udfff', 123, null]) assert.equal(parseMenuRecipe({ ...recipe, [key]: value }), null);
  }
  assert.ok(parseMenuRecipe({ ...recipe, title: '🍋'.repeat(80), summary: '<script>alert("text only")</script>\nMix\twell.' }));
  assert.equal(parseMenuRecipe({ ...recipe, title: '🍋'.repeat(81) }), null);
  assert.ok(parseMenuRecipe({ ...recipe, time: { kind: 'cook', text: 'x'.repeat(80) } }));
  for (const text of ['', 'x'.repeat(81), '\ud800', '\u0000']) assert.equal(parseMenuRecipe({ ...recipe, time: { kind: 'cook', text } }), null);
});

test('source and photo URL validation rejects unsafe schemes, hosts, credentials and normalization growth', () => {
  for (const key of ['sourceUrl', 'imageUrl'] as const) {
    for (const value of ['http://example.test/r', 'javascript:alert(1)', 'data:image/png;base64,AA==', 'https://user:pass@example.test/r', 'https://example.test:444/r', 'https://127.0.0.1/r', 'https://[::1]/r', 'https://localhost/r', 'https://food.internal/r', 'https://example.test/a\nb', 'https://example.test/' + 'é'.repeat(500), 'https://example.test/' + 'x'.repeat(2048)]) assert.equal(parseMenuRecipe({ ...recipe, [key]: value }), null, `${key}: ${value.slice(0, 40)}`);
    const value = 'https://example.test/' + 'x'.repeat(2048 - 'https://example.test/'.length);
    assert.equal(parseMenuRecipe({ ...recipe, [key]: value })?.[key], value);
  }
});

test('menu IDs and cursors are canonical, bounded positions without an ownership field', () => {
  assert.equal(parseMenuId(id), id);
  for (const value of [id.toUpperCase(), 'family', '', null, id + '\n']) assert.equal(parseMenuId(value), null);
  const position = { id, savedAt: 1795450000001 };
  const cursor = encodeMenuCursor(position);
  assert.deepEqual(parseMenuCursor(cursor), position);
  assert.equal(parseMenuCursor(undefined), null);
  for (const value of ['', cursor + '=', cursor + '!', 'x'.repeat(129), Buffer.from(JSON.stringify([position.savedAt, id, 'family'])).toString('base64url'), ...[-1, 1.5, Number.MAX_SAFE_INTEGER + 1, '123'].map(time => Buffer.from(JSON.stringify([time, id])).toString('base64url')), Buffer.from(JSON.stringify([1, id.toUpperCase()])).toString('base64url'), Buffer.from('null').toString('base64url'), '_w']) assert.equal(parseMenuCursor(value), null);
  for (const savedAt of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => encodeMenuCursor({ id, savedAt }));
});

test('persisted and public entries fail closed rather than normalizing corrupt rows or leaking owners', () => {
  const row = { id, familyId: 'private-family', savedAt: 1795450000001, title: recipe.title, sourceUrl: recipe.sourceUrl, imageUrl: recipe.imageUrl, summary: recipe.summary, timeKind: 'total', timeText: '20 minutes' };
  const entry = { id, savedAt: row.savedAt, recipe };
  assert.deepEqual(menuEntryFromRow(row), entry);
  assert.deepEqual(parseSavedMenuEntry(entry), entry);
  for (const change of [{ title: ' padded ' }, { sourceUrl: 'https://EXAMPLE.test/r' }, { imageUrl: 'data:image/svg+xml,unsafe' }, { timeKind: null }, { savedAt: -1 }, { id: 'invalid' }]) assert.throws(() => menuEntryFromRow({ ...row, ...change }), /Storage unavailable/);
  for (const change of [{ familyId: 'private' }, { savedAt: -1 }, { recipe: { ...recipe, summary: ' padded ' } }]) assert.equal(parseSavedMenuEntry({ ...entry, ...change }), null);
});
