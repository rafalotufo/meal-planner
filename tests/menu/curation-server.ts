import assert from 'node:assert/strict';
import { createServer, type ServerResponse } from 'node:http';
import { startServer } from '../auth/server.ts';
import { restrictedMenuDatabase } from './database.ts';

export type CurationScenario = 'success' | 'missing' | 'nonrecipe' | 'failure' | 'stall';
export async function startCurationServer(options: { development?: boolean; workingDirectory?: string } = {}) {
  const scenarios = new Map<string, CurationScenario>(), counts = new Map<string, number>();
  const pending = new Map<string, Set<ServerResponse>>(), watchers = new Set<() => void>();
  const source = (path: string) => { assert.ok(path.startsWith('/')); return 'https://recipes.example.test' + path; };
  function html(path: string, missing = false) {
    const recipe = { '@context': 'https://schema.org', '@type': 'Recipe', url: source(path), name: 'Imported fixture recipe', ...(!missing ? { description: 'A fixture recipe summary.', totalTime: 'PT20M', image: { '@type': 'ImageObject', url: 'https://images.recipe-fixture.test/photo.svg', width: 800, height: 600 } } : {}) };
    return '<!doctype html><html><head><script type="application/ld+json">' + JSON.stringify(recipe).replaceAll('<', '\\u003c') + '</script></head><body>Fixture publisher recipe</body></html>';
  }
  function finish(path: string, response: ServerResponse, missing = false) {
    if (!response.destroyed) { response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); response.end(html(path, missing)); }
  }
  const publisher = createServer((request, response) => {
    const path = request.url ?? '/'; counts.set(path, (counts.get(path) ?? 0) + 1);
    for (const notify of watchers) notify();
    const scenario = scenarios.get(path) ?? 'success';
    if (scenario === 'stall') {
      const responses = pending.get(path) ?? new Set<ServerResponse>(); responses.add(response); pending.set(path, responses);
      response.once('close', () => responses.delete(response)); return;
    }
    if (scenario === 'failure') { response.writeHead(503, { 'Content-Type': 'text/html' }); response.end('Publisher unavailable'); return; }
    if (scenario === 'nonrecipe') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end('<title>Ordinary page</title>'); return; }
    finish(path, response, scenario === 'missing');
  });
  await new Promise<void>((resolve, reject) => { publisher.once('error', reject); publisher.listen(0, '127.0.0.1', resolve); });
  const address = publisher.address(); assert.ok(address && typeof address !== 'string');
  const publisherOrigin = `http://127.0.0.1:${address.port}`;
  const database = await restrictedMenuDatabase().catch(async error => { publisher.closeAllConnections(); await new Promise<void>(resolve => publisher.close(() => resolve())); throw error; });
  let server: Awaited<ReturnType<typeof startServer>> | undefined;
  let db: Awaited<ReturnType<typeof database.open>> | undefined;
  const release = (path: string) => {
    scenarios.set(path, 'success');
    for (const response of pending.get(path) ?? []) finish(path, response);
    pending.delete(path);
  };
  async function stop() {
    for (const path of pending.keys()) release(path);
    await server?.stop(); await db?.close();
    publisher.closeAllConnections(); await new Promise<void>(resolve => publisher.close(() => resolve()));
    await database.cleanup();
  }
  try {
    server = await startServer({ DATABASE_URL: database.runtimeUrl, CURATION_FIXTURE_ORIGIN: publisherOrigin }, true, options.development ?? false, options.workingDirectory, [new URL('./curation-network.ts', import.meta.url).pathname]);
    db = await database.open();
    return {
      server, database, db, source, stop,
      set: (path: string, scenario: CurationScenario) => { scenarios.set(path, scenario); },
      requests: (path: string) => counts.get(path) ?? 0,
      release,
      waitForRequest: async (path: string, count = 1) => {
        if ((counts.get(path) ?? 0) >= count) return;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => { watchers.delete(notify); reject(new Error('Publisher request did not arrive')); }, 5000);
          const notify = () => { if ((counts.get(path) ?? 0) >= count) { clearTimeout(timeout); watchers.delete(notify); resolve(); } };
          watchers.add(notify); notify();
        });
      },
    };
  } catch (error) { await stop(); throw error; }
}
