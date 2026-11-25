import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, writeFile, rm, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadHostedInput } from './hosted-browser.ts';
test('hosted helper validates private exact inputs without starting a browser or network',async()=>{
 const dir=await realpath(await mkdtemp(join(tmpdir(),'mp-hosted-input-'))),input=join(dir,'input.json'),handoff=join(dir,'handoff.json');
 try{
  await writeFile(handoff,JSON.stringify({runId:'11111111-1111-4111-8111-111111111111',familyId:'22222222-2222-4222-8222-222222222222',expiresAt:Date.now()+1800000,members:[{memberId:'33333333-3333-4333-8333-333333333333',capability:'a'.repeat(43)}]}),{mode:0o600});
  await writeFile(input,JSON.stringify({shareableUrl:'https://meal-planner-staging-rafalotufos.vercel.app/?_vercel_share=fixture',handoffPath:handoff}),{mode:0o600});
  assert.equal((await loadHostedInput(input,'390')).width,390);
  await assert.rejects(loadHostedInput(input,'768'));
  await writeFile(input,JSON.stringify({shareableUrl:'https://evil.example/?_vercel_share=fixture',handoffPath:handoff}));await assert.rejects(loadHostedInput(input,'390'));
  await writeFile(input,JSON.stringify({shareableUrl:'https://meal-planner-staging-rafalotufos.vercel.app/',handoffPath:handoff,unexpected:'secret'}));await assert.rejects(loadHostedInput(input,'390'));
  await writeFile(input,JSON.stringify({shareableUrl:'https://meal-planner-staging-rafalotufos.vercel.app/',handoffPath:handoff}));await chmod(handoff,0o644);await assert.rejects(loadHostedInput(input,'1440'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('hosted status observation handles native redirect responses without retaining private URLs',async()=>{
 const {observeHostedResponse,settleHostedNetworkLogs}=await import('./hosted-browser.ts');
 const observed={expectedSession401:false,expectedLogoutLogs:0,expectedPlatformCspFailures:0,pendingNetworkLogs:[{origin:'canonical',path:'session',logout:true}],exchangeCount:1,exchangeStatus:null,nativeOrigin:true,entrySameOriginPolicy:true,logoutStatus:null,bootstrapStatus:null,platformAssetsBlocked:0,forbiddenRequests:0,browserErrors:0,browserVersion:'unobserved',errorCategories:{},httpFailures:[],csp:[]};
 observeHostedResponse({method:'Network.requestWillBeSent',params:{redirectResponse:{url:'https://meal-planner-staging-rafalotufos.vercel.app/api/verification/session',status:303}}},observed,false);
 assert.equal(observed.exchangeStatus,303);
 observeHostedResponse({method:'Network.responseReceived',params:{response:{url:'https://meal-planner-staging-rafalotufos.vercel.app/api/session',status:401}}},observed,true);
 assert.equal(observed.browserErrors,0);assert.equal(observed.expectedSession401,true);
 settleHostedNetworkLogs(observed);assert.equal(observed.expectedLogoutLogs,1);assert.equal(observed.browserErrors,0);
 observed.expectedSession401=false;observed.pendingNetworkLogs.push({origin:'canonical',path:'session',logout:true});settleHostedNetworkLogs(observed);assert.equal(observed.browserErrors,1);
 settleHostedNetworkLogs(observed);assert.equal(observed.browserErrors,1);
});
test('only request-correlated known platform script CSP failures and exact observed logout401 logs are expected',async()=>{
 const {HostedNetworkDiagnostics,expectedLogoutNetworkLog}=await import('./hosted-browser.ts');const tracker=new HostedNetworkDiagnostics();
 assert.equal(tracker.expectedCspFailure('missing','csp'),false);
 tracker.observe('platform','https://vercel.live/_next-live/feedback.js','Script');assert.equal(tracker.expectedCspFailure('platform','csp'),true);
 tracker.observe('canonical','https://meal-planner-staging-rafalotufos.vercel.app/_next/app.js','Script');assert.equal(tracker.expectedCspFailure('canonical','csp'),false);
 tracker.observe('lookalike','https://vercel.live.evil.example/a.js','Script');assert.equal(tracker.expectedCspFailure('lookalike','csp'),false);
 tracker.observe('document','https://vercel.live/','Document');assert.equal(tracker.expectedCspFailure('document','csp'),false);
 tracker.observe('transport','https://vercel.live/a.js','Script');assert.equal(tracker.expectedCspFailure('transport','other'),false);
 assert.equal(expectedLogoutNetworkLog({origin:'canonical',path:'session',logout:true},true),true);
 for(const log of [{origin:'other',path:'session',logout:true},{origin:'canonical',path:'other',logout:true},{origin:'canonical',path:'session',logout:false}])assert.equal(expectedLogoutNetworkLog(log,true),false);
 assert.equal(expectedLogoutNetworkLog({origin:'canonical',path:'session',logout:true},false),false);
});
