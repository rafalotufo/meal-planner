import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as turn } from 'node:timers/promises';
import { createParallelRecipeProvider } from '../lib/recipes/parallel-search.js';
import { BoundedPool } from '../lib/recipes/concurrency.js';
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
