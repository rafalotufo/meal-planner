import assert from "node:assert/strict";
import test from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { createPhotoEnricher } from "../lib/recipes/photos.js";
import { jsonLd, photoRecipe } from "./recipe-photo-fixtures.js";

const options = () => ({ signal: new AbortController().signal, deadlineAt: Date.now() + 60000 });
const html = (source: string) => jsonLd({ "@type": "Recipe", url: source, image: "https://images.example.com/gnocchi.jpg" });

test("enrichment changes only image URLs and bounds/deduplicates exact source attempts", async () => {
  const calls: string[] = [];
  const enrich = createPhotoEnricher({ loadHtml: async (source) => { calls.push(source); return html(source); } });
  const recipes = Array.from({ length: 6 }, (_, index) => photoRecipe({ sourceUrl: `https://recipes.example.com/${index}` }));
  const input = [recipes[0], recipes[0], ...recipes.slice(1)];
  const output = await enrich(input, options());
  assert.equal(output.length, input.length);
  assert.equal(calls.length, 5);
  assert.equal(new Set(calls).size, 5);
  for (let index = 0; index < output.length; index++) {
    const { imageUrl: oldImage, ...original } = input[index];
    const { imageUrl, ...result } = output[index];
    assert.deepEqual(result, original);
    assert.equal(oldImage, null);
    assert.equal(imageUrl, index < 6 ? "https://images.example.com/gnocchi.jpg" : null);
  }
});

test("source access, invalid metadata and parse failures preserve valid cards and previous photos", async () => {
  const input = [photoRecipe({ imageUrl: "https://images.example.com/previous.jpg" })];
  for (const loadHtml of [async () => null, async () => { throw new Error("Source unavailable"); },
    async () => jsonLd({ "@type": "Recipe", url: "https://recipes.example.com/other", image: "https://images.example.com/wrong.jpg" })]) {
    assert.deepEqual(await createPhotoEnricher({ loadHtml })(input, options()), input);
  }
});

test("one module-wide two-job limit includes loading across factory instances and skips saturation", async () => {
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => { release = resolve; });
  let active = 0, maximum = 0, skippedCalls = 0;
  const first = createPhotoEnricher({ loadHtml: async (source) => {
    active++; maximum = Math.max(maximum, active);
    await waiting; active--; return html(source);
  } });
  const second = createPhotoEnricher({ loadHtml: async (source) => { skippedCalls++; return html(source); } });
  const pending = first([photoRecipe(), photoRecipe({ sourceUrl: "https://recipes.example.com/2" })], options());
  await nextTurn();
  const input = [photoRecipe({ sourceUrl: "https://recipes.example.com/3" })];
  assert.deepEqual(await second(input, options()), input);
  assert.equal(skippedCalls, 0);
  release(); await pending;
  assert.equal(maximum, 2);
  assert.equal((await second(input, options()))[0].imageUrl, "https://images.example.com/gnocchi.jpg");
});

test("near-parent-deadline and already-aborted searches start no optional work", async () => {
  let calls = 0;
  const enrich = createPhotoEnricher({ loadHtml: async () => { calls++; return null; } });
  const input = [photoRecipe()];
  assert.deepEqual(await enrich(input, { signal: new AbortController().signal, deadlineAt: Date.now() + 500 }), input);
  await assert.rejects(enrich(input, { signal: AbortSignal.abort(new Error("Caller stopped")), deadlineAt: Date.now() + 60000 }));
  assert.equal(calls, 0);
});

test("soft timeout keeps completed photos, cancels remaining work, and ignores late callbacks", async () => {
  let late!: (value: string | null) => void;
  let canceled = false;
  const deadlineAt = Date.now() + 1100;
  const enrich = createPhotoEnricher({ loadHtml: async (source, budget) => {
    assert.ok(budget.deadlineAt <= deadlineAt - 250);
    assert.ok(budget.deadlineAt <= Date.now() + 3000);
    if (source.endsWith("/gnocchi")) return html(source);
    budget.signal.addEventListener("abort", () => { canceled = true; }, { once: true });
    return new Promise<string | null>((resolve) => { late = resolve; });
  } });
  const input = [photoRecipe(), photoRecipe({ sourceUrl: "https://recipes.example.com/late" })];
  const output = await enrich(input, { signal: new AbortController().signal, deadlineAt });
  assert.ok(Date.now() < deadlineAt);
  assert.equal(canceled, true);
  assert.equal(output[0].imageUrl, "https://images.example.com/gnocchi.jpg");
  assert.equal(output[1].imageUrl, null);
  late(html(input[1].sourceUrl)); await nextTurn();
  assert.equal(output[1].imageUrl, null);
});

test("parent cancellation is authoritative and releases photo capacity", async () => {
  const aborter = new AbortController();
  let canceled = false;
  const enrich = createPhotoEnricher({ loadHtml: async (_source, budget) => {
    budget.signal.addEventListener("abort", () => { canceled = true; }, { once: true });
    return new Promise<string | null>(() => {});
  } });
  const pending = enrich([photoRecipe()], { signal: aborter.signal, deadlineAt: Date.now() + 60000 });
  await nextTurn(); aborter.abort(new Error("Caller stopped"));
  await assert.rejects(pending, /Caller stopped/);
  assert.equal(canceled, true);
  const available = createPhotoEnricher({ loadHtml: async (source) => html(source) });
  assert.equal((await available([photoRecipe()], options()))[0].imageUrl, "https://images.example.com/gnocchi.jpg");
});
