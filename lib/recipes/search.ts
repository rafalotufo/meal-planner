import { SearchError, type SearchErrorCode } from "./errors";
import { createOpenAIProvider } from "./openai";
import type { RecipeSearchProvider } from "./types";
import { isRecord, validateQuery } from "./validation";

const ERRORS: Record<SearchErrorCode, { status: number; message: string }> = {
  INVALID_REQUEST: { status: 400, message: "Enter a recipe description between 1 and 1,000 characters." },
  UNSUPPORTED_MEDIA_TYPE: { status: 415, message: "Send the search as JSON." },
  REQUEST_TOO_LARGE: { status: 413, message: "This search request is too large." },
  FORBIDDEN_ORIGIN: { status: 403, message: "This search request is not allowed." },
  SEARCH_UNAVAILABLE: { status: 503, message: "Recipe search is not available yet. Please try again later." },
  SEARCH_BUSY: { status: 429, message: "Recipe search is busy. Please try again shortly." },
  SEARCH_TIMEOUT: { status: 504, message: "We couldn’t finish the search. Please try again." },
  SEARCH_FAILED: { status: 502, message: "We couldn’t finish the search. Please try again." },
};

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

function errorResponse(code: SearchErrorCode) {
  const { status, message } = ERRORS[code];
  return json({ error: { code, message } }, status);
}

async function readQuery(request: Request): Promise<string> {
  if (!request.body) throw new SearchError("INVALID_REQUEST");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); throw new SearchError("REQUEST_TOO_LARGE"); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const body: unknown = JSON.parse(text);
    if (!isRecord(body) || Object.keys(body).length !== 1) throw new SearchError("INVALID_REQUEST");
    const query = validateQuery(body.query);
    if (!query) throw new SearchError("INVALID_REQUEST");
    return query;
  } catch (error) {
    throw error instanceof SearchError ? error : new SearchError("INVALID_REQUEST");
  } finally { reader.releaseLock(); }
}

export function createRecipeProvider(config: {
  RECIPE_SEARCH_PROVIDER?: string; OPENAI_API_KEY?: string; OPENAI_RECIPE_MODEL?: string;
}, transport?: typeof fetch): RecipeSearchProvider {
  const provider = config.RECIPE_SEARCH_PROVIDER?.trim().toLowerCase() || "openai";
  const apiKey = config.OPENAI_API_KEY?.trim();
  if (provider !== "openai" || !apiKey) throw new SearchError("SEARCH_UNAVAILABLE");
  return createOpenAIProvider({ apiKey, model: config.OPENAI_RECIPE_MODEL?.trim() || undefined, transport });
}

export function createSearchHandler({ getProvider, now = Date.now, timeoutMs = 60000 }: {
  getProvider: () => RecipeSearchProvider; now?: () => number; timeoutMs?: number;
}) {
  let active = 0;
  let accepted: number[] = [];
  return async function search(request: Request): Promise<Response> {
    try {
      if (request.signal.aborted) throw new SearchError("SEARCH_TIMEOUT");
      const origin = request.headers.get("Origin");
      if (origin !== null && origin !== new URL(request.url).origin) throw new SearchError("FORBIDDEN_ORIGIN");
      if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
        throw new SearchError("UNSUPPORTED_MEDIA_TYPE");
      }
      const query = await readQuery(request);
      const provider = getProvider();
      const timestamp = now();
      accepted = accepted.filter((time) => time > timestamp - 60000);
      if (active >= 2 || accepted.length >= 20) throw new SearchError("SEARCH_BUSY");
      active++;
      accepted.push(timestamp);
      const controller = new AbortController();
      const abort = () => controller.abort(new SearchError("SEARCH_TIMEOUT"));
      const timer = setTimeout(abort, timeoutMs);
      request.signal.addEventListener("abort", abort, { once: true });
      let rejectOnAbort: () => void = () => {};
      try {
        if (request.signal.aborted) abort();
        if (controller.signal.aborted) throw controller.signal.reason;
        const aborted = new Promise<never>((_resolve, reject) => {
          rejectOnAbort = () => reject(controller.signal.reason);
          controller.signal.addEventListener("abort", rejectOnAbort, { once: true });
        });
        const recipes = await Promise.race([provider.search(query, { signal: controller.signal }), aborted]);
        return json({ recipes });
      } finally {
        clearTimeout(timer);
        request.signal.removeEventListener("abort", abort);
        controller.signal.removeEventListener("abort", rejectOnAbort);
        active--;
      }
    } catch (error) {
      return errorResponse(request.signal.aborted ? "SEARCH_TIMEOUT" : error instanceof SearchError ? error.code : "SEARCH_FAILED");
    }
  };
}
