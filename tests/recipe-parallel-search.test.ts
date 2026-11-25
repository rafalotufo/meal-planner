import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as turn } from 'node:timers/promises';
import { createParallelRecipeProvider } from '../lib/recipes/parallel-search.js';
import { BoundedPool } from '../lib/recipes/concurrency.js';
import { createSearchHandler } from '../lib/recipes/search.js';
import { sourceHtml, curated, response } from './recipe-brave-fixtures.js';
function setup(count=12){
 const hits=Array.from({length:count},(_,i)=>({url:`https://recipes.example.com/dish-${i}`,title:`Dish ${i}`}));
 let braveCalls=0,modelCalls=0,sourceCalls=0,active=0,maxActive=0;
 const transport:typeof fetch=async(url,init)=>{
  if(String(url).includes('search.brave.com')){braveCalls++;return Response.json({web:{results:hits}});}
  modelCalls++;maxActive=Math.max(maxActive,++active);await turn();active--;
  const input=JSON.parse(JSON.parse(String(init?.body)).input);const title=input.source.titles[0];
  return Response.json(response(curated({title})));
 };
 const loadHtml=async(url:string)=>{sourceCalls++;return sourceHtml(url,hits.find(x=>x.url===url)?.title??'Child recipe');};
 const pools={source:new BoundedPool(2,48),model:new BoundedPool(12,24)};
 return {hits,transport,loadHtml,pools,stats:()=>({braveCalls,modelCalls,sourceCalls,maxActive})};
}
test('twelve cards curate concurrently through shared pools, preserve discovery order and exact budgets',async()=>{
 const f=setup(20);const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',transport:f.transport,loadHtml:f.loadHtml,pools:f.pools});
 const recipes=await provider.search('chicken',{signal:new AbortController().signal});
 assert.equal(recipes.length,12);assert.deepEqual(recipes.map(x=>x.sourceUrl),f.hits.slice(0,12).map(x=>x.url));assert.deepEqual(f.stats(),{braveCalls:1,modelCalls:12,sourceCalls:12,maxActive:12});
});
test('collections expand before other search hits and are never returned as cards; source attempts remain bounded',async()=>{
 const f=setup(20);const first=f.hits[0].url;
 const loadHtml=async(url:string)=>url===first?'<main><h1>20 chicken recipes</h1>'+Array.from({length:12},(_,i)=>`<a href="/recipes/child-${i}">Chicken recipe ${i}</a>`).join('')+'</main>':sourceHtml(url,'Child recipe');
 const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',transport:f.transport,loadHtml,pools:f.pools});
 const recipes=await provider.search('family chicken',{signal:new AbortController().signal});
 assert.equal(recipes.length,12);assert.ok(recipes.every(x=>x.sourceUrl!==first));assert.ok(recipes.some(x=>x.sourceUrl.includes('/recipes/child-')));assert.equal(f.stats().modelCalls,12);
});
test('parent abort cancels queued model starts and propagates rather than returning partial success',async()=>{
 const f=setup(12);const controller=new AbortController();let modelCalls=0;
 const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',loadHtml:f.loadHtml,pools:{source:f.pools.source,model:new BoundedPool(1,24)},transport:async(url,init)=>{
  if(String(url).includes('search.brave.com'))return f.transport(url,init);
  modelCalls++;controller.abort(new Error('parent canceled'));throw new Error('aborted');
 }});
 await assert.rejects(provider.search('chicken',{signal:controller.signal}),/parent canceled/);assert.equal(modelCalls,1);
});
test('candidate failure preserves siblings; all technical failures differ from explicit rejection and no source evidence',async()=>{
 const f=setup(2);let model=0;
 const service=(mode:'partial'|'failed'|'rejected')=>createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',loadHtml:f.loadHtml,pools:f.pools,transport:async(url,init)=>{
  if(String(url).includes('search.brave.com'))return f.transport(url,init);
  if(mode==='failed'||mode==='partial'&&++model===1)throw new Error('private failure');
  if(mode==='rejected')return Response.json(response(curated({accepted:false,title:null,summary:null,methodExcerpt:null,ingredientExcerpt:null})));
  return f.transport(url,init);
 }});
 assert.equal((await service('partial').search('chicken',{signal:new AbortController().signal})).length,1);
 await assert.rejects(service('failed').search('chicken',{signal:new AbortController().signal}),/SEARCH_FAILED/);
 assert.deepEqual(await service('rejected').search('chicken',{signal:new AbortController().signal}),[]);
});

test('source ceiling stays at24 across collection expansion and all technical child failures remain errors',async()=>{
 const f=setup(20);let attempts=0;
 const collection='<main><h1>20 chicken recipes</h1>'+Array.from({length:12},(_,i)=>`<a href="/recipes/child-${i}">Chicken recipe ${i}</a>`).join('')+'</main>';
 const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',transport:f.transport,pools:f.pools,loadHtml:async url=>{attempts++;return url===f.hits[0].url?collection:null;}});
 await assert.rejects(provider.search('chicken',{signal:new AbortController().signal}),/SEARCH_FAILED/);
 assert.equal(attempts,24);assert.equal(f.stats().modelCalls,0);
});

test('model pool is shared across concurrent provider instances and completion order cannot reorder sources',async()=>{
 const f=setup(12);const releases:(()=>void)[]=[];let active=0,max=0;
 const transport:typeof fetch=async(url,init)=>{
  if(String(url).includes('search.brave.com'))return f.transport(url,init);
  max=Math.max(max,++active);await new Promise<void>(resolve=>releases.push(resolve));active--;
  const input=JSON.parse(JSON.parse(String(init?.body)).input);return Response.json(response(curated({title:input.source.titles[0]})));
 };
 const first=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',transport,loadHtml:f.loadHtml,pools:f.pools});
 const second=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',transport,loadHtml:f.loadHtml,pools:f.pools});
 const a=first.search('chicken',{signal:new AbortController().signal});const b=second.search('chicken',{signal:new AbortController().signal});
 for(let i=0;i<10;i++)await turn();assert.equal(releases.length,12);assert.equal(max,12);
 releases.splice(0).reverse().forEach(resolve=>resolve());for(let i=0;i<10;i++)await turn();
 assert.equal(releases.length,12);releases.splice(0).reverse().forEach(resolve=>resolve());
 for(const cards of await Promise.all([a,b]))assert.deepEqual(cards.map(x=>x.sourceUrl),f.hits.map(x=>x.url));assert.equal(max,12);
});

test('eight-second curation deadline returns a valid sibling and retains an abort-ignoring active lease',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:100000});
 const f=setup(2),modelPool=new BoundedPool(1,24);let calls=0,slowSignal:AbortSignal|undefined,release!:()=>void;
 const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',loadHtml:f.loadHtml,pools:{source:f.pools.source,model:modelPool},transport:async(url,init)=>{
  if(String(url).includes('search.brave.com'))return f.transport(url,init);
  if(++calls===1)return f.transport(url,init);
  slowSignal=init?.signal??undefined;await new Promise<void>(resolve=>{release=resolve;});return f.transport(url,init);
 }});
 let finished=false;const search=provider.search('chicken',{signal:new AbortController().signal}).then(cards=>{finished=true;return cards;});
 for(let i=0;i<10;i++)await turn();assert.equal(calls,2);
 t.mock.timers.tick(7999);await turn();assert.equal(finished,false);assert.equal(slowSignal?.aborted,false);
 t.mock.timers.tick(1);await turn();assert.equal(finished,true);assert.equal(slowSignal?.aborted,true);
 const cards=await search;assert.deepEqual(cards.map(c=>c.sourceUrl),[f.hits[0].url]);
 let nextStarted=false;const next=modelPool.run(new AbortController().signal,async()=>{nextStarted=true;});
 await turn();assert.equal(nextStarted,false,'timed-out transport still holds its lease');release();await next;
});

test('eight-second budget includes model queue wait and expired queued candidates never start',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:100000});
 const f=setup(1),modelPool=new BoundedPool(1,24);let release!:()=>void;
 const blocker=modelPool.run(new AbortController().signal,()=>new Promise<void>(resolve=>{release=resolve;}));
 const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',transport:f.transport,loadHtml:f.loadHtml,pools:{source:f.pools.source,model:modelPool}});
 const failed=assert.rejects(provider.search('chicken',{signal:new AbortController().signal}),/SEARCH_TIMEOUT/);
 for(let i=0;i<10;i++)await turn();t.mock.timers.tick(8000);await turn();
 assert.equal(f.stats().modelCalls,0);release();await blocker;await failed;await turn();assert.equal(f.stats().modelCalls,0);
});

test('a rejected sibling cannot hide curation expiry, and parent abort cannot return completed siblings',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:100000});
 for(const parentAbort of [false,true]){
  const f=setup(2);let calls=0,release!:()=>void;
  const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',loadHtml:f.loadHtml,pools:f.pools,transport:async(url,init)=>{
   if(String(url).includes('search.brave.com'))return f.transport(url,init);
   if(++calls===1)return parentAbort?f.transport(url,init):Response.json(response(curated({accepted:false,title:null,summary:null,methodExcerpt:null,ingredientExcerpt:null})));
   await new Promise<void>(resolve=>{release=resolve;});return f.transport(url,init);
  }});
  const controller=new AbortController(),handler=createSearchHandler({getProvider:()=>provider});
  let finished=false;
  const pending=handler(new Request('https://local.example.com/api/recipes/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'chicken'}),signal:controller.signal})).then(result=>{finished=true;return result;});
  for(let i=0;i<10;i++)await turn();assert.equal(calls,2);
  if(parentAbort)controller.abort();else t.mock.timers.tick(8000);
  await turn();assert.equal(finished,true,'request must settle at the candidate deadline');const result=await pending;assert.equal(result.status,504);assert.equal((await result.json()).error.code,'SEARCH_TIMEOUT');release();await turn();
 }
});

test('absolute candidate deadline rejects late output and prevents late slot acquisition before timer dispatch',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:100000});
 for(const queued of [false,true]){
  t.mock.timers.setTime(100000);
  const f=setup(1),modelPool=new BoundedPool(1,24);let release:()=>void=()=>{};
  const blocker=queued?modelPool.run(new AbortController().signal,()=>new Promise<void>(resolve=>{release=resolve;})):Promise.resolve();
  const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',loadHtml:f.loadHtml,pools:{source:f.pools.source,model:modelPool},transport:async(url,init)=>{
   if(String(url).includes('search.brave.com'))return f.transport(url,init);
   t.mock.timers.setTime(108001);return f.transport(url,init);
  }});
  const failed=assert.rejects(provider.search('chicken',{signal:new AbortController().signal}),/SEARCH_TIMEOUT/);
  for(let i=0;i<10;i++)await turn();
  if(queued){t.mock.timers.setTime(108001);release();}
  await blocker;await failed;assert.equal(f.stats().modelCalls,queued?0:1);
 }
});

test('eight-second curation expiry cancels pending body and holds lease through cancellation cleanup',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:100000});
 const f=setup(1),modelPool=new BoundedPool(1,24);let cancelStarted=false,finishCancel!:()=>void;
 const body=new ReadableStream<Uint8Array>({start(controller){controller.enqueue(new TextEncoder().encode('{'));},cancel(){cancelStarted=true;return new Promise<void>(resolve=>{finishCancel=resolve;});}});
 const provider=createParallelRecipeProvider({braveKey:'test-only-key',apiKey:'test-only-key',loadHtml:f.loadHtml,pools:{source:f.pools.source,model:modelPool},transport:async(url,init)=>String(url).includes('search.brave.com')?f.transport(url,init):new Response(body)});
 const failed=assert.rejects(provider.search('chicken',{signal:new AbortController().signal}),/SEARCH_TIMEOUT/);
 for(let i=0;i<10;i++)await turn();t.mock.timers.tick(8000);await turn();assert.equal(cancelStarted,true);await failed;
 let nextStarted=false;const next=modelPool.run(new AbortController().signal,async()=>{nextStarted=true;});
 await turn();assert.equal(nextStarted,false);finishCancel();await next;
});
