// Optional real-Chrome QA. Requires an installed Chrome; no browser dependency in the app.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CookieJar, startServer } from './server.ts';
import { signInWithGoogle } from './flow.ts';

interface CdpEvent {
  id?: number;
  error?: unknown;
  result?: unknown;
  method?: string;
  params?: {
    exceptionDetails?: { text: string };
    entry?: { level: string; text: string; url?: string };
    type?: string;
    args?: { value?: unknown; description?: string }[];
    errorText?: string;
    request?: { url: string };
    requestId?: string;
  };
}
interface EvaluationResult {
  exceptionDetails?: { text: string };
  result: { value?: unknown };
}

const profile = await mkdtemp(join(tmpdir(), 'meal-planner-auth-chrome-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', 'about:blank'], { stdio: 'ignore' });
let server: Awaited<ReturnType<typeof startServer>> | undefined;
let socket: WebSocket | undefined;
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  assert.ok(port, 'isolated Chrome started');
  const target: { webSocketDebuggerUrl: string } = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  const connection = socket;
  await new Promise<void>((resolve, reject) => { connection.addEventListener('open', () => resolve(), { once: true }); connection.addEventListener('error', reject, { once: true }); });
  let id = 0;
  const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  const errors: string[] = [];
  connection.addEventListener('message', ({ data }) => {
    const message = JSON.parse(String(data)) as CdpEvent;
    const params = message.params;
    if (message.id) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      if (!item) return;
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
    }
    if (message.method === 'Runtime.consoleAPICalled' && params?.type && ['error', 'warning', 'warn'].includes(params.type)) errors.push(`console.${params.type}: ${(params.args ?? []).map((arg) => arg.value ?? arg.description ?? '').join(' ')}`);
    if (message.method === 'Runtime.exceptionThrown' && params?.exceptionDetails) errors.push(params.exceptionDetails.text);
    if (message.method === 'Log.entryAdded' && params?.entry && ['error', 'warning'].includes(params.entry.level)) errors.push(`${params.entry.url ?? ''}: ${params.entry.text}`);
    if (message.method === 'Network.loadingFailed' && params?.errorText && params.errorText !== 'net::ERR_ABORTED') errors.push(params.errorText);
    if (message.method === 'Fetch.requestPaused' && params?.request && server) {
      const target = new URL(params.request.url);
      if (target.pathname === '/api/recipes/search' && target.origin === server.origin) {
        const body = Buffer.from(JSON.stringify({ recipes: [{
          title: 'Potato Gnocchi',
          sourceUrl: 'https://www.loveandlemons.com/gnocchi-recipe/',
          imageUrl: 'https://cdn.loveandlemons.com/wp-content/uploads/2025/02/gnocchi-500x500.jpg',
          summary: 'Boil potatoes, mix with flour, shape the dough, and simmer until the gnocchi float.',
          time: { kind: 'cook', text: '30 minutes' },
        }] })).toString('base64');
        send('Fetch.fulfillRequest', { requestId: params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body }).catch((error: unknown) => errors.push(String(error)));
      } else {
        const location = `${server.origin}/api/auth/callback/google?code=test-code&state=${encodeURIComponent(target.searchParams.get('state') ?? '')}`;
        send('Fetch.fulfillRequest', { requestId: params.requestId, responseCode: 302, responseHeaders: [{ name: 'Location', value: location }] }).catch((error: unknown) => errors.push(String(error)));
      }
    }
  });
  function send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const key = ++id;
      pending.set(key, { resolve: (value: unknown) => resolve(value as T), reject });
      connection.send(JSON.stringify({ id: key, method, params }));
    });
  }
  for (const method of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable']) await send(method);
  async function evaluate(expression: string): Promise<unknown> {
    const result = await send<EvaluationResult>('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  async function navigate(url: string) {
    await send('Page.navigate', { url });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate('document.readyState') === 'complete' && await evaluate('location.href') === url) {
        await evaluate('document.fonts.ready');
        await new Promise((resolve) => setTimeout(resolve, 150));
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Navigation did not settle: ${url}`);
  }
  const app = await startServer({}, true);
  server = app;
  const jar = new CookieJar();
  const { callback } = await signInWithGoogle(app.origin, jar);
  assert.equal(callback.status, 302);
  await send('Fetch.enable', { patterns: [{ urlPattern: `${app.origin}/api/recipes/search`, requestStage: 'Request' }] });
  const results = [];
  for (const width of [320, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Network.clearBrowserCookies');
    await navigate(`${app.origin}/sign-in`);
    assert.equal(await evaluate('document.title'), 'Meal Planner');
    assert.equal(await evaluate('document.documentElement.lang'), 'en');
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
    assert.equal(await evaluate('document.querySelector("button").textContent.trim()'), 'Continue with Google');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.equal(await evaluate('document.activeElement.tagName'), 'BUTTON');
    let screenshot = await send<{ data: string }>('Page.captureScreenshot', { format: 'png' });
    await writeFile(`org/reviews/recipe-integration-sign-in-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    await send('Network.setCookies', { cookies: [...jar.values].map(([name, value]) => ({ name, value, url: app.origin, httpOnly: true, sameSite: 'Lax' })) });
    await navigate(`${app.origin}/`);
    assert.equal(await evaluate('document.querySelector("h1").textContent'), 'Meal Planner');
    assert.equal(await evaluate('document.querySelector("label[for=recipe-query]").textContent'), 'What would you like to cook?');
    await evaluate(`(() => {
      const input = document.querySelector('#recipe-query');
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'potato gnocchi');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await evaluate('document.querySelector("form").requestSubmit()');
    for (let attempt = 0; attempt < 200; attempt++) {
      if (await evaluate('Boolean(document.querySelector("article img")?.naturalWidth)')) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(await evaluate('document.querySelector("article h3")?.textContent'), 'Potato Gnocchi');
    assert.equal(await evaluate('document.querySelector("article img")?.naturalWidth'), 500, 'HTTPS publisher photo loads under authentication CSP');
    assert.equal(await evaluate('document.querySelector("article img")?.naturalHeight'), 500);
    assert.equal(await evaluate('document.querySelector("article a")?.href'), 'https://www.loveandlemons.com/gnocchi-recipe/');
    assert.ok(await evaluate('document.querySelector("article").innerText.includes("Cook time: 30 minutes")'));
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    screenshot = await send<{ data: string }>('Page.captureScreenshot', { format: 'png' });
    await writeFile(`org/reviews/recipe-integration-results-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    results.push({ width, signIn: 'passed', authenticatedRecipeForm: 'passed', httpsRecipePhoto: 'passed', keyboardButton: 'passed', overflow: false });
  }
  await navigate(`${app.origin}/sign-out`);
  await evaluate('document.querySelector("button").click()');
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate('location.pathname') === '/sign-in') break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(await evaluate('location.pathname'), '/sign-in');
  await send('Page.navigate', { url: `${app.origin}/` });
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(await evaluate('location.pathname'), '/sign-in');
  await send('Fetch.enable', { patterns: [{ urlPattern: 'https://accounts.google.com/o/oauth2/*', requestStage: 'Request' }, { urlPattern: `${app.origin}/api/recipes/search`, requestStage: 'Request' }] });
  await evaluate('document.querySelector("button").click()');
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate('location.pathname') === '/' && await evaluate('Boolean(document.querySelector("#recipe-query"))')) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(await evaluate('location.pathname'), '/');
  assert.equal(await evaluate('document.querySelector("h1").textContent'), 'Meal Planner');
  assert.ok(await evaluate('Boolean(document.querySelector("#recipe-query"))'));
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ recipeResults: 'browser response fixture; real HTTPS publisher image; no LLM calls', browser: 'isolated headless Google Chrome', results, logout: 'passed', googleButtonThroughMockedProvider: 'passed', consoleAndNetworkErrors: errors }, null, 2));
} finally {
  socket?.close();
  await server?.stop();
  if (chrome.exitCode === null && chrome.signalCode === null) chrome.kill('SIGTERM');
}
