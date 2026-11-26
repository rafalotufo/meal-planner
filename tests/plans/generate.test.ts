import assert from 'node:assert/strict';
import { test } from 'node:test';
import { provisionFamily } from '../../lib/family-store.ts';
import { saveMenuRecipe, removeMenuRecipe } from '../../lib/menu/store.ts';
import { generateDuePlans } from '../../lib/plans/generate.ts';
import { readPlans, actOnPlan } from '../../lib/plans/store.ts';
import { testDatabase } from '../family/database.ts';

const identity = { googleSubject: 'weekly-generator', email: 'weekly.generator@gmail.com', emailVerified: true as const };
const recipe = (n: number) => ({ title: `Dinner ${n}`, summary: 'Cook dinner.', sourceUrl: `https://example.test/dinner/${n}`, imageUrl: null, time: null });
test('due scheduler skips empty/ineligible families, concurrent retries preserve drafts and finalized recency avoids the prior seven', async () => {
  const fixture = await testDatabase(); const db = await fixture.open(); const allowed = [identity.email];
  try {
    await provisionFamily(db, identity, allowed, false);
    assert.equal((await generateDuePlans(db, allowed, 'Thursday', new Date('2026-11-26T13:59:00Z'))).skipped, true);
    assert.equal((await generateDuePlans(db, allowed, 'Thursday', new Date('2026-11-26T14:00:00Z'))).empty, 1);
    for (let n = 0; n < 14; n++) await saveMenuRecipe(db, identity, allowed, recipe(n));
    const runs = await Promise.all(Array.from({ length: 3 }, () => generateDuePlans(db, allowed, 'Thursday', new Date('2026-11-26T14:00:00Z'))));
    assert.equal(runs.reduce((n, result) => n + result.created, 0), 1);
    const first = (await readPlans(db, identity, allowed, {}, new Date('2026-11-26T14:00:00Z'))).plan!;
    assert.equal(new Set(first.meals.map(meal => meal.sourceUrl)).size, 7);
    await actOnPlan(db, identity, allowed, first.id, { action: 'finalize', revision: 1 }, new Date('2026-11-26T14:00:00Z'));
    const menu = (await readPlans(db, identity, allowed, {}, new Date('2026-11-26T14:00:00Z'))).menu.entries;
    for (const entry of menu.filter(entry => first.meals.some(meal => meal.sourceUrl === entry.recipe.sourceUrl))) { await removeMenuRecipe(db, identity, allowed, entry.id); await saveMenuRecipe(db, identity, allowed, entry.recipe); }
    await generateDuePlans(db, allowed, 'Thursday', new Date('2026-12-03T14:00:00Z'));
    const next = (await readPlans(db, identity, allowed, {}, new Date('2026-12-03T14:00:00Z'))).plan!;
    assert.equal(next.weekStart, '2026-12-06');
    assert.equal(next.meals.filter(meal => first.meals.some(old => old.sourceUrl === meal.sourceUrl)).length, 0);
    assert.deepEqual((await readPlans(db, identity, allowed, { week: first.weekStart })).plan?.meals, first.meals);
    await assert.rejects(generateDuePlans(db, ['invalid'], 'Thursday', new Date('2026-12-10T14:00:00Z')));
    assert.equal((await generateDuePlans(db, [], 'Thursday', new Date('2026-12-10T14:00:00Z'))).ineligible, 1);
  } finally { await db.close(); await fixture.cleanup(); }
});
test('one recipe appears once and its snapshot survives removal', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, [identity.email], false);
    const saved = await saveMenuRecipe(db, identity, [identity.email], recipe(1));
    await generateDuePlans(db, [identity.email], 'Thursday', new Date('2026-11-26T14:00:00Z'));
    await removeMenuRecipe(db, identity, [identity.email], saved.entry.id);
    const view = await readPlans(db, identity, [identity.email], {}, new Date('2026-11-26T14:00:00Z'));
    assert.deepEqual(view.plan?.meals, [recipe(1)]);
  } finally { await db.close(); await fixture.cleanup(); }
});

test('CLI rejects invalid configuration/overrides and unavailable credentials without exposing their values',async()=>{
 const {spawnSync}=await import('node:child_process');
 for(const [args,extra] of [[[],{MEAL_PLAN_DRAFT_DAY:''}],[['--date=2026-11-26'],{}],[[],{DATABASE_URL:'not-a-valid-database-url-sensitive-fixture-password',MEAL_PLAN_DRAFT_DAY:'Thursday'}]] as const){
  const child=spawnSync(process.execPath,['--import','tsx','scripts/generate-meal-plans.ts',...args],{env:{...process.env,...extra,OPENAI_API_KEY:''},encoding:'utf8'});
  assert.equal(child.status,1);assert.equal(child.stdout,'');assert.equal(child.stderr.trim(),'Meal planning failed; no credentials printed.');assert.doesNotMatch(child.stderr,/sensitive|fixture-password|postgresql:/);
 }
});


test('off-day CLI succeeds without connecting to a valid unreachable database URL',async()=>{
 const {spawnSync}=await import('node:child_process');const {torontoClock,weekdays}=await import('../../lib/plans/calendar.ts');
 const local=torontoClock(new Date());const offday=weekdays[(weekdays.indexOf(local.day)+1)%7];
 const child=spawnSync(process.execPath,['--import','tsx','scripts/generate-meal-plans.ts'],{env:{...process.env,MEAL_PLAN_DRAFT_DAY:offday,DATABASE_URL:'postgresql://sensitive:fixture-password@127.0.0.1:1/unavailable',OPENAI_API_KEY:''},encoding:'utf8'});
 assert.equal(child.status,0);assert.equal(child.stderr,'');assert.deepEqual(JSON.parse(child.stdout),{skipped:true,created:0,existing:0,empty:0,ineligible:0});
});


test('menu sizes1/2/6/7/8 produce only available distinct recipes without cycling',async()=>{
 for(const count of [1,2,6,7,8]){
  const fixture=await testDatabase();const db=await fixture.open();
  try{await provisionFamily(db,identity,[identity.email],false);for(let n=0;n<count;n++)await saveMenuRecipe(db,identity,[identity.email],recipe(n));await generateDuePlans(db,[identity.email],'Thursday',new Date('2026-11-26T14:00:00Z'));const view=await readPlans(db,identity,[identity.email],{},new Date('2026-11-26T14:00:00Z'));assert.equal(view.plan?.meals.length,Math.min(7,count));assert.equal(new Set(view.plan!.meals.map(meal=>meal.sourceUrl)).size,Math.min(7,count));}finally{await db.close();await fixture.cleanup();}
 }
});

test('deadline-owned generation rolls back a blocked transaction without late writes', async () => {
  const fixture = await testDatabase(); const db = await fixture.open(); const blocker = await fixture.open();
  let unlock: () => void = () => {}; let locked: () => void = () => {};
  const ready = new Promise<void>(resolve => { locked = resolve; });
  const release = new Promise<void>(resolve => { unlock = resolve; });
  let holding: Promise<void> | undefined;
  try {
    await provisionFamily(db, identity, [identity.email], false); await saveMenuRecipe(db, identity, [identity.email], recipe(1));
    holding = blocker.transaction(async () => { locked(); await release; }); await ready;
    await assert.rejects(generateDuePlans(db, [identity.email], 'Wednesday', new Date('2026-11-25T14:00:00Z'), { deadline: Date.now() + 150 }));
    unlock(); await holding;
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM meal_plan_weeks'))?.n, 0);
  } finally { unlock(); await holding; await blocker.close(); await db.close(); await fixture.cleanup(); }
});
test('abort waits for the current family transaction and never advances to the next family', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  const controller = new AbortController(); const allowed = ['weekly.abort0@gmail.com', 'weekly.abort1@gmail.com'];
  try {
    for (let n = 0; n < 2; n++) {
      const member = { ...identity, googleSubject: identity.googleSubject + n, email: allowed[n] };
      await provisionFamily(db, member, allowed, false); await saveMenuRecipe(db, member, allowed, recipe(n));
    }
    const transaction = db.verificationTransaction.bind(db);
    db.verificationTransaction = async (deadline, action) => {
      const result = await transaction(deadline, action); controller.abort(); return result;
    };
    await assert.rejects(generateDuePlans(db, allowed, 'Wednesday', new Date('2026-11-25T14:00:00Z'), { deadline: Date.now() + 5000, signal: controller.signal }));
    assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM meal_plan_weeks'))?.n, 1, 'one settled transaction is preserved; second family never starts');
  } finally { await db.close(); await fixture.cleanup(); }
});
