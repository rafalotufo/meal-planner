// Optional real-Chrome QA. Requires an installed Chrome; no browser dependency in the app.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CookieJar, startServer } from './server.ts';
import { signInWithGoogle } from './flow.ts';
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
let holdSprites = false;
const heldSprites: string[] = [];
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  assert.ok(port, 'isolated Chrome started');
  const target: { id: string; webSocketDebuggerUrl: string } = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
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
      } else if (target.pathname.startsWith('/games/t-rex/')) {
        if (holdSprites) heldSprites.push(params.requestId);
        else send('Fetch.continueRequest', { requestId: params.requestId }).catch((error: unknown) => errors.push(String(error)));
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
    for (let attempt = 0; attempt < 220; attempt++) {
      if (await evaluate(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error(`Browser condition did not settle: ${expression}`);
  }
  async function submitQuery(query: string, activation?: "touch" | "mouse" | "keyboard") {
    await evaluate(`(() => {
      const input = document.querySelector('#recipe-query');
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, ${JSON.stringify(query)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    if (activation === "touch" || activation === "keyboard") await activate('button[type=submit]', activation === "touch");
    else if (activation === "mouse") {
      await evaluate('document.querySelector("button[type=submit]").scrollIntoView({block:"center"})');
      const point = await evaluate('(() => {const r=document.querySelector("button[type=submit]").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()') as {x:number;y:number};
      await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
    } else await evaluate('document.querySelector("form").requestSubmit()');
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
  async function holdQuery(query: string, activation: "touch" | "mouse" | "keyboard" = "keyboard") {
    holdSearch = true;
    await submitQuery(query, activation);
    await waitFor('Boolean(document.querySelector("#t-rex-surface"))');
    assert.ok(heldRequest);
  }
  async function finishQuery() {
    assert.ok(heldRequest);
    await fulfillSearch(heldRequest);
    heldRequest = undefined; holdSearch = false;
    await waitFor('!document.querySelector("button[type=submit]").disabled');
    await waitFor('!document.querySelector("#t-rex-surface") && !document.querySelector("#t-rex-show")');
  }
  async function releaseSprites() {
    holdSprites = false;
    for (const requestId of heldSprites.splice(0)) await send('Fetch.continueRequest', { requestId });
  }
  async function resources() {
    return await evaluate('window.__runnerProbe.counts()') as { frames: number; listeners: number; observers: number };
  }
  async function runnerFlow(width: number) {
    const touch = width <= 390;
    await send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: 1 });
    const baseline = await resources();
    assert.equal(baseline.frames, 0);
    // Force a genuine focus/pointer interaction after submit queued a round,
    // but before React's first commit. Images are still held when focus returns.
    fixtureRecipes=dinnerRecipes;
    await send('Network.setCacheDisabled',{cacheDisabled:true});
    holdSprites=true;
    await evaluate('window.__runnerProbe.revokeInitialFocus=true');
    await holdQuery('Initial outside interaction revokes autostart');
    assert.equal(await evaluate('document.activeElement.id'),await evaluate('window.__runnerProbe.revokedTarget'));
    for(let attempt=0;attempt<100&&!heldSprites.length;attempt++)await new Promise(resolve=>setTimeout(resolve,25));
    assert.ok(heldSprites.length,'sprites are held before focus returns');
    await evaluate('document.querySelector("#t-rex-surface").focus()');
    await releaseSprites();
    await waitFor('!document.querySelector("#t-rex-jump").disabled');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused','revoked initial eligibility cannot be restored by focus or late sprites');
    assert.equal((await resources()).frames,0);
    await key(' ','Space',32,' ');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
    await activate('#t-rex-pause',touch);
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
    await finishQuery();
    await send('Network.setCacheDisabled',{cacheDisabled:false});
    assert.deepEqual(await resources(),baseline);

    // Successful arrival while an earlier result control has focus retains
    // that exact node, open panel and sort, while still inserting new history.
    await holdQuery('Successful arrival retains old panel focus');
    await evaluate(`(() => {const control=document.querySelector('select');control.value='quickest';control.dispatchEvent(new Event('change',{bubbles:true}));control.focus();window.__runnerProbe.oldControl=control;window.__runnerProbe.oldPanel=control.closest('[data-search-panel]').id;})()`);
    const beforeOldPanel=await evaluate('document.querySelectorAll("button[aria-expanded]").length');
    await finishQuery();
    assert.ok(await evaluate('document.activeElement===window.__runnerProbe.oldControl'));
    assert.equal(await evaluate('document.querySelector("[data-search-panel]:not([hidden])").id'),await evaluate('window.__runnerProbe.oldPanel'));
    assert.equal(await evaluate('document.activeElement.value'),'quickest');
    assert.equal(await evaluate('document.querySelectorAll("button[aria-expanded]").length'),Number(beforeOldPanel)+1);
    assert.deepEqual(await resources(),baseline);
    fixtureRecipes = dinnerRecipes;
    const requestsBefore = searchRequests;
    await holdQuery('Dinner while running T-Rex', touch ? 'touch' : 'mouse');
    await waitFor('document.querySelector("#t-rex-status").textContent.startsWith("Running")');
    assert.equal(await evaluate('document.activeElement.id'), 't-rex-surface');
    assert.equal(await evaluate('document.querySelector("#word-snack-title")'), null);
    const runningResources = await resources();
    assert.equal(runningResources.frames, 1);
    assert.equal(runningResources.observers, baseline.observers + 1);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    assert.ok(await evaluate('Math.abs(document.querySelector("#t-rex-surface").getBoundingClientRect().width-document.querySelector("#t-rex-surface").parentElement.getBoundingClientRect().width)<1'), 'game fills available content width');
    assert.ok(await evaluate('[...document.querySelectorAll("[aria-labelledby=t-rex-title] button")].every(x=>x.getBoundingClientRect().width>=44&&x.getBoundingClientRect().height>=44)'));
    const pixels = await evaluate(`(() => {const c=document.querySelector('#t-rex-surface');return [...c.getContext('2d').getImageData(0,0,c.width,c.height).data].filter((x,i)=>i%4===3&&x>0).length;})()`);
    assert.ok(Number(pixels) > 100, 'actual original sprites draw visible pixels');
    const ax = await send<{nodes:{role?:{value?:string};name?:{value?:string}}[]}>('Accessibility.getFullAXTree');
    assert.ok(ax.nodes.some(n=>n.name?.value==='T-Rex jumping game'));
    assert.ok(ax.nodes.some(n=>n.role?.value==='button'&&n.name?.value==='Jump'));
    if (width===320||width===1440) await capture(`org/reviews/t-rex-running-${width}.png`);
    // Scoped Space consumes both fresh and held presses, without scrolling.
    await evaluate('document.querySelector("#t-rex-surface").focus();window.scrollTo(0,0)');
    const scrollBefore = await evaluate('scrollY');
    await key(' ', 'Space', 32, ' ');
    await waitFor('Number(document.querySelector("#t-rex-surface").dataset.y)<93');
    const jumpingY = await evaluate('Number(document.querySelector("#t-rex-surface").dataset.y)');
    await send('Input.dispatchKeyEvent', {type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32,autoRepeat:true,text:' '});
    await send('Input.dispatchKeyEvent', {type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
    assert.equal(await evaluate('scrollY'), scrollBefore);
    assert.ok(Number(jumpingY)<93);
    await activate('#t-rex-pause',touch);
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="paused"');
    assert.equal((await resources()).frames,0);
    const pausedScore=await evaluate('document.querySelector("#t-rex-score").textContent');
    await new Promise(resolve=>setTimeout(resolve,120));
    assert.equal(await evaluate('document.querySelector("#t-rex-score").textContent'),pausedScore);
    if(width===320||width===1440)await capture(`org/reviews/t-rex-paused-${width}.png`);
    await evaluate('document.querySelector("#t-rex-surface").focus()');
    await key(' ','Space',32,' ');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
    await activate('#t-rex-pause',touch);
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
    await activate('#t-rex-jump',touch);
    await waitFor('Number(document.querySelector("#t-rex-surface").dataset.y)<93');
    // Completion mid-jump closes and cancels immediately, no continued play.
    await finishQuery();
    assert.ok(await evaluate('document.activeElement.id.startsWith("search-heading-")'));
    assert.deepEqual(await resources(),baseline);
    assert.equal(searchRequests,requestsBefore+1);
    assert.deepEqual(JSON.parse(searchBodies.at(-1)??'{}'),{query:'Dinner while running T-Rex'});
    if(width===320||width===1440)await capture(`org/reviews/t-rex-dismissed-${width}.png`);

    // Show restores paused state, owns one loop at most, and zero results discard it.
    await holdQuery('Hidden runner and zero matches');
    await waitFor('!document.querySelector("#t-rex-jump").disabled');
    await activate('#t-rex-hide',touch);
    await waitFor('Boolean(document.querySelector("#t-rex-show"))');
    assert.equal(await evaluate('document.activeElement.id'),'t-rex-show');
    assert.deepEqual(await resources(),baseline);
    for(let cycle=0;cycle<3;cycle++){
      await activate('#t-rex-show',touch);
      await waitFor('!document.querySelector("#t-rex-jump").disabled');
      assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
      assert.equal((await resources()).frames,0);
      await activate('#t-rex-hide',touch);
      assert.deepEqual(await resources(),baseline);
    }
    fixtureRecipes=[];
    await finishQuery();
    assert.ok(await evaluate('document.activeElement.id.startsWith("search-heading-")'));
    assert.ok(await evaluate('document.querySelector("p[role=status]").textContent.includes("No matching recipes")'));
    assert.deepEqual(await resources(),baseline);

    // Reduced motion and changing preference require explicit opt-in, never Jump.
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    fixtureRecipes=dinnerRecipes;
    await holdQuery('Reduced motion runner');
    await waitFor('!document.querySelector("#t-rex-jump").disabled');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
    await activate('#t-rex-jump',touch);
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
    await activate('#t-rex-pause',touch);
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await new Promise(resolve=>setTimeout(resolve,60));
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="paused"');
    await finishQuery();
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    assert.deepEqual(await resources(),baseline);

    // Textarea Space still types; outside focus never resumes or is stolen on success.
    await holdQuery('Outside focus and ordinary keys');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
    await evaluate('document.querySelector("#recipe-query").focus()');
    const valueBefore=await evaluate('document.querySelector("#recipe-query").value');
    await key(' ','Space',32,' ');
    assert.equal(await evaluate('document.querySelector("#recipe-query").value'),String(valueBefore)+' ');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="paused"');
    await finishQuery();
    assert.equal(await evaluate('document.activeElement.id'),'recipe-query');
    assert.deepEqual(await resources(),baseline);

    // Delayed sprite cannot defer the POST, steal focus, or revive a completed game.
    await send('Network.setCacheDisabled',{cacheDisabled:true});
    holdSprites=true;
    await holdQuery('Complete before the sprites load');
    await waitFor('document.querySelector("#t-rex-status").textContent.includes("Loading")');
    await waitFor('window.__runnerProbe.counts().observers>0');
    if(width===320||width===1440)await capture(`org/reviews/t-rex-loading-${width}.png`);
    assert.ok(heldRequest,'search POST already dispatched while assets are held');
    const beforeDuplicate=searchRequests;
    await evaluate('document.querySelector("form").requestSubmit()');
    assert.equal(searchRequests,beforeDuplicate,'pending duplicate cannot create another game/request');
    await finishQuery();
    const focusAfterFinish=await evaluate('document.activeElement.id');
    await releaseSprites();
    await new Promise(resolve=>setTimeout(resolve,100));
    assert.equal(await evaluate('document.querySelector("#t-rex-surface")'),null);
    assert.equal(await evaluate('document.activeElement.id'),focusAfterFinish);
    assert.deepEqual(await resources(),baseline);

    // A pause while loading survives asset completion; later outside interaction defeats start.
    holdSprites=true;
    await holdQuery('Pause while sprites load');
    await activate('#t-rex-pause',touch);
    await releaseSprites();
    await waitFor('!document.querySelector("#t-rex-jump").disabled');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
    await finishQuery();
    await send('Network.setCacheDisabled',{cacheDisabled:false});

    // Normal collision stops the frame; one native Space on Jump restarts once.
    await holdQuery('Collision and restart');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="crashed"');
    assert.equal((await resources()).frames,0);
    if(width===320||width===1440)await capture(`org/reviews/t-rex-crashed-${width}.png`);
    await evaluate('document.querySelector("#t-rex-jump").focus()');
    await key(' ','Space',32,' ');
    await waitFor('Number(document.querySelector("#t-rex-surface").dataset.y)<93');
    assert.ok(Number(await evaluate('document.querySelector("#t-rex-score").textContent'))<5);
    // Resize / DPR changes redraw backing pixels, not logical physics position.
    await activate('#t-rex-pause');
    const yBefore=await evaluate('document.querySelector("#t-rex-surface").dataset.y');
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:2,mobile:false});
    await evaluate('window.dispatchEvent(new Event("resize"))');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.y'),yBefore);
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").width'),Math.round(Number(await evaluate('document.querySelector("#t-rex-surface").getBoundingClientRect().width'))*2));
    await finishQuery();
    await holdQuery('Retina runner sprite');
    await waitFor('!document.querySelector("#t-rex-jump").disabled');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").width'),Math.round(Number(await evaluate('document.querySelector("#t-rex-surface").getBoundingClientRect().width'))*2));
    await finishQuery();
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    assert.deepEqual(await resources(),baseline);

    // Window blur and a hidden document pause; returning never auto-resumes.
    await holdQuery('Blur and visibility pauses');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
    await evaluate('window.dispatchEvent(new Event("blur"))');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="paused"');
    assert.equal((await resources()).frames,0);
    await activate('#t-rex-pause',touch);
    await evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))');
    await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="paused"');
    await evaluate('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"))');
    assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
    assert.equal((await resources()).frames,0);
    await finishQuery();
    assert.deepEqual(await resources(),baseline);
    if(width===1440){
      // Actual background-tab transition in this isolated Chrome profile.
      await holdQuery('Actual tab visibility');
      await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="running"');
      await send('Emulation.setFocusEmulationEnabled',{enabled:false});
      const background = await send<{targetId:string}>('Target.createTarget',{url:'about:blank'});
      await send('Target.activateTarget',{targetId:background.targetId});
      await waitFor('document.hidden&&document.querySelector("#t-rex-surface").dataset.mode==="paused"');
      assert.equal((await resources()).frames,0);
      await send('Target.activateTarget',{targetId:target.id});
      await send('Page.bringToFront');
      await send('Emulation.setFocusEmulationEnabled',{enabled:true});
      await waitFor('!document.hidden');
      assert.equal(await evaluate('document.querySelector("#t-rex-surface").dataset.mode'),'paused');
      await send('Target.closeTarget',{targetId:background.targetId});
      await finishQuery();assert.deepEqual(await resources(),baseline);
      // Terminal-state matrix beyond the five-width smoke: zero also discards
      // jumping, paused and asset-loading states; success discards a crash.
      fixtureRecipes=[];
      for(const mode of ['jumping','paused','loading']){
        holdSprites=mode==='loading';
        await send('Network.setCacheDisabled',{cacheDisabled:true});
        await holdQuery('Zero results in '+mode);
        if(mode!=='loading')await waitFor('!document.querySelector("#t-rex-jump").disabled&&document.querySelector("#t-rex-surface").dataset.mode==="running"');
        if(mode==='jumping'){await key(' ','Space',32,' ');await waitFor('Number(document.querySelector("#t-rex-surface").dataset.y)<93');}
        if(mode==='paused')await activate('#t-rex-pause');
        await finishQuery();await releaseSprites();
        assert.deepEqual(await resources(),baseline);
      }
      await send('Network.setCacheDisabled',{cacheDisabled:false});
      fixtureRecipes=dinnerRecipes;
      await holdQuery('Results while crashed');
      await waitFor('document.querySelector("#t-rex-surface").dataset.mode==="crashed"');
      await finishQuery();assert.deepEqual(await resources(),baseline);
      // Context failure is injected only by this browser harness.
      await evaluate('window.__runnerProbe.failContext=true');
      await holdQuery('Unavailable canvas still searches');
      await waitFor('document.querySelector("#t-rex-status").textContent.includes("Game unavailable")');
      assert.equal((await resources()).frames,0);
      await finishQuery();assert.deepEqual(await resources(),baseline);
      await evaluate('window.__runnerProbe.failContext=false');
    }
    if(width===1440){
      // Navigation aborts pending request and all old resources; the next page
      // gets a fresh runner without timers or late input from the old instance.
      await holdQuery('Navigate away while running');
      await send('Page.reload');
      heldRequest=undefined;holdSearch=false;
      await waitFor('Boolean(document.querySelector("#recipe-query"))&&!document.querySelector("#t-rex-surface")');
      await waitFor('window.__runnerProbe.counts().frames===0&&window.__runnerProbe.counts().observers===0');
      await waitFor('document.readyState==="complete"');
      await new Promise(resolve=>setTimeout(resolve,150));
      await submitQuery('Rebuild history after navigation');
      await waitFor('Boolean(document.querySelector("select"))');
    }
    // Focused error returns query focus, outside error retains prior notebook control.
    await holdQuery('Busy search while running');fixtureStatus=429;
    await finishQuery();fixtureStatus=200;
    assert.equal(await evaluate('document.activeElement.id'),'recipe-query');
    await holdQuery('Malformed success while browsing history');
    await evaluate('document.querySelector("select").focus()');
    malformedSearch=true;await finishQuery();malformedSearch=false;
    assert.equal(await evaluate('document.activeElement.tagName'),'SELECT');
    assert.deepEqual(await resources(),baseline);
    await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  }
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    const frames=new Set(),observers=new Set(),listeners=new Map();
    const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>{let id=raf(t=>{frames.delete(id);cb(t);});frames.add(id);return id;};
    window.cancelAnimationFrame=id=>{frames.delete(id);cancel(id);};
    const Base=window.ResizeObserver;
    window.ResizeObserver=class extends Base{constructor(cb){super(cb);observers.add(this);}disconnect(){observers.delete(this);super.disconnect();}};
    const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
    function key(target,type){return target===window&&['blur','resize'].includes(type)?'window:'+type:target===document&&type==='visibilitychange'?'document:'+type:target instanceof MediaQueryList&&type==='change'?target:null;}
    EventTarget.prototype.addEventListener=function(type,listener,options){const k=key(this,type);if(k){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(listener);}return add.call(this,type,listener,options);};
    EventTarget.prototype.removeEventListener=function(type,listener,options){const k=key(this,type);if(k)listeners.get(k)?.delete(listener);return remove.call(this,type,listener,options);};
    const getContext=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(...args){if(this.id==='t-rex-surface'&&window.__runnerProbe?.failContext)return null;return getContext.apply(this,args);};
    window.__runnerProbe={counts:()=>({frames:frames.size,observers:observers.size,listeners:[...listeners.values()].reduce((n,set)=>n+set.size,0)})};
    const fetchOriginal=window.fetch;
    window.fetch=function(...args){
      if(window.__runnerProbe.revokeInitialFocus&&String(args[0]).includes('/api/recipes/search')){
        window.__runnerProbe.revokeInitialFocus=false;
        const outside=document.querySelector('button[aria-expanded]');
        window.__runnerProbe.revokedTarget=outside.id;
        outside.focus();outside.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
      }
      return fetchOriginal.apply(this,args);
    };
  })()` });
  const app = await startServer({}, true);
  server = app;
  const jar = new CookieJar();
  const { callback } = await signInWithGoogle(app.origin, jar);
  assert.equal(callback.status, 302);
  await send('Fetch.enable', { patterns: [{ urlPattern: `${app.origin}/api/recipes/search`, requestStage: 'Request' }, { urlPattern: `${app.origin}/games/t-rex/*.png`, requestStage: 'Request' }] });
  const notice = await jar.request(app.origin,'/games/t-rex/THIRD-PARTY-NOTICES.txt');
  assert.equal(notice.status,200);
  assert.match(await notice.text(),/Copyright 2015 The Chromium Authors/);
  const anonymousSprite = await fetch(`${app.origin}/games/t-rex/100-offline-sprite.png`,{redirect:'manual'});
  assert.equal(anonymousSprite.status,307,'game assets retain authenticated access');
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
    if (width === 320 || width === 1440) await writeFile(`org/reviews/t-rex-integration-sign-in-${width}.png`, Buffer.from(screenshot.data, 'base64'));
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
    if (width === 320 || width === 1440) await writeFile(`org/reviews/t-rex-integration-results-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    const initialRequests = searchRequests;
    fixtureRecipes = dinnerRecipes;
    await submitQuery('Easy vegetarian dinners');
    await waitFor('document.querySelectorAll("#notebook-title + p").length === 1 && document.querySelectorAll("article").length === 6');
    assert.equal(await evaluate('document.querySelectorAll("button[aria-expanded]").length'), 2);
    const gridColumns = await evaluate('getComputedStyle(document.querySelector("article").parentElement).gridTemplateColumns.split(" ").length');
    assert.equal(gridColumns, width < 640 ? 1 : width < 1024 ? 2 : 3);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    assert.ok(await evaluate('[...document.querySelectorAll("button,select,article a")].filter(x => x.getBoundingClientRect().width).every(x => x.getBoundingClientRect().height >= 44)'));
    await capture(`org/reviews/t-rex-notebook-${width}.png`);
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
    await capture(`org/reviews/t-rex-notebook-loading-${width}.png`);
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
    await capture(`org/reviews/t-rex-notebook-error-${width}.png`);
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
    await runnerFlow(width);
    await send('Page.reload');
    await waitFor('Boolean(document.querySelector("#recipe-query")) && !document.querySelector("#notebook-title")');
    assert.equal(await evaluate('document.querySelectorAll("article").length'), 0, 'reload clears transient history');
    assert.ok(await evaluate(`Boolean(document.querySelector('[aria-label="Getting started"]'))`));
    results.push({ width, signIn: 'passed', authenticatedRecipeForm: 'passed', httpsRecipePhoto: 'passed', keyboardButton: 'passed', history: 'passed', localFiltersAndSort: 'passed', loadingAndErrorRetention: 'passed', emptyAndLongContent: 'passed', tRex: 'passed', reloadClearsHistory: 'passed', overflow: false });
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
  await send('Fetch.enable', { patterns: [{ urlPattern: 'https://accounts.google.com/o/oauth2/*', requestStage: 'Request' }, { urlPattern: `${app.origin}/api/recipes/search`, requestStage: 'Request' }, { urlPattern: `${app.origin}/games/t-rex/*.png`, requestStage: 'Request' }] });
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
