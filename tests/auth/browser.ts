// Optional real-Chrome QA. Requires an installed Chrome; no browser dependency in the app.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CookieJar, startServer } from './server.ts';
import { signInWithGoogle } from './flow.ts';
import type { Recipe } from '../../lib/recipes/types.ts';
import { WORD_SNACK_PUZZLES } from '../../lib/word-snack-puzzles.ts';

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
    request?: { url: string; postData?: string };
    requestId?: string;
  };
}
interface EvaluationResult {
  exceptionDetails?: { text: string; exception?: { description?: string } };
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
const searchBodies: string[] = [];
let malformedSearch = false;
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
        searchBodies.push(params.request.postData ?? '');
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
      body: Buffer.from(malformedSearch ? '{"unexpected":true}' : JSON.stringify(data)).toString('base64') });
  }
  for (const method of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable']) await send(method);
  await send('Page.bringToFront');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  async function evaluate(expression: string): Promise<unknown> {
    const result = await send<EvaluationResult>('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
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
  async function key(key: string, code: string, windowsVirtualKeyCode: number, text?: string) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode, ...(text ? { text } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode });
  }
  async function activate(selector: string, touch = false) {
    if (!touch) {
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
      await key('Enter', 'Enter', 13, '\r');
      return;
    }
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    const point = await evaluate(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`) as { x: number; y: number };
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, radiusX: 1, radiusY: 1 }] });
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  async function typeWord(value: string) {
    await evaluate(`(() => {const input=document.querySelector('#word-snack-word');input.focus();input.select();})()`);
    await send('Input.insertText', { text: value });
  }
  async function holdQuery(query: string) {
    holdSearch = true;
    await submitQuery(query);
    await waitFor('Boolean(document.querySelector("#word-snack-play"))');
    assert.ok(heldRequest, 'fixture captured pending recipe request');
  }
  async function finishQuery() {
    assert.ok(heldRequest);
    await fulfillSearch(heldRequest);
    heldRequest = undefined;
    holdSearch = false;
    await waitFor('!document.querySelector("button[type=submit]").disabled');
  }
  async function wordSnackFlow(width: number) {
    const touch = width <= 390;
    await send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: 1 });
    fixtureRecipes = dinnerRecipes;
    const requestsBefore = searchRequests;
    await holdQuery('Dinner while playing Word Snack');
    const inputBeforePlay = await evaluate('document.activeElement.id');
    assert.notEqual(inputBeforePlay, 'word-snack-word', 'optional game never steals focus on arrival');
    if (width === 320 || width === 1440) await capture(`org/reviews/word-snack-pending-${width}.png`);
    await activate('#word-snack-play', touch);
    await waitFor('Boolean(document.querySelector("#word-snack-word"))');
    assert.equal(await evaluate('document.activeElement.id'), 'word-snack-title', 'opening transfers removed launcher focus');
    const letters = await evaluate(`[...document.querySelectorAll('[aria-label="Available letters"] button')].map(x=>x.textContent.trim().toLowerCase()).join("")`) as string;
    const puzzle = WORD_SNACK_PUZZLES.find(item => item.letters === letters);
    assert.ok(puzzle);
    const acceptedWord = puzzle.words[1];
    const continuedWord = puzzle.words[0];
    await typeWord(acceptedWord);
    await key('Enter', 'Enter', 13, '\r');
    await waitFor('document.querySelector("#word-snack-feedback").textContent.includes("Added")');
    assert.equal(await evaluate('document.activeElement.id'), 'word-snack-word');
    await typeWord(acceptedWord);
    await key('Enter', 'Enter', 13, '\r');
    await waitFor('document.querySelector("#word-snack-feedback").textContent.includes("already found")');
    await typeWord(continuedWord.slice(0, 2));
    // Close pending via its labeled action, then reopen the same round.
    await evaluate('[...document.querySelectorAll("button")].find(x=>x.textContent==="Close game").click()');
    await waitFor('Boolean(document.querySelector("#word-snack-play"))');
    assert.equal(await evaluate('document.activeElement.id'), 'word-snack-play');
    await activate('#word-snack-play', touch);
    await waitFor('Boolean(document.querySelector("#word-snack-word"))');
    assert.equal(await evaluate('document.querySelector("#word-snack-word").value'), continuedWord.slice(0, 2));
    await evaluate('document.querySelector("#word-snack-word").focus()');
    if (width === 320 || width === 1440) await capture(`org/reviews/word-snack-playing-${width}.png`);
    await finishQuery();
    await waitFor('Boolean(document.querySelector("#word-snack-ready"))');
    assert.equal(await evaluate('document.activeElement.id'), 'word-snack-word', 'success retains exact input focus');
    assert.equal(await evaluate('document.querySelector("#word-snack-word").value'), continuedWord.slice(0, 2));
    assert.equal(await evaluate(`[...document.querySelectorAll('[aria-label="Available letters"] button')].map(x=>x.textContent.trim().toLowerCase()).join("")`), letters);
    assert.equal(await evaluate(`document.querySelector('[aria-label="Found words"]').textContent`), acceptedWord);
    assert.ok(await evaluate('document.querySelector("p[role=status]").textContent.includes("Keep playing")'));
    assert.equal(await evaluate('document.querySelector("#word-snack-ready").getAttribute("role")'), null, 'ready banner does not duplicate live announcement');
    assert.ok(await evaluate('document.querySelectorAll("article").length > 0'), 'results render without dismissing game');
    await typeWord(continuedWord);
    await key('Enter', 'Enter', 13, '\r');
    await waitFor(`document.querySelector('[aria-label="Found words"]').textContent.includes(${JSON.stringify(continuedWord)})`);
    // Keyboard tile entry exhausts supply without leaving focus on a disabled control.
    for (const letter of puzzle.letters) {
      const index = puzzle.letters.indexOf(letter);
      await activate(`[aria-label="Available letters"] button:nth-child(${index + 1})`);
    }
    assert.equal(await evaluate('document.activeElement.id'), 'word-snack-word');
    assert.equal(await evaluate('document.querySelector("#word-snack-word").value'), puzzle.letters);
    await evaluate('[...document.querySelectorAll("button")].find(x=>x.textContent==="Clear word").click()');
    const ax = await send<{ nodes: { role?: { value?: string }; name?: { value?: string } }[] }>('Accessibility.getFullAXTree');
    assert.ok(ax.nodes.some(node => node.role?.value === 'textbox' && node.name?.value === 'Your word'));
    assert.ok(ax.nodes.some(node => node.role?.value === 'button' && node.name?.value === 'Submit word'));
    assert.ok(ax.nodes.some(node => node.role?.value === 'region' && node.name?.value === 'Word Snack'));
    assert.ok(await evaluate(`(() => {
      const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      function rgb(color){ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];}
      function lum(color){return rgb(color).slice(0,3).map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[0.2126,0.7152,0.0722][i],0);}
      return [...document.querySelectorAll('[aria-labelledby=word-snack-title] p,[aria-labelledby=word-snack-title] label,[aria-labelledby=word-snack-title] h2,[aria-labelledby=word-snack-title] button:not(:disabled),[aria-labelledby=word-snack-title] input')].every(el=>{
        let bg=el;while(bg&&rgb(getComputedStyle(bg).backgroundColor)[3]===0)bg=bg.parentElement;
        const foreground=lum(getComputedStyle(el).color),background=lum(bg?getComputedStyle(bg).backgroundColor:'white');
        return (Math.max(foreground,background)+0.05)/(Math.min(foreground,background)+0.05)>=4.5;
      });
    })()`), 'game text and enabled controls meet 4.5:1 contrast');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    assert.ok(await evaluate('[...document.querySelectorAll("[aria-labelledby=word-snack-title] button,[aria-labelledby=word-snack-title] input")].every(x=>x.getBoundingClientRect().width>=44&&x.getBoundingClientRect().height>=44)'));
    assert.equal(await evaluate('getComputedStyle(document.querySelector("#word-snack-word")).fontSize'), '16px');
    if (width === 320 || width === 1440) await capture(`org/reviews/word-snack-ready-${width}.png`);
    const latestHeading = await evaluate('document.querySelector("button[aria-expanded]").id');
    await evaluate('document.querySelectorAll("button[aria-expanded]")[1].click()');
    await activate('[aria-labelledby=word-snack-title] button', touch);
    await waitFor('!document.querySelector("#word-snack-title")');
    assert.equal(await evaluate('document.activeElement.id'), latestHeading);
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-expanded")'), 'true');
    if (width === 320 || width === 1440) await capture(`org/reviews/word-snack-dismissed-${width}.png`);
    assert.equal(searchRequests, requestsBefore + 1, 'game controls never issue recipe requests');
    assert.deepEqual(JSON.parse(searchBodies.at(-1) ?? '{}'), { query: 'Dinner while playing Word Snack' });

    // Zero results preserve play, invalid queries preserve the completed round.
    fixtureRecipes = [];
    await holdQuery('No matches while playing');
    await activate('#word-snack-play', touch);
    await finishQuery();
    await waitFor('Boolean(document.querySelector("#word-snack-ready"))');
    assert.ok(await evaluate('document.querySelector("#word-snack-ready").textContent.includes("no matches")'));
    const beforeInvalid = searchRequests;
    await submitQuery(' ');
    assert.equal(searchRequests, beforeInvalid);
    assert.ok(await evaluate('Boolean(document.querySelector("#word-snack-title"))'));
    await activate('[aria-labelledby=word-snack-title] button');

    // Completion while browsing an older panel leaves that panel and focus intact.
    fixtureRecipes = dinnerRecipes;
    await holdQuery('Keep earlier controls focused');
    await evaluate('document.querySelectorAll("button[aria-expanded]")[1].click()');
    await evaluate('document.querySelector("select").focus()');
    const oldHeading = await evaluate('document.querySelector("[data-search-panel]:not([hidden])").id');
    await finishQuery();
    assert.equal(await evaluate('document.activeElement.tagName'), 'SELECT');
    assert.equal(await evaluate('document.querySelector("[data-search-panel]:not([hidden])").id'), oldHeading);
    assert.equal(await evaluate('document.querySelector("#word-snack-play")'), null, 'never-opened completion does not offer a new game');

    // Malformed success closes focused game and restores query; no history added.
    await holdQuery('Malformed fixture while playing');
    await activate('#word-snack-play');
    await typeWord('abc');
    const historyBeforeError = await evaluate('document.querySelectorAll("button[aria-expanded]").length');
    malformedSearch = true;
    await finishQuery();
    malformedSearch = false;
    await waitFor('!document.querySelector("#word-snack-title")');
    assert.equal(await evaluate('document.activeElement.id'), 'recipe-query');
    assert.equal(await evaluate('document.querySelectorAll("button[aria-expanded]").length'), historyBeforeError);
    assert.ok(await evaluate('Boolean(document.querySelector("[role=alert]"))'));
    // A closed pending round stays closed on success.
    await holdQuery('Closed game can finish quietly');
    await activate('#word-snack-play');
    await evaluate('[...document.querySelectorAll("button")].find(x=>x.textContent==="Close game").click()');
    await finishQuery();
    assert.equal(await evaluate('document.querySelector("#word-snack-play").textContent'), 'View results');
    assert.equal(await evaluate('document.querySelector("#word-snack-title")'), null);
    assert.notEqual(await evaluate('document.activeElement.tagName'), 'BODY', 'closed-game completion does not strand launcher focus');
    await activate('#word-snack-play');
    assert.ok(await evaluate('document.activeElement.id.startsWith("search-heading-")'));
    assert.equal(await evaluate('document.querySelector("#word-snack-title")'), null);
    // HTTP failure closes the game and restores focus only when it was inside.
    await holdQuery('Busy fixture while playing');
    await activate('#word-snack-play');
    await typeWord('abc');
    fixtureStatus = 429;
    await finishQuery();
    fixtureStatus = 200;
    assert.equal(await evaluate('document.activeElement.id'), 'recipe-query');
    assert.equal(await evaluate('document.querySelector("#word-snack-title")'), null);
    // Error arrival must not steal focus from an earlier search control.
    await holdQuery('Unfocused game error fixture');
    await activate('#word-snack-play');
    await evaluate('document.querySelector("select").focus()');
    malformedSearch = true;
    await finishQuery();
    malformedSearch = false;
    assert.equal(await evaluate('document.activeElement.tagName'), 'SELECT');
    await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  const app = await startServer({}, true);
  server = app;
  const jar = new CookieJar();
  const { callback } = await signInWithGoogle(app.origin, jar);
  assert.equal(callback.status, 302);
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
    if (width === 320 || width === 1440) await writeFile(`org/reviews/word-snack-integration-sign-in-${width}.png`, Buffer.from(screenshot.data, 'base64'));
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
    if (width === 320 || width === 1440) await writeFile(`org/reviews/word-snack-integration-results-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    const initialRequests = searchRequests;
    fixtureRecipes = dinnerRecipes;
    await submitQuery('Easy vegetarian dinners');
    await waitFor('document.querySelectorAll("#notebook-title + p").length === 1 && document.querySelectorAll("article").length === 6');
    assert.equal(await evaluate('document.querySelectorAll("button[aria-expanded]").length'), 2);
    const gridColumns = await evaluate('getComputedStyle(document.querySelector("article").parentElement).gridTemplateColumns.split(" ").length');
    assert.equal(gridColumns, width < 640 ? 1 : width < 1024 ? 2 : 3);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    assert.ok(await evaluate('[...document.querySelectorAll("button,select,article a")].filter(x => x.getBoundingClientRect().width).every(x => x.getBoundingClientRect().height >= 44)'));
    await capture(`org/reviews/word-snack-notebook-${width}.png`);
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
    await capture(`org/reviews/word-snack-notebook-loading-${width}.png`);
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
    await capture(`org/reviews/word-snack-notebook-error-${width}.png`);
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
    await wordSnackFlow(width);
    await send('Page.reload');
    await waitFor('Boolean(document.querySelector("#recipe-query")) && !document.querySelector("#notebook-title")');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 0, 'reload clears transient history');
    assert.ok(await evaluate(`Boolean(document.querySelector('[aria-label="Getting started"]'))`));
    results.push({ width, signIn: 'passed', authenticatedRecipeForm: 'passed', httpsRecipePhoto: 'passed', keyboardButton: 'passed', history: 'passed', localFiltersAndSort: 'passed', loadingAndErrorRetention: 'passed', emptyAndLongContent: 'passed', wordSnack: 'passed', reloadClearsHistory: 'passed', overflow: false });
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
  assert.equal(errors.filter(error => error === expectedHttpError).length, 10, 'two intentional fixture 429s are reported at each width');
  const unexpectedErrors = errors.filter(error => error !== expectedHttpError);
  assert.deepEqual(unexpectedErrors, []);
  console.log(JSON.stringify({ recipeResults: 'browser response fixture; real HTTPS publisher image; no LLM calls', browser: 'isolated headless Google Chrome', results, logout: 'passed', googleButtonThroughMockedProvider: 'passed', intentionalFixtureHttp429s: 10, consoleAndNetworkErrors: unexpectedErrors }, null, 2));
} finally {
  socket?.close();
  await server?.stop();
  if (chrome.exitCode === null && chrome.signalCode === null) chrome.kill('SIGTERM');
}
