import assert from "node:assert/strict";
import test from "node:test";
import { selectRecipePhoto } from "../lib/recipes/photo-metadata.js";
import { jsonLd, photoRecipe } from "./recipe-photo-fixtures.js";

const recipe = photoRecipe();
const source = recipe.sourceUrl;
const picture = "https://images.example.com/gnocchi.jpg";
const page = (head: string, body = "") => `<html><head>${head}</head><body>${body}</body></html>`;
const canonical = `<link rel="canonical" href="${source}">`;
const node = (image: unknown, overrides = {}) => ({ "@type": "Recipe", url: source, name: recipe.title, image, ...overrides });
const selected = (html: string) => selectRecipePhoto(html, recipe)?.imageUrl ?? null;

test("Recipe URL, array and ImageObject forms select only source-provided image variants", () => {
  for (const image of [picture, [picture], { "@type": "ImageObject", url: picture },
    { contentUrl: picture, url: "https://images.example.com/other.jpg" }]) {
    assert.equal(selected(page("", jsonLd(node(image)))), picture);
  }
  assert.equal(selected(page("", jsonLd({ "@graph": [{ "@type": "WebPage" }, node(picture, { "@type": ["Thing", "https://schema.org/Recipe"] })] }))), picture);
});

test("explicit recipe identity and page-bound unique unidentified Recipe keep photos source-specific", () => {
  assert.equal(selected(page(canonical, jsonLd({ "@type": "Recipe", name: "POTATO — GNOCCHI!", image: picture }))), picture);
  assert.equal(selected(page("", jsonLd(node(picture, { url: `${source}#recipe` })))), picture);
  assert.equal(selected(page(canonical, jsonLd(node(picture, { url: "https://recipes.example.com/other" })))), null);
  assert.equal(selected(page(canonical, jsonLd({ "@type": "Recipe", name: "Other recipe", image: picture }))), null);
  assert.equal(selected(page(canonical, jsonLd([{ "@type": "Recipe", name: recipe.title, image: picture },
    { "@type": "Recipe", name: "Related", image: picture }]))), null);
  assert.equal(selected(page(canonical, jsonLd({ "@type": "WebPage", related: node(picture) }))), null);
});

test("conflicting explicit/page identities and unsafe metadata cannot recover unrelated images", () => {
  assert.equal(selected(page(canonical, jsonLd(node(picture, { "@id": "https://recipes.example.com/other" })))), null);
  assert.equal(selected(page(canonical, jsonLd(node(picture, {
    mainEntityOfPage: { "@id": source, url: "https://recipes.example.com/other" },
  })))), null);
  const unidentified = jsonLd({ "@type": "Recipe", name: recipe.title, image: picture });
  for (const identity of [`<link rel="canonical" href="https://recipes.example.com/other">`,
    `${canonical}<meta property="og:url" content="https://recipes.example.com/other">`,
    `<link rel="canonical" href="http://127.0.0.1/a">`]) assert.equal(selected(page(identity, unidentified)), null);
  for (const image of ["", "   ", "javascript:alert(1)", "http://images.example.com/a", "https://127.0.0.1/a",
    "https://user:pass@images.example.com/a", "https://images.example.com:444/a"]) {
    assert.equal(selected(page("", jsonLd(node(image)))), null);
  }
});

test("adequate recipe images choose the smallest declared adequate area before unknown and publisher ties", () => {
  const result = selectRecipePhoto(page("", jsonLd(node([
    "https://images.example.com/unknown.jpg",
    { url: "https://images.example.com/large.jpg", width: 1000, height: 800 },
    { url: picture, width: "480", height: "270" },
    { url: "https://images.example.com/tie.jpg", width: 480, height: 270 },
  ]))), recipe);
  assert.equal(result?.imageUrl, picture);
  assert.equal(result?.width, 480);
  assert.equal(result?.height, 270);
});

test("unknown dimensions preserve publisher order and never infer size or rewrite filenames", () => {
  const unknown = "https://images.example.com/declared-150x150.jpg";
  assert.equal(selected(page(canonical + `<meta property="og:image" content="${picture}">`, jsonLd(node([unknown, picture])))), unknown);
  assert.equal(selected(page("", jsonLd(node([{ url: picture, width: "not-a-number", height: 300 }])))), picture);
  assert.equal(selected(page("", jsonLd(node([{ url: picture, width: 150, height: 150 }])))), null);
});

test("page-bound OG fallback groups dimensions/secure URL with preceding root image", () => {
  const head = canonical + `<meta property="og:image" content="https://images.example.com/large.jpg">
    <meta property="og:image:width" content="1200"><meta property="og:image:height" content="800">
    <meta property="og:image:url" content="http://images.example.com/fallback.jpg">
    <meta property="og:image:secure_url" content="${picture}">
    <meta property="og:image:width" content="480"><meta property="og:image:height" content="270">`;
  assert.equal(selected(page(head)), picture);
  assert.equal(selected(page(`<meta property="og:image" content="${picture}">`)), null);
  assert.equal(selected(page(head, jsonLd(node([{ url: "https://images.example.com/small.jpg", width: 320, height: 180 }])))), picture);
});

test("relative/HTML-escaped image URLs use the exact source instead of attacker HTML base", () => {
  assert.equal(selected(page(`<base href="https://evil.example.com/">`, jsonLd(node("../gnocchi.jpg?x=1&y=2")))),
    "https://recipes.example.com/gnocchi.jpg?x=1&y=2");
  assert.equal(selected(page(canonical + `<meta property="og:image" content="/gnocchi.jpg?x=1&amp;y=2">`)),
    "https://recipes.example.com/gnocchi.jpg?x=1&y=2");
});

test("metadata bounds and ambiguity fail closed without evaluating scripts or collecting body images", () => {
  assert.equal(selected(page(canonical, `<img src="${picture}"><script>throw Error('never execute')</script>`)), null);
  assert.equal(selected(page(canonical, `<script type="application/ld+json">{broken</script>` + jsonLd(node(picture)))), picture);
  assert.equal(selected(page("", jsonLd(node(picture)).repeat(17))), null);
  assert.equal(selected(page("", jsonLd(node(picture, { padding: "x".repeat(131073) })))), null);
  const excessImages = Array.from({ length: 21 }, (_, index) => `https://images.example.com/${index}.jpg`);
  assert.equal(selected(page("", jsonLd(node(excessImages)))), null);
  let deep: unknown = node(picture);
  for (let depth = 0; depth < 14; depth++) deep = { "@graph": [deep] };
  assert.equal(selected(page("", jsonLd(deep))), null);
});
