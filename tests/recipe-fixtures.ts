import type { RecipeTime } from "../lib/recipes/types.js";

type FixtureCandidate = {
  sourceUrl: string; title: string; methodText: string; imageUrl: string | null;
  imageEvidence: string | null; time: RecipeTime | null; timeEvidence: string | null;
};
type FixtureContent = { type: string; text?: string; annotations?: { type: string; url: string; title: string }[] };
type FixturePayload = Record<string, unknown> & { reasoning: { effort: string }; text?: { format: {
  type: string; strict: boolean; schema: { additionalProperties: boolean };
} } };

export function candidate(overrides: Partial<FixtureCandidate> = {}): FixtureCandidate {
  return {
    sourceUrl: "https://recipes.example.com/chickpeas",
    title: "Lemony chickpeas",
    methodText: "Soften onion, stir in chickpeas and simmer with lemon.",
    imageUrl: "https://images.example.com/chickpeas.jpg",
    imageEvidence: "The recipe photo is https://images.example.com/chickpeas.jpg",
    time: { kind: "cook", text: "20 minutes" },
    timeEvidence: "Cook time: 20 minutes",
    ...overrides,
  };
}

export function modelResponse(value: unknown, { citations = [], search = false, status = "completed" }: {
  citations?: string[]; search?: boolean; status?: string;
} = {}): { status: string; output: { type: string; status?: string; content?: FixtureContent[] }[] } {
  return {
    status,
    output: [
      ...(search ? [{ type: "web_search_call", status: "completed" }] : []),
      { type: "message", content: [{ type: "output_text", text: JSON.stringify(value),
        annotations: citations.map((url) => ({ type: "url_citation", url, title: "Recipe source" })) }] },
    ],
  };
}

export function research(candidates: FixtureCandidate[], options: { citations?: string[]; search?: boolean; status?: string } = {}) {
  return modelResponse({ outcome: candidates.length ? "recipes" : "no_results", candidates },
    { search: true, citations: candidates.map((item) => item.sourceUrl), ...options });
}

export function card(item = candidate(), overrides: Record<string, unknown> = {}) {
  return {
    candidateId: "recipe-1", title: item.title, sourceUrl: item.sourceUrl,
    imageUrl: item.imageUrl, summary: "Simmer chickpeas with softened onion and lemon.",
    time: item.time, methodEvidence: item.methodText,
    imageEvidence: item.imageEvidence, timeEvidence: item.timeEvidence, ...overrides,
  };
}

export function queuedTransport(...responses: unknown[]) {
  const calls: { url: string; signal: AbortSignal | null | undefined; payload: FixturePayload }[] = [];
  const transport: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), signal: init?.signal, payload: JSON.parse(String(init?.body)) });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    if (next instanceof Response) return next;
    if (next === undefined) throw new Error("Unexpected fixture transport call");
    return Response.json(next);
  };
  return { transport, calls };
}
