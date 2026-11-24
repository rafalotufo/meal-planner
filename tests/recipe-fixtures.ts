import type { RecipeTime } from "../lib/recipes/types.js";

type FixtureCandidate = {
  sourceUrl: string; title: string; methodText: string; imageUrl: string | null;
  imageEvidence: string | null; time: RecipeTime | null; timeEvidence: string | null;
  summary: string; methodEvidence: string;
  imageEvidenceExcerpt: string | null; timeEvidenceExcerpt: string | null;
};
type FixtureContent = { type: string; text?: string; annotations?: {
  type: string; url: string; title: string; start_index?: number; end_index?: number;
}[] };
type FixturePayload = Record<string, unknown> & { reasoning: { effort: string } };

export function candidate(overrides: Partial<FixtureCandidate> = {}): FixtureCandidate {
  const observed = {
    sourceUrl: "https://recipes.example.com/chickpeas",
    title: "Lemony chickpeas",
    methodText: "Soften onion, stir in chickpeas and simmer with lemon.",
    imageUrl: "https://images.example.com/chickpeas.jpg",
    imageEvidence: "The recipe photo is https://images.example.com/chickpeas.jpg",
    time: { kind: "cook" as const, text: "20 minutes" },
    timeEvidence: "Cook time: 20 minutes",
    ...overrides,
  };
  return { summary: "Simmer chickpeas with softened onion and lemon.",
    methodEvidence: observed.methodText, imageEvidenceExcerpt: observed.imageEvidence,
    timeEvidenceExcerpt: observed.timeEvidence, ...observed, ...overrides };
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
