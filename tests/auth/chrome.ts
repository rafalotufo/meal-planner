// Isolated local-browser test helper. Never imported by application code.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Recipe } from '../../lib/recipes/types';
interface Message { id?: number; error?: unknown; result?: unknown; method?: string; params?: { type?: string; args?: { value?: unknown; description?: string }[]; exceptionDetails?: { text: string }; entry?: { level: string; text: string }; errorText?: string; requestId?: string; networkId?: string; request?: { url: string } } }
interface Evaluation { exceptionDetails?: { text: string }; result: { value?: unknown } }
export async function openChrome() {
  const profile = await mkdtemp(join(tmpdir(), 'meal-family-chrome-'));
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', 'about:blank'], { stdio: 'ignore' });
  let port: string | undefined;
  for (let i = 0; i < 100; i++) { try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await new Promise((resolve) => setTimeout(resolve, 100)); } }
  assert.ok(port, 'isolated Chrome started');
  const target: { webSocketDebuggerUrl: string } = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise<void>((resolve, reject) => { socket.addEventListener('open', () => resolve(), { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let id = 0; const errors: string[] = []; const requests: string[] = [];
  const pending = new Map<number, { resolve(value: unknown): void; reject(error: Error): void }>();
  let oauth: { origin: string; code: string } | undefined;
  let recipeOrigin: string | undefined;
  let recipeResults: Recipe[] | undefined;
  const failures = new Map<string, { status: number; delay: number }>();
  const delayedFailures = new Map<string, { timer: ReturnType<typeof setTimeout>; url: string }>();
  const abortedFixtures: string[] = [];
  function send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve: (value) => resolve(value as T), reject }); socket.send(JSON.stringify({ id: key, method, params })); });
  }
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(String(data)) as Message; const p = message.params;
    if (message.id) { const item = pending.get(message.id); pending.delete(message.id); if (item) { if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result); } }
    if (message.method === 'Runtime.consoleAPICalled' && p?.type && ['error', 'warning', 'warn'].includes(p.type)) errors.push(`console.${p.type}: ${(p.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ')}`);
    if (message.method === 'Runtime.exceptionThrown' && p?.exceptionDetails) errors.push(p.exceptionDetails.text);
    if (message.method === 'Log.entryAdded' && p?.entry && ['error', 'warning'].includes(p.entry.level)) errors.push(p.entry.text);
    if (message.method === 'Network.loadingFailed' && p?.errorText && p.errorText !== 'net::ERR_ABORTED') errors.push(p.errorText);
    if (message.method === 'Network.loadingFailed' && p?.requestId) {
      const delayed = delayedFailures.get(p.requestId);
      if (delayed) { clearTimeout(delayed.timer); delayedFailures.delete(p.requestId); abortedFixtures.push(delayed.url); }
    }
    if (message.method === 'Network.requestWillBeSent' && p?.request) requests.push(p.request.url);
    if (message.method === 'Fetch.requestPaused' && p?.request) {
      const target = new URL(p.request.url);
      const failureKey = target.pathname + target.search;
      const failure = target.origin === recipeOrigin ? failures.get(failureKey) : undefined;
      if (failure) {
        failures.delete(failureKey);
        const key = p.networkId ?? p.requestId!;
        const timer = setTimeout(() => { delayedFailures.delete(key); send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: failure.status, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ error: 'Fixture request failure' })).toString('base64') }).catch((error: unknown) => errors.push(String(error))); }, failure.delay);
        delayedFailures.set(key, { timer, url: p.request.url });
      } else if (recipeOrigin && target.origin === recipeOrigin && target.pathname === '/api/recipes/search') {
        const body = Buffer.from(JSON.stringify({ recipes: recipeResults ?? [{ title: 'Potato Gnocchi', sourceUrl: 'https://www.loveandlemons.com/gnocchi-recipe/', imageUrl: 'https://images.recipe-fixture.test/photo.svg', summary: 'Boil potatoes, mix with flour, shape the dough, and simmer until the gnocchi float.', time: { kind: 'cook', text: '30 minutes' } }] })).toString('base64');
        send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body }).catch((error: unknown) => errors.push(String(error)));
      } else if (recipeOrigin && target.origin === 'https://images.recipe-fixture.test') {
        const body = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="#e7dfcc"/><circle cx="250" cy="250" r="180" fill="#faf7ee"/><path d="M140 220h220v60H140z" fill="#b69f74"/></svg>').toString('base64');
        send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: target.pathname === '/missing.svg' ? 404 : 200, responseHeaders: [{ name: 'Content-Type', value: 'image/svg+xml' }], body: target.pathname === '/missing.svg' ? '' : body }).catch((error: unknown) => errors.push(String(error)));
      } else if (oauth && target.origin === 'https://accounts.google.com') {
        const location = `${oauth.origin}/api/auth/callback/google?code=${oauth.code}&state=${encodeURIComponent(target.searchParams.get('state') ?? '')}`;
        send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 302, responseHeaders: [{ name: 'Location', value: location }] }).catch((error: unknown) => errors.push(String(error)));
      } else send('Fetch.continueRequest', { requestId: p.requestId }).catch((error: unknown) => errors.push(String(error)));
    }
  });
  for (const method of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable']) await send(method);
  async function evaluate<T = unknown>(expression: string): Promise<T> {
    const result = await send<Evaluation>('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value as T;
  }
  async function waitFor(expression: string, description = expression) {
    for (let i = 0; i < 200; i++) { try { if (await evaluate(expression)) return; } catch { /* Navigation can replace the execution context. */ } await new Promise((resolve) => setTimeout(resolve, 100)); }
    throw new Error(`Browser condition timed out: ${description}`);
  }
  async function navigate(url: string) { await send('Page.navigate', { url }); await waitFor("document.readyState === 'complete'", 'page ready'); }
  async function viewport(width: number) { await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false }); await evaluate('document.fonts.ready'); await new Promise((resolve) => setTimeout(resolve, 150)); assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'no horizontal overflow'); }
  async function click(selector: string) {
    await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`, `control ${selector}`);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    const point = await evaluate<{ x: number; y: number }>(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 }; })()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  }
  async function screenshot(path: string) { const result = await send<{ data: string }>('Page.captureScreenshot', { format: 'png' }); await writeFile(path, Buffer.from(result.data, 'base64')); }
  async function patterns() {
    const patterns = [{ urlPattern: 'https://accounts.google.com/o/oauth2/*', requestStage: 'Request' }];
    if (recipeOrigin) patterns.push({ urlPattern: `${recipeOrigin}/api/recipes/search`, requestStage: 'Request' }, { urlPattern: `${recipeOrigin}/api/menu*`, requestStage: 'Request' }, { urlPattern: 'https://images.recipe-fixture.test/*', requestStage: 'Request' });
    await send('Fetch.enable', { patterns });
  }
  async function google(origin: string, code: string) { oauth = { origin, code }; await patterns(); }
  async function recipes(origin: string, results?: Recipe[]) { recipeOrigin = origin; recipeResults = results; await patterns(); }
  function failNext(path: string, status: number, delay = 0) { failures.set(path, { status, delay }); }
  async function close() {
    for (const delayed of delayedFailures.values()) clearTimeout(delayed.timer);
    delayedFailures.clear();
    socket.close();
    if (chrome.exitCode === null && chrome.signalCode === null) { const exited = new Promise<void>((resolve) => chrome.once('exit', () => resolve())); chrome.kill('SIGTERM'); await exited; }
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  return { send, evaluate, waitFor, navigate, viewport, click, screenshot, google, recipes, failNext, abortedFixtures, errors, requests, close };
}
