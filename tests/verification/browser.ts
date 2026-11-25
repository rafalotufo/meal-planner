// Real isolated Chrome, real compiled Next routes and database; no Google or injected app cookies.
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, realpath, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startVerificationServer } from './server.ts';
import { currentWeek } from '../../lib/plans/calendar.ts';
import type { VerificationHandoff } from '../../lib/verification/operator.ts';
interface ProtocolMessage { id?: number; error?: unknown; result?: unknown; method?: string; params?: { type?: string; args?: { value?: unknown; description?: string }[]; exceptionDetails?: { text: string }; request?: { url: string }; errorText?: string; frame?: { parentId?: string }; entry?: { level: string }; response?: { status: number } } }
const exec = promisify(execFile);
async function openFixtureChrome(host: string, port: number) {
  const profile = await realpath(await mkdtemp(join(tmpdir(), 'meal-verification-chrome-')));
  const child = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    `--host-resolver-rules=MAP ${host} 127.0.0.1:${port}`, '--no-proxy-server', '--ignore-certificate-errors', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', 'about:blank'], { stdio: 'ignore' });
  try {
  let debugPort = '';
  for (let attempt = 0; attempt < 100; attempt++) {
    try { debugPort = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.ok(debugPort, 'owned Chrome started');
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json() as { webSocketDebuggerUrl: string };
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise<void>((resolve, reject) => { socket.addEventListener('open', () => resolve(), { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 0, navigationCount = 0; const errors: string[] = [], requests: string[] = [];
  const pending = new Map<number, { resolve(value: unknown): void; reject(error: Error): void }>();
  function send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve: value => resolve(value as T), reject }); socket.send(JSON.stringify({ id, method, params })); });
  }
  socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data)) as ProtocolMessage;
    if (message.id) { const item = pending.get(message.id); pending.delete(message.id); if (message.error) item?.reject(new Error('Browser protocol command failed')); else item?.resolve(message.result); }
    const params = message.params;
    if (message.method === 'Page.frameNavigated' && params?.frame && !params.frame.parentId) navigationCount++;
    if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(params?.entry?.level ?? '')) errors.push(`log.${params!.entry!.level}`);
    if (message.method === 'Network.responseReceived' && (params?.response?.status ?? 0) >= 400) errors.push(`HTTP ${params!.response!.status}`);
    if (message.method === 'Runtime.exceptionThrown') errors.push(params?.exceptionDetails?.text ?? 'Browser exception');
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'warn'].includes(params?.type ?? '')) errors.push(`console.${params!.type}`);
    if (message.method === 'Network.loadingFailed' && params?.errorText !== 'net::ERR_ABORTED') errors.push(params?.errorText ?? 'Network failure');
    if (message.method === 'Network.requestWillBeSent' && params?.request) requests.push(params.request.url);
  });
  for (const method of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable']) await send(method);
  async function evaluate<T = unknown>(expression: string): Promise<T> {
    const value = await send<{ result: { value?: T }; exceptionDetails?: unknown }>('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (value.exceptionDetails) throw new Error('Browser inspection failed'); return value.result.value as T;
  }
  async function waitFor(expression: string, label: string) {
    for (let attempt = 0; attempt < 150; attempt++) { try { if (await evaluate(expression)) return; } catch { /* Navigation replaces execution contexts. */ } await new Promise(resolve => setTimeout(resolve, 100)); }
    throw new Error(`Browser condition failed: ${label}`);
  }
  async function navigate(path: string) {
    const before = navigationCount; await send('Page.navigate', { url: `https://${host}${path}` });
    for (let attempt = 0; navigationCount <= before; attempt++) { if (attempt >= 150) throw new Error('Browser navigation did not commit'); await new Promise(resolve => setTimeout(resolve, 100)); }
    await waitFor("document.readyState==='complete'", 'page loaded');
  }
  async function click(selector: string) {
    await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`, 'control present');
    const point = await evaluate<{ x: number; y: number }>(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  }
  async function viewport(width: number) { await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false }); await evaluate('document.fonts.ready'); assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true, 'no horizontal overflow'); }
  async function screenshot(path: string) { const value = await send<{ data: string }>('Page.captureScreenshot', { format: 'png' }); await writeFile(path, Buffer.from(value.data, 'base64')); }
  async function close() {
    socket.close();
    if (child.exitCode === null && child.signalCode === null) { const exited = new Promise<void>(resolve => child.once('exit', () => resolve())); child.kill('SIGTERM'); await exited; }
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  return { send, evaluate, waitFor, navigate, click, viewport, screenshot, close, errors, requests };
  } catch (error) {
    if (child.exitCode === null && child.signalCode === null) { const exited = new Promise<void>(resolve => child.once('exit', () => resolve())); child.kill('SIGTERM'); await exited; }
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    throw error;
  }
}
async function main() {
const fixture = await startVerificationServer();
let browser: Awaited<ReturnType<typeof openFixtureChrome>> | undefined;
try {
  const recipe = { title: 'Verification vegetable supper', summary: 'A synthetic supper snapshot for this isolated local browser check.', sourceUrl: 'https://www.bbcgoodfood.com/recipes/vegetable-stew', imageUrl: null, time: null };
  await fixture.ownerDb.transaction(async db => {
    await db.execute('INSERT INTO menu_recipes(id,family_id,source_url,image_url,title,summary,time_kind,time_text,saved_at) VALUES($1,$2,$3,NULL,$4,$5,NULL,NULL,$6)', [randomUUID(), fixture.run.familyId, recipe.sourceUrl, recipe.title, recipe.summary, Date.now()]);
    await db.execute('INSERT INTO meal_plan_weeks(id,family_id,week_start,meals,created_at) VALUES($1,$2,$3,$4,$5)', [randomUUID(), fixture.run.familyId, currentWeek(new Date()), JSON.stringify([recipe]), Date.now()]);
  });
  browser = await openFixtureChrome(fixture.host, fixture.httpsPort);
  await browser.navigate('/verification');
  await browser.waitFor("Boolean(document.querySelector('#capability'))", 'native verification form');
  assert.equal(await browser.evaluate("document.querySelector('#capability').type"), 'password');
  for (const width of [390, 1440]) { await browser.viewport(width); await browser.screenshot(`org/reviews/agent-verification-entry-${width}.png`); }
  // The handoff secret remains in this private test process; CDP traffic is not logged or traced.
  const handoff = JSON.parse(await readFile(fixture.handoffPath, 'utf8')) as VerificationHandoff;
  await browser.click('#runId'); await browser.send('Input.insertText', { text: handoff.runId });
  await browser.click('#capability'); await browser.send('Input.insertText', { text: handoff.members[0].capability });
  await browser.click('button');
  try { await browser.waitFor("location.pathname==='/'&&Boolean(document.querySelector('#recipe-query'))", 'authenticated home via native form'); }
  catch {
    const state = await browser.evaluate<{ path: string; text: string }>("({path:location.pathname,text:document.body.innerText.slice(0,400)})");
    throw new Error(`Native form transition failed: ${JSON.stringify(state)}; ingress: ${JSON.stringify(fixture.exchangeObservations)}; server: ${fixture.output().slice(-2000)}`);
  }
  assert.equal(fixture.exchangeObservations.length, 1, 'one native form exchange');
  assert.equal(fixture.exchangeObservations[0].origin, fixture.origin, 'native form retains the exact Origin');
  assert.equal(fixture.exchangeObservations[0].nonceMatches, true);
  assert.equal(fixture.exchangeObservations[0].nonceValid, true);
  await unlink(fixture.handoffPath);
  for (const width of [390, 1440]) {
    await browser.viewport(width);
    for (const [path, selector, name] of [['/', '#recipe-query', 'home'], ['/menu', '#menu-heading', 'menu'], ['/family', '#members-heading', 'family'], ['/plans', '#plan-heading', 'plans']] as const) {
      await browser.navigate(path); await browser.waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`, `${name} authenticated page`);
      assert.equal(await browser.evaluate("Boolean(document.querySelector('[role=alert]'))"), false, `${name} has no application error`);
      await browser.screenshot(`org/reviews/agent-verification-${name}-${width}.png`);
    }
  }
  await browser.navigate('/family');
  assert.equal(await browser.evaluate("document.body.innerText.includes('Verification member')"), true);
  assert.equal(await browser.evaluate("document.body.innerText.includes('Invitations are unavailable for verification members.')"), true);
  await browser.navigate('/sign-out'); await browser.click('main button');
  await browser.waitFor("location.pathname==='/sign-in'", 'same-origin session logout');
  await browser.navigate('/menu'); await browser.waitFor("location.pathname==='/sign-in'", 'logout removes private access');
  assert.equal(browser.requests.some(url => new URL(url).hostname === 'accounts.google.com'), false, 'no Google flow used');
  assert.equal(browser.requests.some(url => new URL(url).pathname === '/api/recipes/search'), false, 'no provider request issued');
  assert.equal((await fixture.ownerDb.one<{ n: number }>('SELECT count(*) AS n FROM verification_sessions WHERE run_id=$1 AND revoked_at IS NOT NULL', [fixture.run.runId]))?.n, 1);
  assert.deepEqual(browser.errors, []);
  const version = (await exec('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--version'])).stdout.trim();
  console.log(JSON.stringify({ browser: version, viewports: [390, 1440], entry: 'native form and server-set Secure cookie', pages: ['home', 'menu', 'family', 'plans'], logout: 'revoked and protected redirect verified', googleCalls: 0, providerCalls: 0, errors: browser.errors, attribution: 'isolated real Next Preview build and database; simulated platform metadata and loopback TLS; no hosted proof', gaps: ['Firefox unavailable', 'Safari automation not executed'] }, null, 2));
} finally { await browser?.close(); await fixture.stop(); }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Verification browser check failed'); process.exitCode = 1; });
