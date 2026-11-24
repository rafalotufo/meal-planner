// Focused optional QA with installed Chrome; no browser dependency or live provider calls.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CookieJar, startServer } from './server.ts';
import { provision, signInWithGoogle } from './flow.ts';

interface Evaluation { exceptionDetails?: { text: string }; result: { value?: unknown } }
interface Message { id?: number; error?: unknown; result?: unknown; method?: string; params?: { type?: string; exceptionDetails?: { text: string }; entry?: { level: string; text: string }; response?: { url: string; status: number }; args?: { value?: unknown }[] } }
const profile = await mkdtemp(join(tmpdir(), 'meal-icon-chrome-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', 'about:blank'], { stdio: 'ignore' });
let app: Awaited<ReturnType<typeof startServer>> | undefined;
let socket: WebSocket | undefined;
try {
  let port: string | undefined;
  for (let n = 0; n < 100; n++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.ok(port, 'isolated Chrome started');
  const target: { webSocketDebuggerUrl: string } = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  const connection = socket;
  await new Promise<void>((resolve, reject) => { connection.addEventListener('open', () => resolve(), { once: true }); connection.addEventListener('error', reject, { once: true }); });
  let id = 0;
  const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  const errors: string[] = [];
  const imageResponses: { pathname: string; status: number }[] = [];
  connection.addEventListener('message', ({ data }) => {
    const message = JSON.parse(String(data)) as Message;
    if (message.id) {
      const item = pending.get(message.id); pending.delete(message.id);
      if (message.error) item?.reject(new Error(JSON.stringify(message.error))); else item?.resolve(message.result);
    }
    const params = message.params;
    if (message.method === 'Runtime.exceptionThrown') errors.push(params?.exceptionDetails?.text ?? 'exception');
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'warn'].includes(params?.type ?? '')) errors.push(JSON.stringify(params));
    if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(params?.entry?.level ?? '')) errors.push(params?.entry?.text ?? 'log error');
    if (message.method === 'Network.responseReceived' && params?.response && app) {
      const url = new URL(params.response.url);
      if (url.origin === app.origin && ['/icon.svg', '/favicon.ico'].includes(url.pathname)) imageResponses.push({ pathname: url.pathname, status: params.response.status });
    }
  });
  function send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => { const key = ++id; pending.set(key, { resolve: value => resolve(value as T), reject }); connection.send(JSON.stringify({ id: key, method, params })); });
  }
  async function evaluate(expression: string) {
    const value = await send<Evaluation>('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (value.exceptionDetails) throw new Error(value.exceptionDetails.text);
    return value.result.value;
  }
  async function navigate(url: string) {
    await send('Page.navigate', { url });
    for (let n = 0; n < 100; n++) {
      if (await evaluate('document.readyState') === 'complete' && await evaluate('location.href') === url) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error('Navigation timeout');
  }
  async function capture(name: string) {
    const image = await send<{ data: string }>('Page.captureScreenshot', { format: 'png' });
    await writeFile(`org/reviews/${name}.png`, Buffer.from(image.data, 'base64'));
  }
  for (const method of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable']) await send(method);
  const running = await startServer({}, true); app = running;
  const jar = new CookieJar();
  assert.equal((await signInWithGoogle(running.origin, jar)).callback.status, 302);
  assert.equal((await provision(running.origin, jar)).status, 200);
  const results = [];
  for (const width of [390, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 390 });
    await send('Network.clearBrowserCookies');
    for (const page of ['sign-in', 'home']) {
      if (page === 'home') await send('Network.setCookies', { cookies: [...jar.values].map(([name, value]) => ({ name, value, url: running.origin, httpOnly: true, sameSite: 'Lax' })) });
      await navigate(`${running.origin}/${page === 'home' ? '' : page}`);
      assert.equal(await evaluate('document.title'), 'Meal Planner');
      assert.equal(await evaluate('document.querySelector("h1")?.textContent'), page === 'home' ? 'Meal Planner' : 'Sign in to Meal Planner');
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
      const links = await evaluate('[...document.querySelectorAll(\'link[rel="icon"]\')].map(x => x.href)');
      assert.ok(Array.isArray(links)); assert.equal(links.length, 2);
      assert.deepEqual(new Set(links.map((url: string) => new URL(url).pathname)), new Set(['/icon.svg', '/favicon.ico']));
      for (const href of links) {
        const dimensions = await evaluate(`(async () => { const image = new Image(); image.src = ${JSON.stringify(href)}; await image.decode(); return [image.naturalWidth, image.naturalHeight]; })()`);
        assert.ok(Array.isArray(dimensions)); assert.ok(dimensions[0] >= 16); assert.equal(dimensions[0], dimensions[1]);
      }
      await capture(`app-icon-${page}-${width}`);
      results.push({ width, mobile: width === 390, page, title: 'Meal Planner', localIcons: 2, decode: 'passed', overflow: false });
    }
  }
  const svg = `data:image/svg+xml;base64,${(await readFile('app/icon.svg')).toString('base64')}`;
  const ico = `data:image/x-icon;base64,${(await readFile('app/favicon.ico')).toString('base64')}`;
  const rows = ['#fff', '#202124'].map(background => `<section style="background:${background};color:${background === '#fff' ? '#202124' : '#fff'};padding:24px"><h2>${background === '#fff' ? 'Light' : 'Dark'} surround</h2>${[svg, ico].map((src, i) => `<div style="display:flex;align-items:center;gap:32px;margin:24px 0"><span style="width:100px">${i === 0 ? 'SVG' : 'ICO'}</span><img src="${src}" width="16" height="16"><img src="${src}" width="32" height="32"><img src="${src}" width="128" height="128"></div>`).join('')}</section>`).join('');
  await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 1100, deviceScaleFactor: 1, mobile: false });
  await navigate(`data:text/html;base64,${Buffer.from(`<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:system-ui"><h1 style="margin:24px">Meal Planner — icon inspection</h1><p style="margin:24px">16px · 32px · enlarged preview</p>${rows}</body></html>`).toString('base64')}`);
  assert.equal(await evaluate('Promise.all([...document.images].map(image => image.decode())).then(() => true)'), true);
  await capture('app-icon-preview');
  assert.deepEqual(errors, []);
  assert.deepEqual(new Set(imageResponses.map(response => response.pathname)), new Set(['/icon.svg', '/favicon.ico']));
  assert.ok(imageResponses.every(response => response.status === 200));
  console.log(JSON.stringify({ browser: 'isolated headless Google Chrome', attribution: 'test-process Google fixture; no live provider calls', results, imageResponses, consoleWarningsAndErrors: errors, tabChrome: 'not exposed by headless Chrome; metadata/network/decoding verified', preview: 'org/reviews/app-icon-preview.png' }, null, 2));
} finally {
  socket?.close(); await app?.stop();
  if (chrome.exitCode === null && chrome.signalCode === null) { const stopped = new Promise(resolve => chrome.once('exit', resolve)); chrome.kill('SIGTERM'); await stopped; }
  await rm(profile, { recursive: true, force: true });
}
