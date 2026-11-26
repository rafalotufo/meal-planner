import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verificationFixture } from './database.ts';
import { verificationApiResponse } from '../../lib/verification/http.ts';
import { createNonce, NONCE_COOKIE } from '../../lib/verification/cookies.ts';
test('native form exchange enforces nonce, method, canonical host and returns only a server-set cookie', async()=>{
 const f=await verificationFixture(); const secret='x'.repeat(32), nonce=createNonce(secret);
 const deps={origin:f.target.origin,secret,target:f.target,db:async()=>f.db,allowed:[]};
 const make=(body:string,headers:Record<string,string>={})=>new Request(`${f.target.origin}/api/verification/session`,{method:'POST',headers:{host:new URL(f.target.origin).host,origin:f.target.origin,'content-type':'application/x-www-form-urlencoded',cookie:`${NONCE_COOKIE}=${nonce}`,...headers},body});
 try {
  const invalid=await verificationApiResponse(make(new URLSearchParams({runId:f.runId,capability:f.capability,nonce:'wrong'}).toString()),deps);assert.equal(invalid.status,403);
  const wrongHost=await verificationApiResponse(make('',{host:'evil.test'}),deps);assert.equal(wrongHost.status,421);assert.ok(wrongHost.headers.get('content-security-policy'));
  const unsupported=await verificationApiResponse(new Request(`${f.target.origin}/api/verification/session`,{headers:{host:new URL(f.target.origin).host}}),deps);assert.equal(unsupported.status,405);assert.equal(unsupported.headers.get('allow'),'POST');
  const response=await verificationApiResponse(make(new URLSearchParams({runId:f.runId,capability:f.capability,nonce}).toString()),deps);
  assert.equal(response.status,303);assert.equal(response.headers.get('location'),`${f.target.origin}/`);assert.match(response.headers.get('set-cookie')??'',/__Host-mp-verification=.*Secure; HttpOnly/);assert.equal((await response.text()).includes(f.capability),false);
  const replay=await verificationApiResponse(make(new URLSearchParams({runId:f.runId,capability:f.capability,nonce}).toString()),deps);assert.equal(replay.status,401);
 } finally{await f.close();}
});
test('malformed UTF-8 form bytes are a bounded client error, never a storage failure',async()=>{
 const f=await verificationFixture();try{
  const response=await verificationApiResponse(new Request(`${f.target.origin}/api/verification/session`,{method:'POST',headers:{host:new URL(f.target.origin).host,origin:f.target.origin,'content-type':'application/x-www-form-urlencoded'},body:new Uint8Array([255])}),{origin:f.target.origin,secret:'x'.repeat(32),target:f.target,db:async()=>f.db,allowed:[]});
  assert.equal(response.status,400);assert.equal((await f.db.one<{n:number}>('SELECT count(*)::integer AS n FROM verification_sessions'))?.n,0);
 }finally{await f.close();}
});


test('real protected category edit denies verification identity while category snapshots stay permitted', { timeout:240000 }, async () => {
 const {startVerificationServer}=await import('./server.ts');
 const {VERIFICATION_COOKIE}=await import('../../lib/verification/cookies.ts');
 const f=await startVerificationServer();
 try {
  const entry=await f.request('/verification');assert.equal(entry.status,200);
  const noncePair=entry.headers['set-cookie']?.find(value=>value.startsWith(`${NONCE_COOKIE}=`))?.split(';')[0];assert.ok(noncePair);
  const nonce=noncePair.slice(NONCE_COOKIE.length+1);
  const login=await f.request('/api/verification/session',{method:'POST',headers:{Origin:f.origin,'Content-Type':'application/x-www-form-urlencoded',Cookie:noncePair},body:new URLSearchParams({runId:f.run.runId,capability:f.run.members[0].capability,nonce}).toString()});assert.equal(login.status,303);
  const cookie=login.headers['set-cookie']?.find(value=>value.startsWith(`${VERIFICATION_COOKIE}=`))?.split(';')[0];assert.ok(cookie);
  const headers={Origin:f.origin,'Content-Type':'application/json',Cookie:cookie};
  const saved=await f.request('/api/menu',{method:'POST',headers,body:JSON.stringify({title:'Dinner',sourceUrl:'https://example.test/synthetic-category',imageUrl:null,summary:'Cook dinner.',time:null,category:'main'})});assert.equal(saved.status,200);
  const result=JSON.parse(saved.body);assert.equal(result.entry.recipe.category,'main');
  const denied=await f.request('/api/menu?category=update',{method:'POST',headers,body:JSON.stringify({id:result.entry.id,category:'veggie'})});
  assert.equal(denied.status,403);assert.deepEqual(JSON.parse(denied.body),{error:'Forbidden'});assert.match(denied.headers['cache-control']??'',/private.*no-store/);assert.ok(denied.headers['content-security-policy']);
  assert.equal((await f.ownerDb.one<{category:string}>('SELECT category FROM menu_recipes WHERE id=$1',[result.entry.id]))?.category,'main');
  const menu=await f.request('/menu',{headers:{Cookie:cookie}});assert.equal(menu.status,200);assert.equal(menu.body.includes('Save category'),false);assert.match(menu.body,/Main dish/);
 }finally{await f.stop();}
});
