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

async function readQuery(request: Request, signal: AbortSignal): Promise<string> {
  if (!request.body) throw new SearchError("INVALID_REQUEST");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";
  let finished = false;
  let canceled = false;
  const cancel = () => {
    if (canceled) return;
    canceled = true;
    // Cancellation closes pending reads immediately; do not await an untrusted cancel hook.
    void reader.cancel(signal.reason).catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    if (signal.aborted) { cancel(); throw new SearchError("SEARCH_TIMEOUT"); }
    while (true) {
      const { done, value } = await reader.read();
      if (signal.aborted) throw new SearchError("SEARCH_TIMEOUT");
      if (done) { finished = true; break; }
      size += value.byteLength;
      if (size > 8192) throw new SearchError("REQUEST_TOO_LARGE");
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
  } finally {
    signal.removeEventListener("abort", cancel);
    if (!finished) cancel();
    reader.releaseLock();
  }
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
    const controller = new AbortController();
    const abort = () => controller.abort(new SearchError("SEARCH_TIMEOUT"));
    const timer = setTimeout(abort, timeoutMs);
    request.signal.addEventListener("abort", abort, { once: true });
    let admitted = false;
    let rejectOnAbort: () => void = () => {};
    try {
      if (request.signal.aborted) { abort(); throw new SearchError("SEARCH_TIMEOUT"); }
      const origin = request.headers.get("Origin");
      if (origin !== null && origin !== new URL(request.url).origin) throw new SearchError("FORBIDDEN_ORIGIN");
      if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
        throw new SearchError("UNSUPPORTED_MEDIA_TYPE");
      }
      accepted = accepted.filter((time) => time > now() - 60000);
      if (active >= 2 || accepted.length >= 20) throw new SearchError("SEARCH_BUSY");
      active++;
      admitted = true;
      const query = await readQuery(request, controller.signal);
      const provider = getProvider();
      accepted = accepted.filter((time) => time > now() - 60000);
      if (accepted.length >= 20) throw new SearchError("SEARCH_BUSY");
      if (controller.signal.aborted) throw controller.signal.reason;
      accepted.push(now());
      const aborted = new Promise<never>((_resolve, reject) => {
        rejectOnAbort = () => reject(controller.signal.reason);
        controller.signal.addEventListener("abort", rejectOnAbort, { once: true });
      });
      const recipes = await Promise.race([provider.search(query, { signal: controller.signal }), aborted]);
      return json({ recipes });
    } catch (error) {
      return errorResponse(controller.signal.aborted ? "SEARCH_TIMEOUT" : error instanceof SearchError ? error.code : "SEARCH_FAILED");
    } finally {
      clearTimeout(timer);
      request.signal.removeEventListener("abort", abort);
      controller.signal.removeEventListener("abort", rejectOnAbort);
      if (admitted) active--;
      if (request.body && !request.body.locked && !request.bodyUsed) {
        void request.body.cancel().catch(() => {});
      }
    }
  };
}
