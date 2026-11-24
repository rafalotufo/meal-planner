import { FamilyError } from '../identity-access';
import { isRecord } from '../recipes/validation';

/** Pure request parsing; the caller supplies its configured server Origin. */
export async function readMenuBody(request: Request, origin: string, mode: 'save' | 'remove'): Promise<Record<string, unknown>> {
  if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new FamilyError(403, 'Forbidden');
  const limit = mode === 'save' ? 16384 : 4096;
  const invalid = () => new FamilyError(400, 'Invalid request');
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json' || Number(request.headers.get('content-length')) > limit) throw invalid();
  const reader = request.body?.getReader();
  if (!reader) throw invalid();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(invalid()), 5000); });
  let bytes = 0, text = '', completed = false;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  try {
    for (;;) {
      const part = await Promise.race([reader.read(), deadline]);
      if (part.done) { completed = true; break; }
      bytes += part.value.byteLength;
      if (bytes > limit) throw invalid();
      text += decoder.decode(part.value, { stream: true });
    }
    const value: unknown = JSON.parse(text + decoder.decode());
    const keys = mode === 'save' ? ['title', 'sourceUrl', 'imageUrl', 'summary', 'time'] : [];
    if (!isRecord(value) || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))) throw invalid();
    return value;
  } catch { throw invalid(); }
  finally {
    clearTimeout(timer);
    // A failed client stream must not hold the response open through cancel().
    if (!completed) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
