import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { verificationFixture } from './database.ts';
import { exchangeVerification, readVerificationSession } from '../../lib/verification/store.ts';
import { familySummary, provisionFamily } from '../../lib/family-store.ts';
import { createInvitation, acceptInvitation, revokeInvitation } from '../../lib/invitations.ts';
import { saveMenuRecipe, listMenuRecipes, saveMenuRecipeUrl, retryMenuRecipeCuration, removeMenuRecipe } from '../../lib/menu/store.ts';
import { readPlans, actOnPlan } from '../../lib/plans/store.ts';
import { generateDuePlans } from '../../lib/plans/generate.ts';
import { currentWeek } from '../../lib/plans/calendar.ts';
const recipe=(n:number)=>({title:`Dinner ${n}`,summary:'Cook dinner.',sourceUrl:`https://example.test/dinner-${n}`,imageUrl:null,time:null});
test('synthetic member uses real family/menu/plan stores while Google-only effects and global generation remain denied',async()=>{
 const f=await verificationFixture();try{
  const {token}=await exchangeVerification(f.db,f.runId,f.capability,f.target,[]);const session=await readVerificationSession(f.db,token,f.target,[]);assert.ok(session);const identity=session.identity;
  const saved=await saveMenuRecipe(f.db,identity,[],recipe(10));assert.equal((await listMenuRecipes(f.db,identity,[])).entries.length,1);
  assert.match((await familySummary(f.db,identity,[])).members[0].email,/Verification member/);
  await assert.rejects(provisionFamily(f.db,identity,[],false),{status:403});
  await assert.rejects(createInvitation(f.db,identity,[],'someone@gmail.com',f.target.origin),{status:403});
  await assert.rejects(acceptInvitation(f.db,identity,[],null),{status:403});
  await assert.rejects(revokeInvitation(f.db,identity,[],randomUUID()),{status:403});
  await assert.rejects(saveMenuRecipeUrl(f.db,identity,[],'https://example.test/url',Date.now()+10000),{status:403});
  await assert.rejects(retryMenuRecipeCuration(f.db,identity,[],saved.entry.id,Date.now()+10000),{status:403});
  assert.equal((await f.db.one<{n:number}>('SELECT count(*)::integer AS n FROM family_invitations'))?.n,0);
  assert.equal((await generateDuePlans(f.db,[],'Thursday',new Date('2026-11-26T14:00:00Z'))).created,0);
  const now=new Date(), planId=randomUUID();
  await f.db.execute('INSERT INTO meal_plan_weeks(id,family_id,week_start,meals,created_at) VALUES($1,$2,$3,$4,$5)',[planId,f.familyId,currentWeek(now),JSON.stringify(Array.from({length:7},(_,i)=>recipe(i))),Date.now()]);
  await actOnPlan(f.db,identity,[],planId,{action:'approve',revision:1},now);
  await actOnPlan(f.db,identity,[],planId,{action:'suggest',revision:1,day:0,menuRecipeId:saved.entry.id},now);
  const view=await readPlans(f.db,identity,[],{},now);assert.equal(view.approved,true);assert.equal(view.suggestions.length,1);
  await assert.rejects(actOnPlan(f.db,identity,[],planId,{action:'finalize',revision:1},now),{status:403});
  await removeMenuRecipe(f.db,identity,[],saved.entry.id);
  await f.db.execute('UPDATE verification_runs SET revoked_at=$2 WHERE id=$1',[f.runId,Date.now()]);
  await assert.rejects(saveMenuRecipe(f.db,identity,[],recipe(11)),{status:403});
 }finally{await f.close();}
});
test('two scoped verification members collaborate while foreign run tokens cannot read another family',async()=>{
 const f=await verificationFixture();const {issueVerificationRun}=await import('../../lib/verification/operator.ts');
 try{
  const issued=await issueVerificationRun(f.db,f.target,'collaboration'),identities=[];
  for(const member of issued.members){const {token}=await exchangeVerification(f.db,issued.runId,member.capability,f.target,[]);const session=await readVerificationSession(f.db,token,f.target,[]);assert.ok(session);identities.push(session.identity);}
  const saved=await saveMenuRecipe(f.db,identities[0],[],recipe(20));assert.equal((await listMenuRecipes(f.db,identities[1],[])).entries[0].id,saved.entry.id);
  const outsiderToken=await exchangeVerification(f.db,f.runId,f.capability,f.target,[]),outsider=await readVerificationSession(f.db,outsiderToken.token,f.target,[]);assert.ok(outsider);assert.equal((await listMenuRecipes(f.db,outsider.identity,[])).entries.length,0);
  const now=new Date(),id=randomUUID();await f.db.execute('INSERT INTO meal_plan_weeks(id,family_id,week_start,meals,created_at) VALUES($1,$2,$3,$4,$5)',[id,issued.familyId,currentWeek(now),JSON.stringify([recipe(1)]),Date.now()]);
  for(const identity of identities)await actOnPlan(f.db,identity,[],id,{action:'approve',revision:1},now);
  assert.equal((await readPlans(f.db,identities[0],[],{},now)).approvals,2);
  await assert.rejects(actOnPlan(f.db,outsider.identity,[],id,{action:'approve',revision:1},now),{status:404});
 }finally{await f.close();}
});
