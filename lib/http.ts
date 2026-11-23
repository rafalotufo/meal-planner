import { NextResponse } from 'next/server';
import { authConfiguration } from './auth';
import { noStore } from './auth-policy';
import { FamilyError } from './identity-access';
export async function readJson(request: Request, keys: string[]) {
  if (request.headers.get('origin') !== authConfiguration().origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new FamilyError(403, 'Forbidden');
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json' || Number(request.headers.get('content-length')) > 4096) throw new FamilyError(400, 'Invalid request');
  const reader = request.body?.getReader(); let text = ''; let bytes = 0;
  if (!reader) throw new FamilyError(400, 'Invalid request');
  const decoder = new TextDecoder();
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 4096) { await reader.cancel(); throw new FamilyError(400, 'Invalid request'); } text += decoder.decode(value, { stream: true }); }
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(text + decoder.decode()); } catch { throw new FamilyError(400, 'Invalid request'); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => !keys.includes(key))) throw new FamilyError(400, 'Invalid request');
  return body as Record<string, unknown>;
}
export async function apiResponse(action: () => Promise<Response | object>) {
  try {
    const value = await action();
    return value instanceof Response ? value : NextResponse.json(value, { headers: noStore });
  } catch (error) {
    return NextResponse.json({ error: error instanceof FamilyError ? error.message : 'Service unavailable' }, { status: error instanceof FamilyError ? error.status : 503, headers: noStore });
  }
}
