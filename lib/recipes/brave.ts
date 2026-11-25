import { SearchError } from './errors';
import { abortable } from './concurrency';
import { isRecord, safeRecipeUrl } from './validation';

export type SearchHit = { url: string; title: string };
export function discoveryQuery(query: string): string {
  let truncated = '';
  for (const character of query) { if (truncated.length + character.length > 560) break; truncated += character; }
  const prefix = truncated.split(/\s+/).slice(0, 70).join(' ').trim();
  return /\brecipes?\b/i.test(prefix) ? prefix : `${prefix} recipe`;
}
export async function readProviderJson(response: Response, signal: AbortSignal): Promise<unknown> {
  if (!response.ok || !response.body) {
    if (response.body) await response.body.cancel().catch(() => {});
    throw new SearchError('SEARCH_FAILED');
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  const cancel = () => { void reader.cancel(signal.reason).catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    if (signal.aborted) throw signal.reason;
    while (true) {
      const { done, value } = await abortable(reader.read(), signal);
      if (signal.aborted) throw signal.reason;
      if (done) break;
      size += value.byteLength;
      if (size > 1048576) { void reader.cancel().catch(() => {}); throw new SearchError('SEARCH_FAILED'); }
      chunks.push(value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new SearchError('SEARCH_FAILED'); }
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}
export async function discoverRecipes(query: string, { apiKey, signal, transport = fetch }: {
  apiKey: string; signal: AbortSignal; transport?: typeof fetch;
}): Promise<SearchHit[]> {
  if (signal.aborted) throw signal.reason;
  const endpoint = new URL('https://api.search.brave.com/res/v1/web/search');
  endpoint.search = new URLSearchParams({ q: discoveryQuery(query), count: '20', country: 'CA', search_lang: 'en', text_decorations: 'false' }).toString();
  try {
    const response = await transport(endpoint, { signal, redirect: 'error', headers: { Accept: 'application/json', 'X-Subscription-Token': apiKey } });
    const value = await readProviderJson(response, signal);
    if (!isRecord(value) || !isRecord(value.web) || !Array.isArray(value.web.results)) throw new SearchError('SEARCH_FAILED');
    const hits: SearchHit[] = []; const seen = new Set<string>();
    for (const raw of value.web.results.slice(0, 20)) {
      if (!isRecord(raw)) continue;
      const url = safeRecipeUrl(raw.url);
      if (!url || seen.has(url)) continue;
      seen.add(url); hits.push({ url, title: typeof raw.title === 'string' ? raw.title.slice(0, 160) : '' });
    }
    return hits;
  } catch (error) {
    if (signal.aborted) throw signal.reason;
    throw error instanceof SearchError ? error : new SearchError('SEARCH_FAILED');
  }
}
