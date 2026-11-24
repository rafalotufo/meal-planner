import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { provisionFamily } from '../../lib/family-store.ts';
import { saveMenuRecipe, removeMenuRecipe } from '../../lib/menu/store.ts';
import { generateDuePlans } from '../../lib/plans/generate.ts';
import { readPlans, actOnPlan } from '../../lib/plans/store.ts';
import { testDatabase } from '../family/database.ts';
const identity = { googleSubject: 'weekly-store', email: 'weekly.store@gmail.com', emailVerified: true as const };
const other = { googleSubject: 'weekly-foreign', email: 'weekly.foreign@gmail.com', emailVerified: true as const };
const allowed = [identity.email, other.email];
const now = new Date('2026-11-26T14:00:00Z');
const recipe = (n: number) => ({ title: `Dinner ${n}`, summary: 'Cook it.', sourceUrl: `https://example.test/${n}`, imageUrl: null, time: null });
test('family-bound approval/suggestion resolution invalidates approvals, rejects stale concurrent edits and freezes final history', async () => {
 const fixture = await testDatabase(); const db = await fixture.open();
 try {
  await provisionFamily(db, identity, allowed, false); await provisionFamily(db, other, allowed, false);
  for (let n=0;n<8;n++) await saveMenuRecipe(db, identity, allowed, recipe(n));
  await generateDuePlans(db, allowed, 'Thursday', now);
  let view = await readPlans(db, identity, allowed, {}, now); const id = view.plan!.id;
  await assert.rejects(actOnPlan(db, other, allowed, id, { action:'approve', revision:1 }, now), {status:404});
  await assert.rejects(actOnPlan(db, identity, [], id, { action:'approve', revision:1 }, now), {status:403});
  await assert.rejects(actOnPlan(db, identity, allowed, randomUUID(), { action:'approve', revision:1 }, now), {status:404});
  await Promise.all([1,2].map(() => actOnPlan(db, identity, allowed, id, { action:'approve', revision:1 }, now)));
  view = await readPlans(db, identity, allowed, {}, now); assert.equal(view.approvals,1); assert.equal(view.approved,true);
  const replacement = view.menu.entries.find(entry => entry.recipe.sourceUrl !== view.plan!.meals[0].sourceUrl)!;
  const action = {action:'suggest',revision:1,day:0,menuRecipeId:replacement.id};
  await actOnPlan(db, identity, allowed, id, action, now); await actOnPlan(db, identity, allowed, id, action, now);
  view = await readPlans(db, identity, allowed, {}, now); assert.equal(view.suggestions.length,1);
  const suggestionId=view.suggestions[0].id;
  const outcomes=await Promise.allSettled([1,2].map(() => actOnPlan(db, identity, allowed, id, {action:'accept',revision:1,suggestionId},now)));
  assert.equal(outcomes.filter(value=>value.status==='fulfilled').length,1);
  view=await readPlans(db,identity,allowed,{},now); assert.equal(view.plan?.revision,2); assert.equal(view.approvals,0); assert.equal(view.plan?.meals[0].sourceUrl,replacement.recipe.sourceUrl);
  await assert.rejects(actOnPlan(db,identity,allowed,id,{action:'approve',revision:1},now),{status:409});
  await actOnPlan(db,identity,allowed,id,{action:'approve',revision:2},now);
  await actOnPlan(db,identity,allowed,id,{action:'finalize',revision:2},now);
  await removeMenuRecipe(db,identity,allowed,replacement.id);
  view=await readPlans(db,identity,allowed,{week:'2026-11-29'},new Date('2026-12-15T15:00:00Z'));
  assert.equal(view.editable,false); assert.equal(view.plan?.status,'final'); assert.equal(view.approvals,1); assert.equal(view.history.includes('2026-11-29'),true);
  for(const action of [{action:'approve',revision:2},{action:'finalize',revision:2}]) await assert.rejects(actOnPlan(db,identity,allowed,id,action,now),{status:409});
  await db.execute('UPDATE meal_plan_weeks SET meals=$1 WHERE id=$2',[JSON.stringify(Array(7).fill({evil:true})),id]);
  await assert.rejects(readPlans(db,identity,allowed,{week:'2026-11-29'},now),/Storage unavailable/);
 }finally{await db.close();await fixture.cleanup();}
});

test('past drafts, removed suggestion recipes, denied grants and malformed rows fail closed without changing meals',async()=>{
 const fixture=await testDatabase();const db=await fixture.open();
 try{
  await provisionFamily(db,identity,allowed,false);for(let n=0;n<2;n++)await saveMenuRecipe(db,identity,allowed,recipe(n));await generateDuePlans(db,allowed,'Thursday',now);
  let view=await readPlans(db,identity,allowed,{},now);const id=view.plan!.id;const replacement=view.menu.entries.find(entry=>entry.recipe.sourceUrl!==view.plan!.meals[0].sourceUrl)!;
  await actOnPlan(db,identity,allowed,id,{action:'suggest',revision:1,day:0,menuRecipeId:replacement.id},now);view=await readPlans(db,identity,allowed,{},now);const suggestion=view.suggestions[0];
  await removeMenuRecipe(db,identity,allowed,replacement.id);
  await assert.rejects(actOnPlan(db,identity,allowed,id,{action:'accept',revision:1,suggestionId:suggestion.id},now),{status:409});
  await actOnPlan(db,identity,allowed,id,{action:'reject',revision:1,suggestionId:suggestion.id},now);
  await assert.rejects(actOnPlan(db,identity,allowed,id,{action:'reject',revision:1,suggestionId:suggestion.id},now),{status:409});
  assert.equal((await readPlans(db,identity,allowed,{},now)).plan?.revision,1);
  await assert.rejects(actOnPlan(db,identity,allowed,id,{action:'approve',revision:1},new Date('2026-12-06T15:00:00Z')),{status:409});
  await db.execute('UPDATE app_users SET invitation_granted_at=1 WHERE google_subject=$1',[identity.googleSubject]);
  assert.equal((await readPlans(db,identity,[],{},now)).plan?.id,id);
  await assert.rejects(readPlans(db,identity,['invalid'],{},now));
  await db.execute('UPDATE app_users SET invitation_granted_at=NULL WHERE google_subject=$1',[identity.googleSubject]);
  await assert.rejects(readPlans(db,identity,[],{},now),{status:403});
  await db.execute('UPDATE meal_plan_weeks SET meals=$1 WHERE id=$2',[JSON.stringify(Array(7).fill({...recipe(1),title:' padded '})),id]);
  // Stored recipes are parsed with the same validated recipe semantics.
  assert.equal((await readPlans(db,identity,allowed,{},now)).plan?.meals[0].title,'padded');
 }finally{await db.close();await fixture.cleanup();}
});

test('100 pending suggestions bound a revision; resolving frees capacity and finalize closes remaining input',async()=>{
 const fixture=await testDatabase();const db=await fixture.open();
 try{
  await provisionFamily(db,identity,allowed,false);for(let n=0;n<2;n++)await saveMenuRecipe(db,identity,allowed,recipe(n));await generateDuePlans(db,allowed,'Thursday',now);
  let view=await readPlans(db,identity,allowed,{},now);const id=view.plan!.id;const replacement=view.menu.entries.find(entry=>entry.recipe.sourceUrl!==view.plan!.meals[0].sourceUrl)!;
  const user=await db.one<{id:string;family:string}>('SELECT id,family_id AS family FROM app_users WHERE google_subject=$1',[identity.googleSubject]);assert.ok(user);
  // Other persisted same-family members' valid snapshots exercise the total cap.
  for(let n=0;n<100;n++){
   const uid=randomUUID();await db.execute('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at,invitation_granted_at) VALUES ($1,$2,$3,$4,1,1)',[uid,'pending-'+n,'pending'+n+'@example.test',user.family]);
   await db.execute('INSERT INTO meal_plan_suggestions (id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,created_at) VALUES ($1,$2,$3,1,0,$4,$5,1)',[randomUUID(),id,uid,replacement.id,JSON.stringify(replacement.recipe)]);
  }
  await assert.rejects(actOnPlan(db,identity,allowed,id,{action:'suggest',revision:1,day:0,menuRecipeId:replacement.id},now),{status:409});
  view=await readPlans(db,identity,allowed,{},now);assert.equal(view.suggestions.length,100);
  await actOnPlan(db,identity,allowed,id,{action:'reject',revision:1,suggestionId:view.suggestions[0].id},now);
  await actOnPlan(db,identity,allowed,id,{action:'suggest',revision:1,day:0,menuRecipeId:replacement.id},now);
  await actOnPlan(db,identity,allowed,id,{action:'finalize',revision:1},now);
  view=await readPlans(db,identity,allowed,{},now);assert.equal(view.suggestions.length,0);assert.equal(view.plan?.status,'final');
  assert.equal((await db.one<{n:number}>("SELECT count(*) AS n FROM meal_plan_suggestions WHERE status='rejected'"))?.n,101);
 }finally{await db.close();await fixture.cleanup();}
});

test('accepting one recipe stales same-slot competitors and preserves other-slot proposal identity/content at the new revision',async()=>{
 const fixture=await testDatabase();const db=await fixture.open();
 try{
  await provisionFamily(db,identity,allowed,false);await provisionFamily(db,other,allowed,false);
  const member=await db.one<{family:string}>('SELECT family_id AS family FROM app_users WHERE google_subject=$1',[identity.googleSubject]);assert.ok(member);
  await db.execute('UPDATE app_users SET family_id=$1 WHERE google_subject=$2',[member.family,other.googleSubject]);
  for(let n=0;n<4;n++)await saveMenuRecipe(db,identity,allowed,recipe(n));await generateDuePlans(db,allowed,'Thursday',now);
  let view=await readPlans(db,identity,allowed,{},now);const id=view.plan!.id;
  const replacement0=view.menu.entries.find(entry=>entry.recipe.sourceUrl!==view.plan!.meals[0].sourceUrl)!;
  const replacement1=view.menu.entries.find(entry=>entry.recipe.sourceUrl!==view.plan!.meals[1].sourceUrl)!;
  await actOnPlan(db,identity,allowed,id,{action:'approve',revision:1},now);
  await actOnPlan(db,identity,allowed,id,{action:'suggest',revision:1,day:0,menuRecipeId:replacement0.id},now);
  await actOnPlan(db,other,allowed,id,{action:'suggest',revision:1,day:0,menuRecipeId:replacement0.id},now);
  await actOnPlan(db,other,allowed,id,{action:'suggest',revision:1,day:1,menuRecipeId:replacement1.id},now);
  const proposals=await db.all<{id:string;user_id:string;day_index:number}>('SELECT * FROM meal_plan_suggestions WHERE plan_id=$1',[id]);
  const author=await db.one<{id:string}>('SELECT id FROM app_users WHERE google_subject=$1',[identity.googleSubject]);assert.ok(author);
  const chosen=proposals.find(row=>row.day_index===0&&row.user_id===author.id)!;const competitor=proposals.find(row=>row.day_index===0&&row.user_id!==author.id)!;const unrelated=proposals.find(row=>row.day_index===1)!;
  const foreignPlan=randomUUID(),foreignProposal=randomUUID();
  await db.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,meals,created_at) VALUES ($1,$2,$3,$4,1)',[foreignPlan,member.family,'2026-12-06',JSON.stringify(view.plan!.meals)]);
  await db.execute('INSERT INTO meal_plan_suggestions (id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,created_at) VALUES ($1,$2,$3,1,1,$4,$5,1)',[foreignProposal,foreignPlan,author.id,replacement1.id,JSON.stringify(replacement1.recipe)]);
  const foreignBefore=await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[foreignProposal]);
  await actOnPlan(db,identity,allowed,id,{action:'accept',revision:1,suggestionId:chosen.id},now);
  assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[foreignProposal]),foreignBefore,'other plan proposal untouched');
  assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[unrelated.id]),{...unrelated,base_revision:2});
  assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[chosen.id]),{...chosen,status:'accepted'});
  assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[competitor.id]),{...competitor,status:'stale'});
  view=await readPlans(db,other,allowed,{week:'2026-11-29'},now);assert.equal(view.approvals,0);assert.equal(view.plan?.revision,2);assert.deepEqual(view.suggestions.map(row=>row.id),[unrelated.id]);
  await assert.rejects(actOnPlan(db,other,allowed,id,{action:'accept',revision:1,suggestionId:unrelated.id},now),{status:409});
  // A historical pending cohort is never swept into the active revision.
  const historical=randomUUID();await db.execute('INSERT INTO meal_plan_suggestions (id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,created_at) VALUES ($1,$2,$3,1,2,$4,$5,1)',[historical,id,author.id,replacement1.id,JSON.stringify(replacement1.recipe)]);
  const historicalBefore=await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[historical]);
  await actOnPlan(db,other,allowed,id,{action:'accept',revision:2,suggestionId:unrelated.id},now);
  assert.deepEqual(await db.one('SELECT * FROM meal_plan_suggestions WHERE id=$1',[historical]),historicalBefore,'historical pending cohort untouched');
  view=await readPlans(db,identity,allowed,{week:'2026-11-29'},now);assert.equal(view.plan?.revision,3);assert.equal(view.plan?.meals[1].sourceUrl,replacement1.recipe.sourceUrl);assert.equal(view.suggestions.length,0);
 }finally{await db.close();await fixture.cleanup();}
});

test('simultaneous different-recipe accepts serialize without consuming the stale request’s retained proposal',async()=>{
 const fixture=await testDatabase();const db=await fixture.open();
 try{
  await provisionFamily(db,identity,allowed,false);for(let n=0;n<4;n++)await saveMenuRecipe(db,identity,allowed,recipe(n));await generateDuePlans(db,allowed,'Thursday',now);
  let view=await readPlans(db,identity,allowed,{},now);const id=view.plan!.id;
  for(const day of [0,1]){const replacement=view.menu.entries.find(entry=>entry.recipe.sourceUrl!==view.plan!.meals[day].sourceUrl)!;await actOnPlan(db,identity,allowed,id,{action:'suggest',revision:1,day,menuRecipeId:replacement.id},now);}
  view=await readPlans(db,identity,allowed,{},now);const proposals=view.suggestions;
  const outcomes=await Promise.allSettled(proposals.map(suggestion=>actOnPlan(db,identity,allowed,id,{action:'accept',revision:1,suggestionId:suggestion.id},now)));
  assert.equal(outcomes.filter(result=>result.status==='fulfilled').length,1);
  const loser=outcomes.findIndex(result=>result.status==='rejected');assert.equal(loser>=0,true);const outcome=outcomes[loser];assert.equal(outcome.status,'rejected');if(outcome.status==='rejected')assert.equal(outcome.reason.status,409);
  view=await readPlans(db,identity,allowed,{},now);assert.equal(view.plan?.revision,2);assert.deepEqual(view.suggestions,[proposals[loser]]);
  await actOnPlan(db,identity,allowed,id,{action:'accept',revision:2,suggestionId:proposals[loser].id},now);
  view=await readPlans(db,identity,allowed,{},now);assert.equal(view.plan?.revision,3);assert.equal(view.suggestions.length,0);
  const replacement=view.menu.entries.find(entry=>entry.recipe.sourceUrl!==view.plan!.meals[2].sourceUrl)!;
  await actOnPlan(db,identity,allowed,id,{action:'suggest',revision:3,day:2,menuRecipeId:replacement.id},now);
  await actOnPlan(db,identity,allowed,id,{action:'finalize',revision:3},now);
  assert.equal((await db.one<{n:number}>("SELECT count(*) AS n FROM meal_plan_suggestions WHERE plan_id=$1 AND status='pending'",[id]))?.n,0);
  assert.equal((await db.one<{n:number}>("SELECT count(*) AS n FROM meal_plan_suggestions WHERE plan_id=$1 AND status='accepted'",[id]))?.n,2);
 }finally{await db.close();await fixture.cleanup();}
});
