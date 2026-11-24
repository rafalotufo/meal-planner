import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { testDatabase } from '../family/database.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';
import { connectDatabase, openDatabase } from '../../lib/db/connection.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';
test('weekly schema constraints, exact runtime privileges and disposable rollback', async()=>{
 const fixture=await restrictedMenuDatabase();const db=await fixture.open();const runtime=await openDatabase(fixture.runtimeUrl);
 try{
  const family=randomUUID(),id=randomUUID();await db.execute('INSERT INTO families VALUES ($1,$2)',[family,1]);
  const meals=JSON.stringify(Array(7).fill({title:'Dinner',summary:'Cook.',sourceUrl:'https://example.test/',imageUrl:null,time:null}));
  const insert=(week:string,revision:number,status:string,finalizedAt:number|null,content=meals)=>runtime.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,revision,status,meals,created_at,finalized_at) VALUES ($1,$2,$3,$4,$5,$6,1,$7)',[randomUUID(),family,week,revision,status,content,finalizedAt]);
  await runtime.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,meals,created_at) VALUES ($1,$2,$3,$4,1)',[id,family,'2026-11-29',meals]);
  await assert.rejects(insert('2026-11-29',1,'draft',null),{code:'23505'});
  for(const args of [['2026-11-30',1,'draft',null],['2026-12-06',0,'draft',null],['2026-12-06',1,'final',null],['2026-12-06',1,'draft',2],['2026-12-06',1,'draft',null,'[]']] as const) await assert.rejects(insert(args[0],args[1],args[2],args[3],args[4]));
  await runtime.execute('UPDATE meal_plan_weeks SET revision=revision WHERE id=$1',[id]);
  for(const sql of ['DELETE FROM meal_plan_weeks','TRUNCATE meal_plan_weeks','DELETE FROM meal_plan_suggestions','CREATE TABLE denied_weekly (id text)',"UPDATE __drizzle_migrations SET hash='bad'"]) await assert.rejects(runtime.execute(sql),{code:'42501'});
 }finally{await runtime.close();await db.close();await fixture.cleanup();}
 const rollback=await testDatabase();const owner=connectDatabase(rollback.url);
 try{await owner.execute(await readFile('drizzle/postgresql/rollback-unique-plans-test.sql','utf8'));await owner.execute(await readFile('drizzle/postgresql/rollback-plans-test.sql','utf8'));await owner.execute(await readFile('drizzle/postgresql/rollback-menu-test.sql','utf8'));await owner.execute(await readFile('drizzle/postgresql/rollback-initial.sql','utf8'));assert.deepEqual(await owner.all("SELECT tablename FROM pg_tables WHERE schemaname='public'"),[]);await migrateDatabase(rollback.url);}
 finally{await owner.close();await rollback.cleanup();}
});

async function legacyFixture() {
 const {readMigrationFiles}=await import('drizzle-orm/migrator');
 const fixture=await testDatabase(false),db=connectDatabase(fixture.url);
 await db.transaction(async tx=>{
  await tx.execute('CREATE TABLE __drizzle_migrations (id integer PRIMARY KEY,hash text NOT NULL,created_at bigint NOT NULL)');
  for(const [index,migration] of readMigrationFiles({migrationsFolder:'drizzle/postgresql'}).slice(0,3).entries()) {for(const sql of migration.sql)await tx.execute(sql);await tx.execute('INSERT INTO __drizzle_migrations VALUES ($1,$2,$3)',[index,migration.hash,migration.folderMillis]);}
 });
 return {fixture,db};
}
const snapshot=(name:string,title=name)=>({title,summary:'Retained snapshot.',sourceUrl:`https://example.test/${name}`,imageUrl:null,time:null});

test('fourth migration locks before table access and compacts only duplicate drafts with deterministic collision-safe proposal remapping',async()=>{
 const {fixture,db}=await legacyFixture();
 try{
  const sql=await readFile('drizzle/postgresql/0003_unique_weekly_recipes.sql','utf8');
  assert.match(sql.split('--> statement-breakpoint')[0].trim(),/^SELECT pg_advisory_xact_lock\(73462901\);$/);
  const family=randomUUID(),foreign=randomUUID(),user=randomUUID(),other=randomUUID();
  for(const id of [family,foreign])await db.execute('INSERT INTO families VALUES ($1,1)',[id]);
  for(const [id,subject] of [[user,'repair-owner'],[other,'repair-other']])await db.execute('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at) VALUES ($1,$2,$3,$4,1)',[id,subject,subject+'@gmail.com',family]);
  const duplicate=randomUUID(),unique=randomUUID(),final=randomUUID(),foreignPlan=randomUUID();
  const original=[snapshot('a','First A'),snapshot('a','Later A'),snapshot('b'),{...snapshot('c'),sourceUrl:'https://foo_bar.example/recipe'},snapshot('b','Later B'),snapshot('a'),snapshot('d')];
  const seven=Array.from({length:7},(_,n)=>snapshot('unique-'+n));
  for(const [id,owner,status,meals,revision,week] of [[duplicate,family,'draft',original,5,'2026-11-29'],[unique,family,'draft',seven,6,'2026-12-06'],[final,family,'final',original,7,'2026-11-22'],[foreignPlan,foreign,'draft',seven,2,'2026-11-29']] as const) await db.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,revision,status,meals,created_at,finalized_at) VALUES ($1,$2,$3,$4,$5,$6,10,$7)',[id,owner,week,revision,status,JSON.stringify(meals),status==='final'?20:null]);
  for(const [id,revision] of [[duplicate,5],[unique,6],[final,7]] as const)await db.execute('INSERT INTO meal_plan_approvals VALUES ($1,$2,$3,11)',[id,user,revision]);
  const insertProposal=async(id:string,slot:number,created:number,revision=5,status='pending',author=user,plan=duplicate)=>db.execute('INSERT INTO meal_plan_suggestions (id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,plan,author,revision,slot,randomUUID(),JSON.stringify(snapshot('replacement')),status,created]);
  const loser=randomUUID(),winner=randomUUID(),retained=randomUUID(),old=randomUUID(),resolved=randomUUID();
  await insertProposal(loser,0,20);await insertProposal(winner,1,10);await insertProposal(retained,6,30);await insertProposal(old,4,1,4);await insertProposal(resolved,1,1,5,'rejected');
  const tieWinner='00000000-0000-0000-0000-000000000001',tieLoser='00000000-0000-0000-0000-000000000002';
  await insertProposal(tieWinner,2,15);await insertProposal(tieLoser,4,15);await insertProposal(randomUUID(),1,9,5,'pending',other);
  await insertProposal(randomUUID(),1,8,6,'pending',user,unique);
  const beforeWeeks=await db.all<{id:string}>('SELECT * FROM meal_plan_weeks ORDER BY id');
  const beforeProposals=await db.all<{id:string;plan_id:string}>('SELECT * FROM meal_plan_suggestions ORDER BY id');
  const beforeApprovals=await db.all('SELECT * FROM meal_plan_approvals WHERE plan_id<>$1 ORDER BY plan_id',[duplicate]);
  await migrateDatabase(fixture.url);
  const repaired=await db.one<{meals:unknown;revision:number}>('SELECT meals,revision FROM meal_plan_weeks WHERE id=$1',[duplicate]);
  assert.deepEqual(repaired,{meals:[original[0],original[2],original[3],original[6]],revision:6});
  for(const row of beforeWeeks.filter(row=>row.id!==duplicate))assert.deepEqual(await db.one('SELECT * FROM meal_plan_weeks WHERE id=$1',[row.id]),row);
  for(const [id,newIndex] of [[winner,0],[tieWinner,1],[retained,3]] as const){const before=beforeProposals.find(row=>row.id===id)!;assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[id]),{...before,day_index:newIndex,base_revision:6});}
  for(const id of [loser,tieLoser])assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[id]),{...beforeProposals.find(row=>row.id===id),status:'stale'});
  for(const id of [old,resolved])assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[id]),beforeProposals.find(row=>row.id===id));
  for(const row of beforeProposals.filter(row=>row.plan_id!==duplicate))assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[row.id]),row,'unique draft pending proposal untouched');
  assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM meal_plan_approvals WHERE plan_id=$1',[duplicate]))?.n,0);
  assert.deepEqual(await db.all('SELECT * FROM meal_plan_approvals WHERE plan_id<>$1 ORDER BY plan_id',[duplicate]),beforeApprovals);
  const after=await db.all('SELECT * FROM meal_plan_weeks ORDER BY id');await migrateDatabase(fixture.url);assert.deepEqual(await db.all('SELECT * FROM meal_plan_weeks ORDER BY id'),after);
  const runtime=await openDatabase(fixture.url);await runtime.close();assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM __drizzle_migrations'))?.n,4);
  await assert.rejects(db.execute(await readFile('drizzle/postgresql/rollback-unique-plans-test.sql','utf8')));
  assert.deepEqual(await db.all('SELECT * FROM meal_plan_weeks ORDER BY id'),after,'incompatible rollback never pads or deletes');
 }finally{await db.close();await fixture.cleanup();}
});

test('fourth migration malformed-source or revision overflow rolls back repair/schema/history atomically',async()=>{
 for(const bad of ['missing','overflow']){
  const {fixture,db}=await legacyFixture();try{
   const family=randomUUID(),id=randomUUID();await db.execute('INSERT INTO families VALUES ($1,1)',[family]);const meals=Array(7).fill(snapshot('duplicate'));if(bad==='missing')meals[3]={...snapshot('bad'),sourceUrl:''};
   await db.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,revision,meals,created_at) VALUES ($1,$2,$3,$4,$5,1)',[id,family,'2026-11-29',bad==='overflow'?2147483647:1,JSON.stringify(meals)]);
   const before=await db.one('SELECT * FROM meal_plan_weeks WHERE id=$1',[id]);await assert.rejects(migrateDatabase(fixture.url));assert.deepEqual(await db.one('SELECT * FROM meal_plan_weeks WHERE id=$1',[id]),before);assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM __drizzle_migrations'))?.n,3);
  }finally{await db.close();await fixture.cleanup();}
 }
});
