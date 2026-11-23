import assert from "node:assert/strict";
import test from "node:test";
import { createOpenAIProvider } from "../lib/recipes/openai.js";
import { candidate, card, modelResponse, queuedTransport, research } from "./recipe-fixtures.js";

function provider(...responses: unknown[]) {
  const queued = queuedTransport(...responses);
  return { ...queued, service: createOpenAIProvider({ apiKey: "test-credential", transport: queued.transport }) };
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
    const { service } = provider(response);
    await assert.rejects(service.search("chickpeas", options()), { code: "SEARCH_FAILED" });
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
