// Optional real-Chrome QA. Requires an installed Chrome; no browser dependency in the app.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CookieJar, startServer } from './server.ts';
import { provision, signInWithGoogle } from './flow.ts';
import type { Recipe } from '../../lib/recipes/types.ts';

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
const gnocchi: Recipe = {
  title: 'Potato Gnocchi', sourceUrl: 'https://www.loveandlemons.com/gnocchi-recipe/',
  imageUrl: 'https://cdn.loveandlemons.com/wp-content/uploads/2025/02/gnocchi-500x500.jpg',
  summary: 'Boil potatoes, mix with flour, shape the dough, and simmer until the gnocchi float.',
  time: { kind: 'cook', text: '30 minutes' },
};
const dinnerRecipes: Recipe[] = [
  { ...gnocchi, title: 'Lemony chickpea bowls', sourceUrl: 'https://recipes.example/chickpeas', imageUrl: null,
    summary: 'Warm chickpeas, crisp greens and a bright lemon dressing.', time: { kind: 'total', text: '20 minutes' } },
  { ...gnocchi, title: 'Creamy spinach pasta', sourceUrl: 'https://recipes.example/pasta', imageUrl: null,
    summary: 'A silky spinach sauce tossed with pasta, garlic and lemon.', time: { kind: 'total', text: '25 minutes' } },
  gnocchi,
  { ...gnocchi, title: 'Roasted tomato orzo', sourceUrl: 'https://recipes.example/orzo', imageUrl: null,
    summary: 'Sweet roasted tomatoes and tender orzo, finished with basil.', time: { kind: 'total', text: '35 minutes' } },
  { ...gnocchi, title: 'Carrot and lentil soup', sourceUrl: 'https://recipes.example/soup', imageUrl: null,
    summary: 'A cozy pot of red lentils, carrots and warming spices.', time: { kind: 'cook', text: '10 minutes' } },
  { ...gnocchi, title: 'Garlic butter white beans', sourceUrl: 'https://recipes.example/beans', imageUrl: null,
    summary: 'White beans warmed with garlic, herbs and a little butter.', time: null },
];
let fixtureRecipes: Recipe[] = [gnocchi];
let fixtureStatus = 200;
let holdSearch = false;
let heldRequest: string | undefined;
let searchRequests = 0;
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
    if (message.method === 'Fetch.requestPaused' && params?.request && params.requestId && server) {
      const target = new URL(params.request.url);
      if (target.pathname === '/api/recipes/search' && target.origin === server.origin) {
        searchRequests++;
        if (holdSearch) heldRequest = params.requestId;
        else fulfillSearch(params.requestId).catch((error: unknown) => errors.push(String(error)));
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
  async function fulfillSearch(requestId: string) {
    const data = fixtureStatus === 200 ? { recipes: fixtureRecipes } : { error: { code: 'SEARCH_BUSY' } };
    await send('Fetch.fulfillRequest', { requestId, responseCode: fixtureStatus,
      responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
      body: Buffer.from(JSON.stringify(data)).toString('base64') });
  }
  for (const method of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable']) await send(method);
  await send('Page.bringToFront');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
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
  async function waitFor(expression: string) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error(`Browser condition did not settle: ${expression}`);
  }
  async function submitQuery(query: string) {
    await evaluate(`(() => {
      const input = document.querySelector('#recipe-query');
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, ${JSON.stringify(query)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await evaluate('document.querySelector("form").requestSubmit()');
  }
  async function capture(filename: string) {
    const metrics = await send<{ contentSize: { width: number; height: number } }>('Page.getLayoutMetrics');
    const screenshot = await send<{ data: string }>('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: metrics.contentSize.width, height: metrics.contentSize.height, scale: 1 } });
    await writeFile(filename, Buffer.from(screenshot.data, 'base64'));
  }
  const app = await startServer({}, true);
  server = app;
  const jar = new CookieJar();
  const { callback } = await signInWithGoogle(app.origin, jar);
  assert.equal(callback.status, 302);
  assert.equal((await provision(app.origin, jar)).status, 200);
  await send('Fetch.enable', { patterns: [{ urlPattern: `${app.origin}/api/recipes/search`, requestStage: 'Request' }] });
  const results = [];
  for (const width of [320, 390, 768, 1024, 1440]) {
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
    if (width === 320 || width === 1440) await writeFile(`org/reviews/postgresql-recovery-sign-in-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    await send('Network.setCookies', { cookies: [...jar.values].map(([name, value]) => ({ name, value, url: app.origin, httpOnly: true, sameSite: 'Lax' })) });
    await navigate(`${app.origin}/`);
    assert.equal(await evaluate('document.querySelector("h1").textContent'), 'Meal Planner');
    assert.equal(await evaluate('document.querySelector("label[for=recipe-query]").textContent'), 'What would you like to cook?');
    fixtureRecipes = [gnocchi];
    await submitQuery('potato gnocchi');
    for (let attempt = 0; attempt < 200; attempt++) {
      if (await evaluate('Boolean(document.querySelector("article img")?.naturalWidth)')) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(await evaluate('document.querySelector("article h4")?.textContent'), 'Potato Gnocchi');
    assert.equal(await evaluate('document.querySelector("article img")?.naturalWidth'), 500, 'HTTPS publisher photo loads under authentication CSP');
    assert.equal(await evaluate('document.querySelector("article img")?.naturalHeight'), 500);
    assert.equal(await evaluate('document.querySelector("article a")?.href'), 'https://www.loveandlemons.com/gnocchi-recipe/');
    assert.ok(await evaluate('document.querySelector("article").innerText.includes("Cook time: 30 minutes")'));
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    screenshot = await send<{ data: string }>('Page.captureScreenshot', { format: 'png' });
    if (width === 320 || width === 1440) await writeFile(`org/reviews/postgresql-recovery-results-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    const initialRequests = searchRequests;
    fixtureRecipes = dinnerRecipes;
    await submitQuery('Easy vegetarian dinners');
    await waitFor('document.querySelectorAll("#notebook-title + p").length === 1 && document.querySelectorAll("article").length === 6');
    assert.equal(await evaluate('document.querySelectorAll("button[aria-expanded]").length'), 2);
    const gridColumns = await evaluate('getComputedStyle(document.querySelector("article").parentElement).gridTemplateColumns.split(" ").length');
    assert.equal(gridColumns, width < 640 ? 1 : width < 1024 ? 2 : 3);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    assert.ok(await evaluate('[...document.querySelectorAll("button,select,article a")].filter(x => x.getBoundingClientRect().width).every(x => x.getBoundingClientRect().height >= 44)'));
    await capture(`org/reviews/postgresql-recovery-notebook-${width}.png`);
    await evaluate('[...document.querySelectorAll("button[aria-pressed]")].find(x => x.textContent.includes("Chickpeas")).click()');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 1);
    assert.equal(await evaluate('document.querySelector("article h4").textContent'), 'Lemony chickpea bowls');
    // Keyboard activates the time pill, and the visible pressed state follows it.
    await evaluate('[...document.querySelectorAll("button[aria-pressed]")].find(x => x.textContent.includes("25 min")).focus()');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await waitFor('document.querySelectorAll("article").length === 2');
    assert.ok(await evaluate('document.activeElement.getAttribute("aria-pressed") === "true"'));
    await evaluate('[...document.querySelectorAll("button[aria-pressed]")].find(x => x.textContent.includes("All recipes")).click()');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 6);
    await evaluate('(() => { const select = document.querySelector("select"); select.value = "quickest"; select.dispatchEvent(new Event("change", { bubbles: true })); })()');
    assert.equal(await evaluate('document.querySelector("article h4").textContent'), 'Lemony chickpea bowls');
    await evaluate('document.querySelectorAll("button[aria-expanded]")[1].click()');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 1);
    await evaluate('document.querySelectorAll("button[aria-expanded]")[0].click()');
    assert.equal(await evaluate('document.querySelector("select").value'), 'quickest');
    await evaluate('[...document.querySelectorAll("button[aria-pressed]")].find(x => x.textContent.includes("Pasta")).click()');
    await evaluate('document.querySelectorAll("button[aria-expanded]")[1].click()');
    await evaluate('document.querySelectorAll("button[aria-expanded]")[0].click()');
    assert.equal(await evaluate('document.querySelector("article h4").textContent'), 'Creamy spinach pasta');
    assert.equal(searchRequests, initialRequests + 1, 'all notebook/filter/sort interactions stay local');
    holdSearch = true;
    await submitQuery('A new search that is still loading');
    await waitFor('document.querySelector("button[type=submit]").disabled');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 1, 'earlier recipes survive loading');
    assert.equal(await evaluate('document.querySelectorAll("button[aria-expanded]").length'), 2);
    await waitFor('document.querySelector("p[role=status]").textContent.includes("Searching")');
    await capture(`org/reviews/postgresql-recovery-notebook-loading-${width}.png`);
    fixtureStatus = 429;
    assert.ok(heldRequest);
    await fulfillSearch(heldRequest);
    heldRequest = undefined;
    holdSearch = false;
    await waitFor('!document.querySelector("button[type=submit]").disabled');
    assert.ok(await evaluate('document.querySelector("[role=alert]").textContent.includes("busy")'));
    assert.equal(await evaluate('document.querySelectorAll("button[aria-expanded]").length'), 2, 'errors do not create history');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 1, 'earlier recipes survive error');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    await capture(`org/reviews/postgresql-recovery-notebook-error-${width}.png`);
    fixtureStatus = 200;
    fixtureRecipes = [];
    await submitQuery('No matching dinners');
    await waitFor('document.querySelectorAll("button[aria-expanded]").length === 3');
    assert.ok(await evaluate('document.querySelector("[id^=search-results-]:not([hidden])").textContent.includes("No matching recipes found")'));
    assert.equal(await evaluate('document.querySelector("[role=alert]")'), null);
    fixtureRecipes = [{ ...dinnerRecipes[0], title: 'chickpea ' + 'longtitle'.repeat(25), summary: 'longsummary'.repeat(40) }];
    await submitQuery('longquery'.repeat(100));
    await waitFor('document.querySelectorAll("button[aria-expanded]").length === 4');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'long title, summary and query wrap');
    const beforeValidation = searchRequests;
    await submitQuery(' ');
    await waitFor('Boolean(document.querySelector("#recipe-query-error"))');
    assert.equal(searchRequests, beforeValidation, 'invalid query does not call search');
    assert.equal(await evaluate('document.activeElement.id'), 'recipe-query');
    await send('Page.reload');
    await waitFor('Boolean(document.querySelector("#recipe-query")) && !document.querySelector("#notebook-title")');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 0, 'reload clears transient history');
    assert.ok(await evaluate(`Boolean(document.querySelector('[aria-label="Getting started"]'))`));
    results.push({ width, signIn: 'passed', authenticatedRecipeForm: 'passed', httpsRecipePhoto: 'passed', keyboardButton: 'passed', history: 'passed', localFiltersAndSort: 'passed', loadingAndErrorRetention: 'passed', emptyAndLongContent: 'passed', reloadClearsHistory: 'passed', overflow: false });
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
  const expectedHttpError = `${app.origin}/api/recipes/search: Failed to load resource: the server responded with a status of 429 (Too Many Requests)`;
  assert.equal(errors.filter(error => error === expectedHttpError).length, 5, 'one intentional fixture 429 is reported at each width');
  const unexpectedErrors = errors.filter(error => error !== expectedHttpError);
  assert.deepEqual(unexpectedErrors, []);
  console.log(JSON.stringify({ recipeResults: 'browser response fixture; real HTTPS publisher image; no LLM calls', browser: 'isolated headless Google Chrome', results, logout: 'passed', googleButtonThroughMockedProvider: 'passed', intentionalFixtureHttp429s: 5, consoleAndNetworkErrors: unexpectedErrors }, null, 2));
} finally {
  socket?.close();
  await server?.stop();
  if (chrome.exitCode === null && chrome.signalCode === null) chrome.kill('SIGTERM');
}
