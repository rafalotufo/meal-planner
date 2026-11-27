import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';
import { post } from '../family/http.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';
import { generateDuePlans } from '../../lib/plans/generate.ts';
import { torontoClock, weekdays } from '../../lib/plans/calendar.ts';

test('protected weekly HTTP rechecks identity/family, exact unions, stale edits, origins and read-only methods', async()=>{
 const fixture=await restrictedMenuDatabase();const db=await fixture.open();let server:Awaited<ReturnType<typeof startServer>>|undefined;
 try{
  server=await startServer({DATABASE_URL:fixture.runtimeUrl},true);const jar=new CookieJar();await signInWithGoogle(server.origin,jar);await provision(server.origin,jar);
  const saved=await post(server.origin,jar,'/api/menu',{category:'main',title:'Weekly dinner',sourceUrl:'https://example.test/weekly',imageUrl:null,summary:'Cook dinner.',time:null});assert.equal(saved.status,200);
  const local=torontoClock(new Date());const due=new Date(local.date+'T23:00:00Z');
  await generateDuePlans(db,['fixture.owner@gmail.com'],weekdays[weekdays.indexOf(local.day)],due);
  // Fixture email is intentionally resolved from the persisted verified callback.
  if(!(await db.one('SELECT id FROM meal_plan_weeks'))){const user=await db.one<{email:string}>('SELECT verified_email AS email FROM app_users LIMIT 1');assert.ok(user);await generateDuePlans(db,[user.email],local.day,due);}
  const plan=await db.one<{id:string}>('SELECT id FROM meal_plan_weeks');assert.ok(plan);const path='/api/plans/'+plan.id;
  const ok=await post(server.origin,jar,path,{action:'approve',revision:1});assert.equal(ok.status,200);assert.deepEqual(await ok.json(),{ok:true});
  assert.match(ok.headers.get('cache-control')??'',/private.*no-store/);assert.equal(ok.headers.get('x-frame-options'),'DENY');
  for(const body of [{action:'approve'},{action:'approve',revision:1,extra:true},{action:'suggest',revision:1,day:8,menuRecipeId:plan.id}])assert.equal((await post(server.origin,jar,path,body)).status,400);
  assert.equal((await post(server.origin,jar,path,{action:'approve',revision:2})).status,409);
  const extra=await (await post(server.origin,jar,'/api/menu',{category:'main',title:'Other saved dinner',sourceUrl:'https://example.test/extra-unused',imageUrl:null,summary:'Cook it.',time:null})).json();
  assert.equal((await post(server.origin,jar,path,{action:'suggest',revision:1,day:1,menuRecipeId:extra.entry.id})).status,400,'slot index follows actual one-card plan');
  const original=await db.one<{id:string}>('SELECT id FROM menu_recipes WHERE source_url=$1',['https://example.test/weekly']);assert.ok(original);
  const duplicate=await post(server.origin,jar,path,{action:'suggest',revision:1,day:0,menuRecipeId:original.id});assert.equal(duplicate.status,409);assert.match((await duplicate.json()).error,/already in this plan/);

  assert.equal((await post(server.origin,new CookieJar(),path,{action:'approve',revision:1})).status,401);
  const pending=new CookieJar();await signInWithGoogle(server.origin,pending,'second-member');assert.equal((await post(server.origin,pending,path,{action:'approve',revision:1})).status,403);
  await provision(server.origin,pending);assert.equal((await post(server.origin,pending,path,{action:'approve',revision:1})).status,404);
  assert.equal((await jar.request(server.origin,path,{method:'POST',headers:{Origin:'https://attacker.test','Content-Type':'application/json'},body:JSON.stringify({action:'approve',revision:1})})).status,403);
  for(const method of ['GET','HEAD','PUT','PATCH','DELETE','OPTIONS']){const response=await jar.request(server.origin,path,{method});assert.equal(response.status,405,method);assert.equal(response.headers.get('allow'),'POST');assert.equal(response.headers.get('x-frame-options'),'DENY');assert.equal((await new CookieJar().request(server.origin,path,{method})).status,401);}
  for(const query of ['?week=2026-11-30','?week=2026-11-29&week=2026-12-06','?familyId=forged']){const response=await jar.request(server.origin,'/plans'+query);assert.equal(response.status,200);assert.match(await response.text(),/This plan page is invalid/);}
  const snapshots=Array.from({length:8},(_,n)=>({title:'Planned '+n,sourceUrl:'https://example.test/planned/'+n,imageUrl:null,summary:'Cook it.',time:null,category:n<4?'main':n<6?'side':'veggie'}));
  await db.execute('UPDATE meal_plan_weeks SET meals=$1 WHERE id=$2',[JSON.stringify(snapshots),plan.id]);
  assert.equal((await post(server.origin,jar,path,{action:'suggest',revision:1,day:7,menuRecipeId:extra.entry.id})).status,409,'eighth veggie slot rejects main replacement');
  const veggie=await (await post(server.origin,jar,'/api/menu',{...snapshots[7],title:'New veggie',sourceUrl:'https://example.test/extra-veggie'})).json();
  assert.equal((await post(server.origin,jar,path,{action:'suggest',revision:1,day:7,menuRecipeId:veggie.entry.id})).status,200);
  const suggestion=await db.one<{id:string}>('SELECT id FROM meal_plan_suggestions WHERE plan_id=$1',[plan.id]);assert.ok(suggestion);
  assert.equal((await post(server.origin,jar,path,{action:'accept',revision:1,suggestionId:suggestion.id})).status,200);
  assert.equal((await post(server.origin,jar,path,{action:'approve',revision:2})).status,200);
  assert.equal((await post(server.origin,jar,path,{action:'finalize',revision:2})).status,200);
  assert.equal((await post(server.origin,jar,path,{action:'approve',revision:1})).status,409);
  assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM meal_plan_weeks'))?.n,1);
  const legacy=Array(7).fill({title:'Weekly dinner',sourceUrl:'https://example.test/weekly',imageUrl:null,summary:'Cook dinner.',time:null});
  await db.execute('UPDATE meal_plan_weeks SET meals=$1 WHERE id=$2',[JSON.stringify(legacy),plan.id]);
  const history=await jar.request(server.origin,'/plans');const html=await history.text();assert.equal(history.status,200);assert.match(html,/older finalized plan contained repeated recipes/);assert.match(html,/1 recipe for the week/);assert.deepEqual((await db.one<{meals:unknown}>('SELECT meals FROM meal_plan_weeks WHERE id=$1',[plan.id]))?.meals,legacy);

 }finally{await server?.stop();await db.close();await fixture.cleanup();}
});
