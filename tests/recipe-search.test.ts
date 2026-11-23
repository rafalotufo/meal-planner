import assert from "node:assert/strict";
import test from "node:test";
import { setImmediate as nextTurn, setTimeout as delay } from "node:timers/promises";
import { createRecipeProvider, createSearchHandler } from "../lib/recipes/search.js";
import { SearchError } from "../lib/recipes/errors.js";
import type { Recipe, RecipeSearchProvider } from "../lib/recipes/types.js";

function request(body: unknown = { query: "  chickpeas  " }, headers: HeadersInit = {}) {
  return new Request("https://meal.example.com/api/recipes/search", {
    method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
  });
}
function handler(search: RecipeSearchProvider["search"] = async () => []) {
  const calls: string[] = [];
  return { calls, run: createSearchHandler({ getProvider: () => ({ search: (query, options) => {
    calls.push(query); return search(query, options);
  } }) }) };
}

test("valid search trims input and returns only the common response with no-store", async () => {
  const { run, calls } = handler();
  const response = await run(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), { recipes: [] });
  assert.deepEqual(calls, ["chickpeas"]);
});

test("invalid query shapes, JSON, media type and origin invoke no provider", async () => {
  const { run, calls } = handler();
  for (const body of [{ query: "" }, { query: "   " }, { query: "x".repeat(1001) },
    { query: 2 }, { query: "a", extra: true }, [], null]) {
    assert.equal((await run(request(body))).status, 400);
  }
  assert.equal((await run(new Request("https://meal.example.com/api/recipes/search", {
    method: "POST", body: "{", headers: { "Content-Type": "application/json" },
  }))).status, 400);
  assert.equal((await run(request({ query: "a" }, { "Content-Type": "text/plain" }))).status, 415);
  assert.equal((await run(request({ query: "a" }, { Origin: "https://other.example.com" }))).status, 403);
  assert.deepEqual(calls, []);
});

test("actual streamed body limit is enforced without trusting Content-Length", async () => {
  const { run, calls } = handler();
  const init: RequestInit & { duplex: "half" } = { method: "POST", duplex: "half",
    headers: { "Content-Type": "application/json" },
    body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(8193)); controller.close(); } }),
  };
  const response = await run(new Request("https://meal.example.com/api/recipes/search", init));
  assert.equal(response.status, 413);
  assert.deepEqual(calls, []);
});

test("missing key and unsupported provider are controlled unavailable configuration", async () => {
  for (const config of [{}, { RECIPE_SEARCH_PROVIDER: "gemini", OPENAI_API_KEY: "test-only-key" }]) {
    const run = createSearchHandler({ getProvider: () => createRecipeProvider(config) });
    const response = await run(request());
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, "SEARCH_UNAVAILABLE");
  }
});

test("raw provider failures are sanitized and do not leak diagnostics", async () => {
  const { run } = handler(async () => { throw new Error("private credential diagnostic"); });
  const response = await run(request());
  assert.equal(response.status, 502);
  const text = await response.text();
  assert.equal(text.includes("private"), false);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("concurrency rejects excess work and releases slots after success and failure", async () => {
  let resolve!: (value: Recipe[]) => void;
  let calls = 0;
  const waiting = new Promise<Recipe[]>((done) => { resolve = done; });
  const run = createSearchHandler({ getProvider: () => ({ search: async () => { calls++; return waiting; } }) });
  const first = run(request());
  const second = run(request());
  await nextTurn();
  assert.equal(calls, 2);
  assert.equal((await run(request())).status, 429);
  assert.equal(calls, 2);
  resolve([]);
  assert.deepEqual((await Promise.all([first, second])).map((response) => response.status), [200, 200]);
  assert.equal((await run(request())).status, 200);
  const failing = handler(async () => { throw new SearchError("SEARCH_FAILED"); });
  for (let count = 0; count < 3; count++) assert.equal((await failing.run(request())).status, 502);
});

test("twenty accepted searches per rolling minute expire without storing query identities", async () => {
  let now = 0;
  let calls = 0;
  const run = createSearchHandler({ now: () => now,
    getProvider: () => ({ search: async () => { calls++; return []; } }) });
  for (let count = 0; count < 20; count++) assert.equal((await run(request())).status, 200);
  assert.equal((await run(request())).status, 429);
  assert.equal(calls, 20);
  now = 60000;
  assert.equal((await run(request())).status, 200);
});

test("invalid intake and missing configuration release slots without spending accepted-search allowance", async () => {
  let configured = false;
  let calls = 0;
  const run = createSearchHandler({ getProvider: () => {
    if (!configured) throw new SearchError("SEARCH_UNAVAILABLE");
    return { search: async () => { calls++; return []; } };
  } });
  for (let count = 0; count < 25; count++) assert.equal((await run(request({ query: "" }))).status, 400);
  for (let count = 0; count < 25; count++) assert.equal((await run(request())).status, 503);
  assert.equal(calls, 0);
  configured = true;
  for (let count = 0; count < 20; count++) assert.equal((await run(request())).status, 200);
  assert.equal(calls, 20);
  assert.equal((await run(request())).status, 429);
});

test("deadline aborts the provider and cleans up its slot", async () => {
  let aborted = false;
  let shouldWait = true;
  const run = createSearchHandler({ timeoutMs: 10, getProvider: () => ({ search: async (_query, { signal }) => {
    if (!shouldWait) return [];
    return new Promise<Recipe[]>((_resolve, reject) => {
      signal.addEventListener("abort", () => { aborted = true; reject(signal.reason); }, { once: true });
    });
  } }) });
  assert.equal((await run(request())).status, 504);
  assert.equal(aborted, true);
  shouldWait = false;
  assert.equal((await run(request())).status, 200);
});

test("caller abort reaches the provider and permits another request", async () => {
  const controller = new AbortController();
  let observed = false;
  let shouldWait = true;
  const run = createSearchHandler({ getProvider: () => ({ search: async (_query, { signal }) => {
    if (!shouldWait) return [];
    return new Promise<Recipe[]>((_resolve, reject) => {
      signal.addEventListener("abort", () => { observed = true; reject(signal.reason); }, { once: true });
    });
  } }) });
  const input = request();
  const pending = run(new Request(input, { signal: controller.signal }));
  await nextTurn();
  controller.abort();
  assert.equal((await pending).status, 504);
  assert.equal(observed, true);
  shouldWait = false;
  assert.equal((await run(request())).status, 200);
});

function stalledRequest({ signal, contentType = "application/json", oversized = false }: {
  signal?: AbortSignal; contentType?: string; oversized?: boolean;
} = {}) {
  let canceled = false;
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let finishCancel!: () => void;
  const cancelFinished = new Promise<void>((resolve) => { finishCancel = resolve; });
  const stream = new ReadableStream<Uint8Array>({
    start(value) { controller = value; if (oversized) value.enqueue(new Uint8Array(8193)); },
    cancel() { canceled = true; return cancelFinished; },
  });
  const init: RequestInit & { duplex: "half" } = { method: "POST", duplex: "half", signal,
    headers: { "Content-Type": contentType }, body: stream };
  return { input: new Request("https://meal.example.com/api/recipes/search", init),
    canceled: () => canceled, cleanup: () => { if (!canceled) controller.close(); finishCancel(); } };
}

test("the shared deadline cancels a never-closing request body before provider invocation", async () => {
  let calls = 0;
  const run = createSearchHandler({ timeoutMs: 10, getProvider: () => ({ search: async () => { calls++; return []; } }) });
  const body = stalledRequest();
  const pending = run(body.input);
  const observed = await Promise.race([pending, delay(100).then(() => null)]);
  const canceled = body.canceled();
  body.cleanup();
  await pending;
  assert.equal(observed?.status, 504);
  assert.equal(canceled, true);
  assert.equal(calls, 0);
  assert.equal((await run(request())).status, 200);
});

test("caller abort during body intake cancels the reader and frees admission", async () => {
  let calls = 0;
  const run = createSearchHandler({ getProvider: () => ({ search: async () => { calls++; return []; } }) });
  const aborter = new AbortController();
  const body = stalledRequest({ signal: aborter.signal });
  const pending = run(body.input);
  await nextTurn();
  aborter.abort();
  const observed = await Promise.race([pending, delay(100).then(() => null)]);
  const canceled = body.canceled();
  body.cleanup();
  await pending;
  assert.equal(observed?.status, 504);
  assert.equal(canceled, true);
  assert.equal(calls, 0);
  assert.equal((await run(request())).status, 200);
});

test("unsupported and oversized streamed bodies cancel without waiting for an uncooperative cancel hook", async () => {
  const { run, calls } = handler();
  for (const [options, status] of [[{ contentType: "text/plain" }, 415], [{ oversized: true }, 413]] as const) {
    const body = stalledRequest(options);
    const pending = run(body.input);
    const observed = await Promise.race([pending, delay(100).then(() => null)]);
    const canceled = body.canceled();
    body.cleanup();
    await pending;
    assert.equal(observed?.status, status);
    assert.equal(canceled, true);
  }
  assert.deepEqual(calls, []);
});
