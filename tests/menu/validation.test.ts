import assert from 'node:assert/strict';
import { test } from 'node:test';
import { encodeMenuCursor, menuEntryFromRow, parseMenuCursor, parseMenuId, parseMenuRecipe, parseSavedMenuEntry, parseMenuSourceUrls, parseMenuSearch, parseMenuPage } from '../../lib/menu/validation.ts';

test('saved lookup sources are a bounded normalized set, never ownership or page selectors', () => {
  assert.deepEqual(parseMenuSourceUrls(['https://EXAMPLE.test:443/recipe#method', 'https://example.test/recipe']), ['https://example.test/recipe']);
  assert.equal(parseMenuSourceUrls(Array.from({length:6}, (_,i) => `https://example.test/${i}`))?.length, 6);
  for (const value of [undefined, {}, [], Array(7).fill('https://example.test/recipe'), [null], ['http://example.test/recipe'], ['https://127.0.0.1/recipe'], ['https://example.test/' + 'x'.repeat(2048)]]) assert.equal(parseMenuSourceUrls(value), null);
});

const id = 'a53f8c90-2345-4789-9234-abcd01234567';
const recipe = { title: 'Lemony chickpeas', sourceUrl: 'https://example.test/recipe?a=1&b=2', imageUrl: 'https://images.example.test/photo.jpg', summary: 'Warm chickpeas and add lemon.', time: { kind: 'total', text: '20 minutes' } };

test('snapshots require exact fields and normalize text, URL identity and optional photo/time', () => {
  assert.deepEqual(parseMenuRecipe({ ...recipe, title: '  Lemony chickpeas  ', sourceUrl: 'https://EXAMPLE.test:443/recipe?a=1&b=2#method' }), { ...recipe, category: null });
  assert.deepEqual(parseMenuRecipe({ ...recipe, imageUrl: null, time: null }), { ...recipe, imageUrl: null, time: null, category: null });
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
  const row = { category: null, id, familyId: 'private-family', savedAt: 1795450000001, title: recipe.title, sourceUrl: recipe.sourceUrl, imageUrl: recipe.imageUrl, summary: recipe.summary, timeKind: 'total', timeText: '20 minutes' };
  const entry = { id, savedAt: row.savedAt, recipe: { ...recipe, category: null }, curation: { state: 'ready', retryable: false } };
  assert.deepEqual(menuEntryFromRow(row), entry);
  assert.deepEqual(parseSavedMenuEntry(entry), entry);
  for (const change of [{ title: ' padded ' }, { sourceUrl: 'https://EXAMPLE.test/r' }, { imageUrl: 'data:image/svg+xml,unsafe' }, { timeKind: null }, { savedAt: -1 }, { id: 'invalid' }]) assert.throws(() => menuEntryFromRow({ ...row, ...change }), /Storage unavailable/);
  for (const change of [{ familyId: 'private' }, { savedAt: -1 }, { recipe: { ...recipe, summary: ' padded ' } }]) assert.equal(parseSavedMenuEntry({ ...entry, ...change }), null);
});

test('curation state is explicit and exact, with no private task authority in public entries', () => {
  const entry = { id, savedAt: 1, recipe: { ...recipe, category: null }, curation: { state: 'ready', retryable: false } };
  assert.deepEqual(parseSavedMenuEntry(entry), entry);
  assert.equal(parseSavedMenuEntry({ id, savedAt: 1, recipe }), null);
  for (const curation of [{ state: 'failed', retryable: false }, { state: 'pending', retryable: true }, { state: 'ready', retryable: false, generation: id }, { state: 'unknown', retryable: false }]) assert.equal(parseSavedMenuEntry({ ...entry, curation }), null);
  assert.deepEqual(parseSavedMenuEntry({ ...entry, curation: { state: 'interrupted', retryable: true } })?.curation, { state: 'interrupted', retryable: true });
});

test('curation enum boundaries reject non-string states instead of coercing JSON values', () => {
  const entry = { id, savedAt: 1, recipe: { ...recipe, category: null }, curation: { state: 'ready', retryable: false } };
  const row = { category: null, id, savedAt: 1, title: recipe.title, sourceUrl: recipe.sourceUrl, imageUrl: recipe.imageUrl, summary: recipe.summary, timeKind: 'total', timeText: '20 minutes', curationState: 'ready', curationExpiresAt: Date.now() + 30000 };
  for (const state of [['ready'], ['pending'], [], 0, 1, true, false, {}, { state: 'ready' }]) {
    assert.equal(parseSavedMenuEntry({ ...entry, curation: { state, retryable: false } }), null);
    assert.throws(() => menuEntryFromRow({ ...row, curationState: state }), /Storage unavailable/);
  }
  assert.equal(parseSavedMenuEntry({ ...entry, curation: { state: null, retryable: false } }), null);
  assert.deepEqual(menuEntryFromRow({ ...row, curationState: null, curationExpiresAt: null }).curation, { state: 'ready', retryable: false }, 'a left-joined absent task still identifies an existing search snapshot');
});

test('title query is bounded trimmed well-formed literal text, with blank/unset compatibility',()=>{
 assert.equal(parseMenuSearch(undefined),'');assert.equal(parseMenuSearch('  '),'');assert.equal(parseMenuSearch("  50%_Lemon's 🍋  "),"50%_Lemon's 🍋");assert.equal(parseMenuSearch('🍋'.repeat(50))?.length,100);
 for(const value of [null,[],1,'x'.repeat(101),'🍋'.repeat(51),'bad\nquery','bad\tquery','\u0000','\u007f','\ud800'])assert.equal(parseMenuSearch(value),null);
});

test('menu response pages require exact bounded canonical unique descending entries and matching cursors',()=>{
 const entries=Array.from({length:50},(_,n)=>({id:`00000000-0000-0000-0000-${String(100-n).padStart(12,'0')}`,savedAt:100-n,curation:{state:'ready',retryable:false},recipe:{...recipe,category:null,sourceUrl:`https://example.test/response/${n}`}}));
 const valid={entries,nextCursor:encodeMenuCursor(entries[49])};assert.deepEqual(parseMenuPage(valid),valid);assert.deepEqual(parseMenuPage({entries:[],nextCursor:null}),{entries:[],nextCursor:null});
 for(const value of [null,{}, {entries:Array(1),nextCursor:null}, {...valid,familyId:id},{entries:[...entries,entries[0]],nextCursor:null},{entries:entries.slice(1),nextCursor:valid.nextCursor},{entries:[],nextCursor:valid.nextCursor},{entries,nextCursor:encodeMenuCursor(entries[0])},{entries:[entries[0],entries[0]],nextCursor:null},{entries:[entries[1],entries[0]],nextCursor:null},{entries:[entries[0],{...entries[1],recipe:entries[0].recipe}],nextCursor:null},{entries:[{...entries[0],recipe:{...recipe,category:null,sourceUrl:'javascript:alert(1)'}}],nextCursor:null}])assert.equal(parseMenuPage(value),null);
 const tied=[{...entries[0],savedAt:1},{...entries[1],savedAt:1}];assert.ok(parseMenuPage({entries:tied,nextCursor:null}));assert.equal(parseMenuPage({entries:tied.toReversed(),nextCursor:null}),null);
});


test('classification accepts only exact new or legacy card shapes and normalizes legacy absence', () => {
  assert.equal(parseMenuRecipe(recipe)?.category, null);
  for (const category of ['main', 'side', 'veggie', null]) {
    assert.equal(parseMenuRecipe({ ...recipe, category })?.category, category);
    const entry = { id, savedAt: 1, recipe: { ...recipe, category }, curation: { state: 'ready', retryable: false } };
    assert.deepEqual(parseSavedMenuEntry(entry), entry);
  }
  for (const category of [undefined, 'Main dish', '', 'vegan', 1, true, [], {}, ['main']]) {
    assert.equal(parseMenuRecipe({ ...recipe, category }), null);
  }
  assert.equal(parseMenuRecipe({ ...recipe, category: 'main', categoryOverridden: true }), null);
});


test('stored rows require an explicitly projected valid category while legacy JSON remains readable', () => {
  const row = { id, savedAt: 1, title: recipe.title, sourceUrl: recipe.sourceUrl, imageUrl: recipe.imageUrl, summary: recipe.summary, timeKind: 'total', timeText: '20 minutes' };
  assert.throws(() => menuEntryFromRow(row), /Storage unavailable/);
  for (const category of [undefined, 'unknown', ['main']]) assert.throws(() => menuEntryFromRow({ ...row, category }), /Storage unavailable/);
  assert.equal(menuEntryFromRow({ ...row, category: null }).recipe.category, null);
  assert.equal(parseMenuRecipe(recipe)?.category, null);
});
