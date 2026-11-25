import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FamilyError } from '../../lib/identity-access.ts';
import { readMenuBody } from '../../lib/menu/body.ts';

const origin = 'http://127.0.0.1:3000';
const snapshot = { title: 'Chickpeas', sourceUrl: 'https://example.test/recipe', imageUrl: null, summary: 'Cook chickpeas.', time: null };
function request(body: BodyInit | ReadableStream<Uint8Array> = JSON.stringify(snapshot), headers: Record<string, string> = {}) {
  return new Request(origin + '/api/menu', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body, duplex: 'half' } as RequestInit);
}
function invalid(status = 400) { return (error: unknown) => error instanceof FamilyError && error.status === status && error.message === (status === 403 ? 'Forbidden' : 'Invalid request'); }

test('bounded menu reader accepts exact save/empty-remove objects and valid split UTF-8', async () => {
  assert.deepEqual(await readMenuBody(request(), origin, 'save'), snapshot);
  assert.deepEqual(await readMenuBody(request('{}'), origin, 'remove'), {});
  const bytes = new TextEncoder().encode(JSON.stringify({ ...snapshot, title: '🍋' }));
  const body = new ReadableStream<Uint8Array>({ start(controller) { for (const value of bytes) controller.enqueue(Uint8Array.of(value)); controller.close(); } });
  assert.deepEqual(await readMenuBody(request(body), origin, 'save'), { ...snapshot, title: '🍋' });
});

test('saved lookup shares the exact object, byte, Origin and deadline parser', async () => {
  const body = { sourceUrls: [snapshot.sourceUrl] };
  assert.deepEqual(await readMenuBody(request(JSON.stringify(body).padEnd(16384, ' ')), origin, 'lookup'), body);
  for (const value of [{ ...body, familyId: 'forged' }, snapshot, {}]) await assert.rejects(readMenuBody(request(JSON.stringify(value)), origin, 'lookup'), invalid());
  await assert.rejects(readMenuBody(request(JSON.stringify(body), {Origin:'https://attacker.test'}), origin, 'lookup'), invalid(403));
  await assert.rejects(readMenuBody(request(JSON.stringify(body).padEnd(16385, ' ')), origin, 'lookup'), invalid());
});

test('Origin and content type reject before parsing and unknown/missing keys fail closed', async () => {
  const forbidden: Record<string, string>[] = [{ Origin: 'https://attacker.test' }, { Origin: '' }, { 'Sec-Fetch-Site': 'cross-site' }];
  const malformed: Record<string, string>[] = [{ 'Content-Type': 'text/plain' }, { 'Content-Length': '16385' }];
  for (const headers of forbidden) await assert.rejects(readMenuBody(request(undefined, headers), origin, 'save'), invalid(403));
  for (const headers of malformed) await assert.rejects(readMenuBody(request(undefined, headers), origin, 'save'), invalid());
  for (const body of ['null', '[]', '{', JSON.stringify({ ...snapshot, familyId: 'forged' }), JSON.stringify({ title: 'missing fields' })]) await assert.rejects(readMenuBody(request(body), origin, 'save'), invalid());
  await assert.rejects(readMenuBody(request('{"id":"forged"}'), origin, 'remove'), invalid());
  const invalidUtf8 = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(Uint8Array.of(255)); c.close(); } });
  await assert.rejects(readMenuBody(request(invalidUtf8), origin, 'save'), invalid());
});

test('actual byte limits cover chunked and lying-length bodies and release/cancel readers', async () => {
  for (const [mode, limit] of [['save', 16384], ['lookup', 16384], ['remove', 4096]] as const) {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(limit)); c.enqueue(Uint8Array.of(32)); }, cancel() { cancelled = true; } });
    await assert.rejects(readMenuBody(request(body, { 'Content-Length': '1' }), origin, mode), invalid());
    assert.equal(cancelled, true);
    assert.equal(body.locked, false);
  }
  const exact = JSON.stringify(snapshot).padEnd(16384, ' ');
  assert.deepEqual(await readMenuBody(request(exact), origin, 'save'), snapshot);
  assert.deepEqual(await readMenuBody(request('{}' + ' '.repeat(4094)), origin, 'remove'), {});
});

test('five-second total deadline cancels a stalled read without awaiting a hostile cancel promise', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({ pull() { return new Promise<void>(() => {}); }, cancel() { cancelled = true; return new Promise<void>(() => {}); } });
  const pending = readMenuBody(request(body), origin, 'save');
  const result = assert.rejects(pending, invalid());
  t.mock.timers.tick(5000);
  await result;
  assert.equal(cancelled, true);
  assert.equal(body.locked, false);
});

test('a trickle cannot reset the total body deadline', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
  const body = new ReadableStream<Uint8Array>({ start(c) { controller = c; c.enqueue(Uint8Array.of(123)); } });
  const pending = readMenuBody(request(body), origin, 'save');
  const result = assert.rejects(pending, invalid());
  await Promise.resolve();
  t.mock.timers.tick(4000); controller!.enqueue(Uint8Array.of(32));
  await Promise.resolve();
  t.mock.timers.tick(1000);
  await result;
  assert.equal(body.locked, false);
});

test('URL save and retry use exact small request contracts with shared Origin and actual-byte limits', async () => {
  for (const [mode, value] of [['import', { sourceUrl: snapshot.sourceUrl }], ['retry', { id: 'a53f8c90-2345-4789-9234-abcd01234567' }]] as const) {
    assert.deepEqual(await readMenuBody(request(JSON.stringify(value)), origin, mode), value);
    await assert.rejects(readMenuBody(request(JSON.stringify({ ...value, familyId: 'forged' })), origin, mode), invalid());
    await assert.rejects(readMenuBody(request(JSON.stringify(value).padEnd(4097, ' ')), origin, mode), invalid());
    await assert.rejects(readMenuBody(request(JSON.stringify(value), { Origin: '' }), origin, mode), invalid(403));
  }
});
