import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseImportedRecipe } from '../../lib/menu/recipe-metadata.ts';

const source = 'https://recipes.example.test/soup';
const photo = 'https://images.example.test/soup.jpg';
const ld = (value: unknown) => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script>`;
const recipe = (fields: Record<string, unknown> = {}) => ({ '@type': 'Recipe', name: 'Lemon soup', url: source, ...fields });
const page = (value: unknown, head = '') => `<html><head>${head}</head><body>${ld(value)}</body></html>`;

test('imports an exact source-associated Recipe and its declared available metadata', () => {
  assert.deepEqual(parseImportedRecipe(page(recipe({ description: 'Bright lemon soup.', image: photo, totalTime: 'PT25M' })), source), {
    title: 'Lemon soup', summary: 'Bright lemon soup.', imageUrl: photo, sourceUrl: source, time: { kind: 'total', text: '25 minutes' },
  });
});
test('supports root arrays and graph arrays, exact type forms and relative identities', () => {
  for (const type of ['Recipe', 'https://schema.org/Recipe', 'http://schema.org/Recipe', ['Thing', 'Recipe']]) {
    for (const document of [recipe({ '@type': type, url: '/soup#recipe' }), [recipe({ '@type': type, url: source })], { '@graph': [{ '@type': 'WebPage' }, recipe({ '@type': type })] }]) {
      assert.equal(parseImportedRecipe(page(document), source)?.title, 'Lemon soup');
    }
  }
  assert.equal(parseImportedRecipe(page({ '@type': 'Recipe', name: 'Unbound soup' }), source)?.title, 'Unbound soup');
  assert.equal(parseImportedRecipe(page(recipe({ mainEntityOfPage: { '@id': source, url: source } })), source)?.title, 'Lemon soup');
});
test('requires unique Recipe evidence and rejects mismatched or ambiguous identities', () => {
  const canonical = `<link rel="canonical" href="${source}"><meta property="og:image" content="${photo}">`;
  for (const value of [recipe({ url: 'https://recipes.example.test/other' }), recipe({ '@id': 'http://127.0.0.1/' }), recipe({ mainEntityOfPage: {} }),
    recipe({ mainEntityOfPage: { '@id': source, url: 'https://recipes.example.test/other' } }),
    [recipe({ '@id': source + '#one' }), recipe({ '@id': source + '#two' })],
    [{ '@type': 'Recipe', name: 'Unbound' }, { '@type': 'Recipe', name: 'Other' }],
    { '@type': 'WebPage', related: recipe() }, { '@type': 'NotRecipe', name: 'Lemon soup' }]) {
    assert.equal(parseImportedRecipe(page(value, canonical), source), null);
  }
  assert.equal(parseImportedRecipe(`<html><head><title>Soup</title>${canonical}</head></html>`, source), null);
  assert.equal(parseImportedRecipe(page(recipe()), source + '?tracking=1'), null);
  assert.equal(parseImportedRecipe(page(recipe()), 'http://recipes.example.test/soup'), null);
});
test('selects one associated recipe without mixing unrelated nodes', () => {
  const value = [recipe({ image: '/soup.jpg', description: 'Correct.' }), recipe({ name: 'Cake', url: 'https://recipes.example.test/cake', image: '/cake.jpg', description: 'Wrong.' })];
  const result = parseImportedRecipe(page(value), source);
  assert.equal(result?.imageUrl, 'https://recipes.example.test/soup.jpg');
  assert.equal(result?.summary, 'Correct.');
});
test('validates names, Unicode and source URLs without guessing replacements', () => {
  for (const name of [undefined, '', ' ', 1, 'x'.repeat(161), 'Soup\u0000', '\ud800']) assert.equal(parseImportedRecipe(page(recipe({ name })), source), null);
  assert.equal(parseImportedRecipe(page(recipe({ name: '  Lemon soup  ' })), source)?.title, 'Lemon soup');
  assert.equal(parseImportedRecipe(page(recipe({ url: 'https://recipes.exa\nmple.test/soup' })), source), null);
});
test('missing or invalid optional fields have honest fallbacks and never infer time', () => {
  for (const description of [undefined, null, '', {}, 'x'.repeat(8193), '\ud800', '\u0000']) {
    const result = parseImportedRecipe(page(recipe({ description, prepTime: 'PT10M' })), source);
    assert.equal(result?.summary, 'Summary unavailable.'); assert.equal(result?.time, null); assert.equal(result?.imageUrl, null);
  }
});
test('summary extraction decodes text, removes script/style and truncates without splitting Unicode', () => {
  assert.equal(parseImportedRecipe(page(recipe({ description: '<p>Lemon &amp; herbs</p><script>steal()</script><style>body{}</style><p>Serve warm.</p>' })), source)?.summary, 'Lemon & herbs Serve warm.');
  const summary = parseImportedRecipe(page(recipe({ description: 'x'.repeat(599) + '🍋tail' })), source)?.summary;
  assert.equal(summary, 'x'.repeat(599)); assert.ok(summary?.isWellFormed());
  assert.equal(parseImportedRecipe(page(recipe({ description: '&lt;img src=x onerror=alert(1)&gt;' })), source)?.summary, '<img src=x onerror=alert(1)>');
});
test('durations retain exact positive components and prefer total over cook', () => {
  assert.deepEqual(parseImportedRecipe(page(recipe({ totalTime: 'P1DT2H3M4S', cookTime: 'PT1M' })), source)?.time, { kind: 'total', text: '1 day 2 hours 3 minutes 4 seconds' });
  assert.deepEqual(parseImportedRecipe(page(recipe({ totalTime: 'PT0S', cookTime: 'PT1H' })), source)?.time, { kind: 'cook', text: '1 hour' });
  assert.deepEqual(parseImportedRecipe(page(recipe({ totalTime: 'PT60S' })), source)?.time, { kind: 'total', text: '60 seconds' });
  for (const totalTime of ['P', 'PT', 'P1Y', 'P1M', 'P1W', 'PT1.5H', '-PT1H', 'PT-1M', 'P8D', 'PT604801S', 'PT99999999999999999999S', 'PT0S', 25, 'PT1Mgarbage']) assert.equal(parseImportedRecipe(page(recipe({ totalTime })), source)?.time, null);
});
test('image candidates follow recipe-sized, unknown, page-bound OG, then small ordering', () => {
  const images = [{ url: '/large.jpg', width: 1200, height: 900 }, { contentUrl: photo, width: '480', height: '270' }, '/unknown.jpg'];
  assert.equal(parseImportedRecipe(page(recipe({ image: images })), source)?.imageUrl, photo);
  const head = `<link rel="canonical" href="${source}"><meta property="og:image" content="${photo}">`;
  assert.equal(parseImportedRecipe(page(recipe({ image: ['/unknown.jpg'] }), head), source)?.imageUrl, 'https://recipes.example.test/unknown.jpg');
  assert.equal(parseImportedRecipe(page(recipe({ image: { url: '/small.jpg', width: 320, height: 180 } }), head), source)?.imageUrl, photo);
  assert.equal(parseImportedRecipe(page(recipe({ image: { url: '/small.jpg', width: 320, height: 180 } })), source)?.imageUrl, 'https://recipes.example.test/small.jpg');
  assert.equal(parseImportedRecipe(page(recipe(), `<meta property="og:image" content="${photo}">`), source)?.imageUrl, null);
});
test('unsafe image values and conflicting page identities cannot supply a fallback image', () => {
  for (const image of ['javascript:alert(1)', 'http://images.example.test/a', 'https://127.0.0.1/a', 'https://user:pass@images.example.test/a', 'https://images.example.test:444/a', 'https://images.exa\nmple.test/a', { url: photo, width: 150, height: 150 }]) assert.equal(parseImportedRecipe(page(recipe({ image })), source)?.imageUrl, null);
  const head = `<link rel="canonical" href="${source}"><meta property="og:url" content="https://recipes.example.test/other"><meta property="og:image" content="${photo}">`;
  assert.equal(parseImportedRecipe(page(recipe(), head), source)?.imageUrl, null);
});
test('relative images use source URL despite an attacker base element', () => {
  assert.equal(parseImportedRecipe(page(recipe({ image: '../photo.jpg?x=1&y=2' }), '<base href="https://evil.example.test/">'), source)?.imageUrl, 'https://recipes.example.test/photo.jpg?x=1&y=2');
});
test('ignores one malformed JSON-LD script and never interprets executable scripts', () => {
  const html = '<script>throw Error("never execute")</script><script type="application/ld+json">{broken</script>' + ld(recipe());
  assert.equal(parseImportedRecipe(html, source)?.title, 'Lemon soup');
  assert.equal(parseImportedRecipe('<script>' + JSON.stringify(recipe()) + '</script>', source), null);
  assert.equal(parseImportedRecipe('<script type="Application/LD+JSON; charset=utf-8">' + JSON.stringify(recipe()) + '</script>', source)?.title, 'Lemon soup');
});
test('resource limits fail closed for HTML, JSON scripts, depth, values and images', () => {
  const overflows = [page(recipe({ padding: 'x'.repeat(131073) })), ld(recipe()).repeat(17), 'x'.repeat(1048577) + ld(recipe()), page(recipe({ image: Array.from({ length: 21 }, (_, n) => `/${n}.jpg`) })), '<div>'.repeat(257) + ld(recipe()) + '</div>'.repeat(257), page(recipe({ padding: Array.from({ length: 1001 }, () => 1) }))];
  let deep: unknown = recipe(); for (let n = 0; n < 14; n++) deep = { '@graph': [deep] }; overflows.push(page(deep));
  overflows.push(ld(recipe({ padding: 'a'.repeat(100000) })) + ld({ padding: 'b'.repeat(100000) }) + ld({ padding: 'c'.repeat(100000) }));
  for (const html of overflows) assert.equal(parseImportedRecipe(html, source), null);
});
