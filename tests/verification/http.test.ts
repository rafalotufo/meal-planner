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
