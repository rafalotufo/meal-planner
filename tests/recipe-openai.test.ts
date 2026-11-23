import assert from "node:assert/strict";
import test from "node:test";
import { createOpenAIProvider } from "../lib/recipes/openai.js";
import { candidate, card, modelResponse, queuedTransport, research } from "./recipe-fixtures.js";

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

test("missing tool use and nonempty uncited research fail before curation", async () => {
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
    const { service } = provider(response);
    await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
  }
});

test("grounded research produces public cards through a tool-free strict curator", async () => {
  const item = candidate();
  const { service, calls } = provider(research([item]), modelResponse({ recipes: [card(item)] }));
  const signal = options();
  assert.deepEqual(await service.search("chickpeas", signal), [{ title: item.title,
    sourceUrl: item.sourceUrl, imageUrl: item.imageUrl,
    summary: "Simmer chickpeas with softened onion and lemon.", time: item.time }]);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].signal, signal.signal);
  assert.equal(calls[1].payload.store, false);
  assert.deepEqual(calls[1].payload.tools, []);
  assert.equal(calls[1].payload.max_output_tokens, 3000);
  assert.equal(calls[1].payload.text?.format.type, "json_schema");
  assert.equal(calls[1].payload.text?.format.strict, true);
  assert.equal(calls[1].payload.text?.format.schema.additionalProperties, false);
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
  const { service } = provider(response, modelResponse({ recipes: [card(item)] }));
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
    const { service } = provider(response, modelResponse({ recipes: [card(item)] }));
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
  const { service } = provider(response, modelResponse({ recipes: [card(item)] }));
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
  const { service } = provider(response, modelResponse({ recipes: [card(item)] }));
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

test("method/source/title/ID mismatches drop cards instead of borrowing another recipe's evidence", async () => {
  const first = candidate();
  const second = candidate({ sourceUrl: "https://recipes.example.com/beans", title: "Baked beans",
    methodText: "Bake beans with tomato until tender.", imageUrl: "https://images.example.com/beans.jpg",
    imageEvidence: "Bean photo", time: { kind: "total", text: "1 hour" }, timeEvidence: "Total time: 1 hour" });
  for (const wrong of [card(first, { candidateId: "unknown" }), card(first, { sourceUrl: second.sourceUrl }),
    card(first, { title: second.title }), card(first, { methodEvidence: second.methodText }),
    card(first, { summary: "" }), card(first, { sourceUrl: "https://uncited.example.com/recipe" })]) {
    const { service } = provider(research([first, second]), modelResponse({ recipes: [wrong] }));
    assert.deepEqual(await service.search("dinner", options()), []);
  }
});

test("swapped optional evidence becomes null while the correctly grounded method survives", async () => {
  const first = candidate();
  const second = candidate({ sourceUrl: "https://recipes.example.com/beans", title: "Beans",
    methodText: "Bake beans.", imageUrl: "https://images.example.com/beans.jpg", imageEvidence: "Bean photo",
    time: { kind: "total", text: "1 hour" }, timeEvidence: "Total time: 1 hour" });
  for (const overrides of [
    { imageUrl: second.imageUrl, imageEvidence: second.imageEvidence, time: second.time, timeEvidence: second.timeEvidence },
    { imageEvidence: second.imageEvidence, timeEvidence: second.timeEvidence },
    { imageUrl: "javascript:alert(1)", timeEvidence: null },
  ]) {
    const { service } = provider(research([first, second]), modelResponse({ recipes: [card(first, overrides)] }));
    const [result] = await service.search("dinner", options());
    assert.equal(result.imageUrl, null);
    assert.equal(result.time, null);
    assert.equal(result.title, first.title);
  }
});

test("research and curation deduplicate source identity and enforce six cards", async () => {
  const items = Array.from({ length: 7 }, (_, index) => candidate({ sourceUrl: `https://recipes.example.com/${index}` }));
  const { service } = provider(research([items[0], items[0], ...items.slice(1)]),
    modelResponse({ recipes: [card(items[0]), ...items.map((item, index) => card(item, { candidateId: `recipe-${index + 1}` }))] }));
  const results = await service.search("dinner", options());
  assert.equal(results.length, 6);
  assert.equal(new Set(results.map((item) => item.sourceUrl)).size, 6);
});

test("empty curator output succeeds, while malformed/incomplete curator output fails", async () => {
  const { service } = provider(research([candidate()]), modelResponse({ recipes: [] }));
  assert.deepEqual(await service.search("dinner", options()), []);
  for (const response of [modelResponse({ wrong: [] }), modelResponse({ recipes: [] }, { status: "incomplete" }),
    { status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "No" }] }] }]) {
    const { service: failing } = provider(research([candidate()]), response);
    await assert.rejects(failing.search("dinner", options()), { code: "SEARCH_FAILED" });
  }
});
