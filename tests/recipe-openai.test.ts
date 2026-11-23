import assert from "node:assert/strict";
import test from "node:test";
import { createOpenAIProvider } from "../lib/recipes/openai.js";
import { candidate, modelResponse, queuedTransport, research } from "./recipe-fixtures.js";

function provider(...responses: unknown[]) {
  const queued = queuedTransport(...responses);
  return { ...queued, service: createOpenAIProvider({ apiKey: "test-only-key", transport: queued.transport }) };
}
const options = () => ({ signal: new AbortController().signal });

test("completed explicit no-results is empty without citations or a curator call", async () => {
  const { service, calls } = provider(research([]));
  assert.deepEqual(await service.search("chickpeas", options()), []);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.openai.com/v1/responses");
  assert.equal(calls[0].payload.store, false);
  assert.equal(calls[0].payload.max_tool_calls, 8);
  assert.equal(calls[0].payload.max_output_tokens, 5000);
  assert.equal(calls[0].payload.tool_choice, "required");
  assert.deepEqual(calls[0].payload.tools, [{ type: "web_search", external_web_access: true }]);
  assert.equal(calls[0].payload.reasoning.effort, "low");
});

test("missing tool use and nonempty uncited research fail without a repair call", async () => {
  for (const response of [research([], { search: false }), research([candidate()], { citations: [] })]) {
    const { service, calls } = provider(response);
    await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
    assert.equal(calls.length, 1);
  }
});

test("incomplete, refused, malformed and contradictory research outcomes fail", async () => {
  const refused = { status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "No" }] }] };
  const malformed = research([]);
  malformed.output.at(-1)!.content![0].text = "not json";
  for (const response of [research([], { status: "incomplete" }), refused, malformed,
    modelResponse({ outcome: "recipes", candidates: [] }, { search: true }),
    modelResponse({ outcome: "no_results", candidates: [candidate()] }, { search: true }),
    research([candidate({ sourceUrl: "https://localhost/recipe" })])]) {
    const { service, calls } = provider(response);
    await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
    assert.equal(calls.length, 1);
  }
});

test("provider HTTP/errors, oversized bodies and excessive research context fail safely", async () => {
  const large = new Response("x".repeat(1024 * 1024 + 1));
  const largeResearch = research([candidate({ methodText: "x".repeat(20001) })]);
  for (const response of [new Response("private upstream diagnostic", { status: 429 }),
    new Error("private transport diagnostic"), large, largeResearch]) {
    const { service, calls } = provider(response);
    await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
    assert.equal(calls.length, 1);
  }
});

test("one combined request produces grounded public cards without internal evidence", async () => {
  const item = candidate();
  const { service, calls } = provider(research([item]),
    modelResponse({ recipes: [{ ...item, candidateId: "recipe-1" }] }));
  const signal = options();
  assert.deepEqual(await service.search("chickpeas", signal), [{ title: item.title,
    sourceUrl: item.sourceUrl, imageUrl: item.imageUrl,
    summary: "Simmer chickpeas with softened onion and lemon.", time: item.time }]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].signal, signal.signal);
  assert.equal(calls[0].payload.store, false);
  assert.equal(calls[0].payload.model, "gpt-6.2-sol");
  assert.equal(calls[0].payload.max_output_tokens, 5000);
  assert.equal(calls[0].payload.text, undefined);
});

test("native citation display spans inside source/title JSON strings do not corrupt grounded recipe identity", async () => {
  const item = candidate();
  const marker = `([Recipe source](${item.sourceUrl}))`;
  const response = research([candidate({ sourceUrl: `${item.sourceUrl} ${marker}`, title: `${item.title} ${marker}` })]);
  const content = response.output.at(-1)!.content![0];
  const text = content.text!;
  content.annotations = [];
  for (let offset = text.indexOf(marker); offset >= 0; offset = text.indexOf(marker, offset + marker.length)) {
    content.annotations.push({ type: "url_citation", url: item.sourceUrl, title: "Recipe source",
      start_index: offset, end_index: offset + marker.length });
  }
  const { service } = provider(response);
  const [recipe] = await service.search("chickpeas", options());
  assert.equal(recipe.sourceUrl, item.sourceUrl);
  assert.equal(recipe.title, item.title);
});

test("unannotated citation-looking source suffixes are rejected instead of used as URL authority", async () => {
  const item = candidate();
  const response = research([candidate({ sourceUrl: `${item.sourceUrl} ([Source](${item.sourceUrl}))` })],
    { citations: [item.sourceUrl] });
  const { service, calls } = provider(response);
  await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
  assert.equal(calls.length, 1);
});

test("citation cleanup resolves astral Unicode and inclusive/exclusive native character offsets", async () => {
  const item = candidate({ title: "🍋 Lemony chickpeas" });
  const marker = `([Source](${item.sourceUrl}))`;
  for (const codePoints of [false, true]) for (const inclusive of [false, true]) {
    const response = research([candidate({ ...item, title: `${item.title} ${marker}` })]);
    const content = response.output.at(-1)!.content![0];
    const text = content.text!;
    const start = text.indexOf(marker);
    content.annotations = [{ type: "url_citation", title: "Source", url: item.sourceUrl,
      start_index: codePoints ? Array.from(text.slice(0, start)).length : start,
      end_index: (codePoints ? Array.from(text.slice(0, start + marker.length)).length : start + marker.length) - Number(inclusive) }];
    const { service } = provider(response);
    assert.equal((await service.search("chickpeas", options()))[0]?.title, item.title);
  }
});

test("native citation offsets are local to each output text part", async () => {
  const item = candidate();
  const marker = `([Source](${item.sourceUrl}))`;
  const response = research([candidate({ sourceUrl: `${item.sourceUrl} ${marker}`, title: `${item.title} ${marker}` })]);
  const message = response.output.at(-1)!;
  const text = message.content![0].text!;
  const split = text.indexOf(marker, text.indexOf('"title"'));
  message.content = [text.slice(0, split), text.slice(split)].map((part) => {
    const start = part.indexOf(marker);
    return { type: "output_text", text: part, annotations: [{ type: "url_citation", title: "Source",
      url: item.sourceUrl, start_index: start, end_index: start + marker.length }] };
  });
  const { service } = provider(response);
  assert.equal((await service.search("chickpeas", options()))[0]?.sourceUrl, item.sourceUrl);
});

test("invalid, overlapping and absent native offsets cannot recover contaminated URL strings", async () => {
  const item = candidate();
  const marker = `([Source](${item.sourceUrl}))`;
  for (const mode of ["missing", "out-of-range", "overlap", "json-syntax"]) {
    const response = research([candidate({ sourceUrl: `${item.sourceUrl} ${marker}` })]);
    const content = response.output.at(-1)!.content![0];
    const start = content.text!.indexOf(marker);
    const annotation = { type: "url_citation", title: "Source", url: item.sourceUrl,
      start_index: start, end_index: start + marker.length };
    content.annotations = mode === "missing" ? [{ type: "url_citation", title: "Source", url: item.sourceUrl }]
      : mode === "out-of-range" ? [{ ...annotation, end_index: content.text!.length + 1 }]
      : mode === "json-syntax" ? [{ ...annotation, start_index: 0, end_index: content.text!.length }]
      : [annotation, { ...annotation, start_index: start + 1, end_index: start + marker.length - 1 }];
    const { service, calls } = provider(response);
    await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
    assert.equal(calls.length, 1);
  }
});

test("identical native citation ranges deduplicate before overlap detection", async () => {
  const item = candidate();
  const marker = `([Source](${item.sourceUrl}))`;
  const response = research([candidate({ sourceUrl: `${item.sourceUrl} ${marker}` })]);
  const content = response.output.at(-1)!.content![0];
  const start = content.text!.indexOf(marker);
  const annotation = { type: "url_citation", title: "Source", url: item.sourceUrl,
    start_index: start, end_index: start + marker.length };
  content.annotations = [annotation, { ...annotation }];
  const { service } = provider(response);
  assert.equal((await service.search("chickpeas", options()))[0]?.sourceUrl, item.sourceUrl);
});

test("ambiguous native index interpretations do not trigger broad display-marker removal", async () => {
  const sourceUrl = "https://a.example.com/r";
  const marker = `([S](${sourceUrl}))`;
  const item = candidate({ title: "🍋".repeat(marker.length), sourceUrl });
  const { title, ...fields } = item;
  const raw = { title, ...fields, sourceUrl: `${sourceUrl}${marker}${marker}` };
  const response = research([raw]);
  const content = response.output.at(-1)!.content![0];
  const start = content.text!.indexOf(marker);
  content.annotations = [{ type: "url_citation", title: "Source", url: sourceUrl,
    start_index: start, end_index: start + marker.length }];
  const { service, calls } = provider(response);
  await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
  assert.equal(calls.length, 1);
});

test("method evidence cannot be borrowed from another record, and invalid summaries are omitted", async () => {
  const second = candidate({ sourceUrl: "https://recipes.example.com/beans", title: "Baked beans",
    methodText: "Bake beans with tomato until tender.", summary: "Bake beans with tomato." });
  for (const overrides of [{ methodEvidence: second.methodText }, { summary: "" },
    { summary: "x".repeat(601) }, { methodEvidence: "" }, { methodEvidence: "x".repeat(4001) }]) {
    const { service, calls } = provider(research([candidate(overrides), second]));
    const results = await service.search("dinner", options());
    assert.deepEqual(results.map((recipe) => recipe.sourceUrl), [second.sourceUrl]);
    assert.equal(calls.length, 1);
  }
});

test("unsafe and uncited source records cannot gain authority from another recipe", async () => {
  const item = candidate();
  for (const sourceUrl of ["https://uncited.example.com/recipe", "https://localhost/recipe",
    "javascript:alert(1)", `${item.sourceUrl}?utm_source=openai`]) {
    const { service, calls } = provider(research([candidate({ sourceUrl })], { citations: [item.sourceUrl] }));
    await assert.rejects(service.search("dinner", options()), { code: "SEARCH_FAILED" });
    assert.equal(calls.length, 1);
  }
});

test("optional excerpts stay local and unsupported metadata is null without discarding the card", async () => {
  const second = candidate({ sourceUrl: "https://recipes.example.com/beans", title: "Baked beans",
    methodText: "Bake beans with tomato until tender.", summary: "Bake beans with tomato.",
    imageUrl: "https://images.example.com/beans.jpg", imageEvidence: "Another recipe's photo",
    time: { kind: "total", text: "1 hour" }, timeEvidence: "Total time: 1 hour" });
  const swapped = candidate({ imageEvidenceExcerpt: second.imageEvidence,
    timeEvidenceExcerpt: second.timeEvidence });
  const { service: paired, calls: pairedCalls } = provider(research([swapped, second]));
  const [firstCard, secondCard] = await paired.search("dinner", options());
  assert.equal(firstCard.imageUrl, null);
  assert.equal(firstCard.time, null);
  assert.equal(secondCard.imageUrl, second.imageUrl);
  assert.deepEqual(secondCard.time, second.time);
  assert.equal(pairedCalls.length, 1);
  for (const overrides of [
    { imageEvidenceExcerpt: "Another recipe's photo", timeEvidenceExcerpt: "Total time: 1 hour" },
    { imageEvidenceExcerpt: null, timeEvidenceExcerpt: null },
    { imageEvidence: null, timeEvidence: null },
    { imageUrl: "javascript:alert(1)", time: { kind: "total", text: "" } },
    { imageEvidence: "x".repeat(1001), timeEvidence: "x".repeat(1001) },
    { imageEvidenceExcerpt: "x".repeat(1001), timeEvidenceExcerpt: "x".repeat(1001) },
  ]) {
    const raw = { ...candidate(), ...overrides };
    const { service, calls } = provider(modelResponse({ outcome: "recipes", candidates: [raw] },
      { search: true, citations: [raw.sourceUrl] }));
    const [result] = await service.search("dinner", options());
    assert.equal(result.imageUrl, null);
    assert.equal(result.time, null);
    assert.equal(result.title, raw.title);
    assert.equal(calls.length, 1);
  }
  const missing = { ...candidate(), imageUrl: 42, time: 42,
    imageEvidence: undefined, timeEvidence: undefined };
  const { service } = provider(modelResponse({ outcome: "recipes", candidates: [missing] },
    { search: true, citations: [missing.sourceUrl] }));
  const [result] = await service.search("dinner", options());
  assert.equal(result.imageUrl, null);
  assert.equal(result.time, null);
});

test("an invalid card cannot suppress a later valid duplicate, and six emitted sources are distinct", async () => {
  const items = Array.from({ length: 7 }, (_, index) => candidate({ sourceUrl: `https://recipes.example.com/${index}` }));
  const { service, calls } = provider(research([candidate({ ...items[0], summary: "" }),
    items[0], items[0], ...items.slice(1)]));
  const results = await service.search("dinner", options());
  assert.equal(results.length, 6);
  assert.equal(new Set(results.map((item) => item.sourceUrl)).size, 6);
  assert.deepEqual(results.map((item) => item.sourceUrl), items.slice(0, 6).map((item) => item.sourceUrl));
  assert.equal(calls.length, 1);
});

test("usable sources with rejected cards may be empty, but malformed roots never become no-results", async () => {
  const { service, calls } = provider(research([candidate({ summary: "" })]));
  assert.deepEqual(await service.search("dinner", options()), []);
  assert.equal(calls.length, 1);
  for (const raw of [null, [], { candidates: [] }, { outcome: "no_results" },
    { outcome: "unknown", candidates: [] }, { outcome: "recipes", candidates: [null, 42] }]) {
    const { service: failing, calls: failedCalls } = provider(modelResponse(raw, { search: true }));
    await assert.rejects(failing.search("dinner", options()), { code: "SEARCH_FAILED" });
    assert.equal(failedCalls.length, 1);
  }
});

test("configured model is retained and an already-aborted search makes no request", async () => {
  const queued = queuedTransport(research([candidate()]));
  const service = createOpenAIProvider({ apiKey: "test-only-key", model: "configured-search-model", transport: queued.transport });
  await service.search("dinner", options());
  assert.equal(queued.calls[0].payload.model, "configured-search-model");
  assert.equal(queued.calls.length, 1);
  const controller = new AbortController();
  const reason = new Error("parent canceled");
  controller.abort(reason);
  await assert.rejects(service.search("dinner", { signal: controller.signal }), (error) => error === reason);
  assert.equal(queued.calls.length, 1);
});

test("abort during the provider request preserves the parent reason without a retry", async () => {
  const controller = new AbortController();
  const reason = new Error("parent canceled");
  let calls = 0;
  const service = createOpenAIProvider({ apiKey: "test-only-key", transport: async (_url, init) => {
    calls++;
    assert.equal(init?.signal, controller.signal);
    controller.abort(reason);
    throw new Error("private abort transport diagnostic");
  } });
  await assert.rejects(service.search("dinner", { signal: controller.signal }), (error) => error === reason);
  assert.equal(calls, 1);
});
