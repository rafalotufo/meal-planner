import assert from 'node:assert/strict';
import test from 'node:test';
import { discoverRecipes, discoveryQuery } from '../lib/recipes/brave.js';

test('Brave discovery makes one bounded exact endpoint call, deduplicates and filters unsafe URLs', async () => {
  let calls = 0;
  const transport: typeof fetch = async (url, init) => {
    calls++; const endpoint = new URL(String(url));
    assert.equal(endpoint.origin + endpoint.pathname, 'https://api.search.brave.com/res/v1/web/search');
    assert.equal(endpoint.searchParams.get('count'), '20');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('X-Subscription-Token'), 'test-only-key');
    return Response.json({ web: { results: [{url:'https://recipes.example.com/a#top',title:'A'}, {url:'https://recipes.example.com/a',title:'A'}, {url:'http://private.local/a',title:'Unsafe'}, {url:'https://recipes.example.com/b',title:'B'}] } });
  };
  assert.deepEqual((await discoverRecipes('chicken', {apiKey:'test-only-key',transport,signal:new AbortController().signal})).map(x=>x.url), ['https://recipes.example.com/a','https://recipes.example.com/b']);
  assert.equal(calls, 1);
});

test('Brave limits discovery query without malformed Unicode and rejects malformed/oversize/aborted responses', async () => {
  for(const query of ['a '.repeat(500), '😀'.repeat(500)]) {
    const q=discoveryQuery(query);assert.ok(q.length<=600 && q.split(/\s+/).length<=75 && Buffer.from(q).toString('utf8')===q);
  }
  for(const response of [Response.json({wrong:true}), new Response('x'.repeat(1048577))]) {
    await assert.rejects(discoverRecipes('chicken',{apiKey:'test-only-key',transport:async()=>response,signal:new AbortController().signal}),/SEARCH_FAILED/);
  }
  const controller=new AbortController();controller.abort(new Error('parent abort'));
  let calls=0;
  await assert.rejects(discoverRecipes('chicken',{apiKey:'test-only-key',transport:async()=>{calls++;return Response.json({web:{results:[]}});},signal:controller.signal}),/parent abort/);
  assert.equal(calls,0);
});

test('non-success provider response cancels its body before releasing the operation', async () => {
  let canceled=false;
  const body=new ReadableStream<Uint8Array>({cancel(){canceled=true;}});
  await assert.rejects(discoverRecipes('chicken',{apiKey:'test-only-key',transport:async()=>new Response(body,{status:503}),signal:new AbortController().signal}),/SEARCH_FAILED/);
  assert.equal(canceled,true);
});
