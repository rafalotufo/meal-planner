// Owned real Chrome/server/database; only Google transport is a test fixture.
import assert from 'node:assert/strict';
import { openChrome } from '../auth/chrome.ts';
import { startServer } from '../auth/server.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';
import { generateDuePlans } from '../../lib/plans/generate.ts';
import { actOnPlan, readPlans } from '../../lib/plans/store.ts';
import { saveMenuRecipe } from '../../lib/menu/store.ts';
import { torontoClock, addDays } from '../../lib/plans/calendar.ts';
const fixture=await restrictedMenuDatabase();
let browser:Awaited<ReturnType<typeof openChrome>>|undefined;
let server:Awaited<ReturnType<typeof startServer>>|undefined;
let db:Awaited<ReturnType<typeof fixture.open>>|undefined;
try{
 browser=await openChrome();server=await startServer({DATABASE_URL:fixture.runtimeUrl},true);db=await fixture.open();
 await browser.google(server.origin,'test-code');await browser.navigate(server.origin+'/sign-in');await browser.click('button');
 await browser.waitFor("location.pathname === '/' && Boolean(document.querySelector('#recipe-query'))",'verified member home');
 const user=await db.one<{googleSubject:string;email:string}>('SELECT google_subject AS "googleSubject",verified_email AS email FROM app_users LIMIT 1');assert.ok(user);
 const identity={...user,emailVerified:true as const};const allowed=[user.email];
 for(let n=0;n<54;n++)await saveMenuRecipe(db,identity,allowed,{title:n===53?'Long saved dinner '+ 'hearty'.repeat(23):'Family supper '+n,sourceUrl:'https://example.test/weekly/'+n,imageUrl:null,summary:'A saved family dinner.',time:null});
 const local=torontoClock(new Date());const due=new Date(local.date+'T23:00:00Z');
 await generateDuePlans(db,allowed,local.day,due);
 let view=await readPlans(db,identity,allowed,{},due);const id=view.plan!.id;const week=view.plan!.weekStart;
 await browser.navigate(server.origin+'/plans');
 await browser.waitFor("Boolean(document.querySelector('[data-plan-approve]')) && Object.keys(document.querySelector('[data-plan-approve]')).some(k=>k.startsWith('__reactProps$'))",'hydrated weekly controls');
 assert.equal(await browser.evaluate("document.querySelectorAll('main').length===1 && document.querySelectorAll('h1').length===1 && document.querySelectorAll('article').length===7"),true);
 assert.equal(await browser.evaluate("/away|attendance/i.test(document.querySelector('main').innerText)"),false);
 for(const width of [320,1440]){await browser.viewport(width);await browser.screenshot(`org/reviews/weekly-plan-draft-${width}.png`);}
 await browser.click('[data-plan-approve]');await browser.waitFor("document.querySelector('[data-plan-approve]')?.textContent==='You approved'",'persisted approval');
 assert.equal((await readPlans(db,identity,allowed,{},due)).approvals,1);
 assert.equal(await browser.evaluate("document.querySelector('label[for=swap-0]').textContent"),'Saved dinner for Sunday');
 await browser.waitFor("!document.querySelector('#swap-0').disabled",'swap enabled after refresh');
 await browser.click('#swap-0');
 for(const event of [{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},{type:'keyDown',key:'l',code:'KeyL',text:'l',unmodifiedText:'l',windowsVirtualKeyCode:76},{type:'keyUp',key:'l',code:'KeyL',windowsVirtualKeyCode:76}])await browser.send('Input.dispatchKeyEvent',event);
 await browser.waitFor("Boolean(document.querySelector('#swap-0').value)",'physical saved dinner selection');
 await browser.click('[data-plan-suggest="0"]');await browser.waitFor("Boolean(document.querySelector('[data-plan-accept]'))",'saved suggestion');
 await browser.click('[data-plan-accept]');await browser.waitFor("document.body.innerText.includes('revision 2') && document.querySelector('[data-plan-approve]')?.textContent==='Looks good'",'accepted swap clears approvals');
 assert.equal((await readPlans(db,identity,allowed,{},due)).approvals,0);
 for(const width of [320,1440]){await browser.viewport(width);await browser.screenshot(`org/reviews/weekly-plan-swap-${width}.png`);}
 // Another device accepts a real stored suggestion while this browser holds revision2.
 view=await readPlans(db,identity,allowed,{},due);const replacement=view.menu.entries.find(entry=>entry.recipe.sourceUrl!==view.plan!.meals[1].sourceUrl)!;
 await actOnPlan(db,identity,allowed,id,{action:'suggest',revision:2,day:1,menuRecipeId:replacement.id},due);
 view=await readPlans(db,identity,allowed,{},due);await actOnPlan(db,identity,allowed,id,{action:'accept',revision:2,suggestionId:view.suggestions[0].id},due);
 await browser.click('[data-plan-approve]');await browser.waitFor("document.querySelector('[role=alert]')?.textContent.includes('Refresh')",'real stale conflict guidance');
 await browser.click('[role=alert] button');await browser.waitFor("document.body.innerText.includes('revision 3')",'refresh current revision');
 // Saved-menu pagination keeps the selected week and reaches older saved entries.
 await browser.click('nav[aria-label="Saved dinner pages"] a[href*="menuAfter="]');
 await browser.waitFor("location.search.includes('menuAfter=') && document.querySelectorAll('#swap-0 option').length <= 5",'older saved dinner choices');
 assert.equal(await browser.evaluate('new URL(location.href).searchParams.get("week")'),week);
 await browser.click('[data-plan-finalize]');await browser.waitFor("Boolean(document.querySelector('[data-plan-confirm]'))",'inline final confirmation');
 assert.equal(await browser.evaluate("document.body.innerText.includes('Later edits are unavailable')"),true);
 await browser.click('[data-plan-confirm]');await browser.waitFor("document.body.innerText.includes('Final · Planned meals') && !document.querySelector('[data-plan-finalize]')",'confirmed immutable week');
 await browser.navigate(server.origin+'/plans?week='+week);await browser.waitFor("document.body.innerText.includes('Final · Planned meals')",'final survives reload');
 assert.equal((await readPlans(db,identity,allowed,{week},due)).plan?.status,'final');
 // Genuine retained planned history created only in this owned fixture/process.
 const pastDate=addDays(local.date,-70);const past=new Date(pastDate+'T23:00:00Z');await generateDuePlans(db,allowed,torontoClock(past).day,past);
 const old=(await db.one<{id:string;week:string}>('SELECT id,week_start::text AS week FROM meal_plan_weeks WHERE week_start<$1::date ORDER BY week_start LIMIT 1',[week]))!;
 await actOnPlan(db,identity,allowed,old.id,{action:'finalize',revision:1},past);
 await browser.navigate(server.origin+'/plans');await browser.waitFor(`Boolean(document.querySelector('a[href="/plans?week=${old.week}"]'))`,'finalized history link');
 await browser.click(`a[href="/plans?week=${old.week}"]`);await browser.waitFor(`location.search.includes('${old.week}') && document.querySelectorAll('article').length===7`,'retained planned history');
 assert.equal(await browser.evaluate("Boolean(document.querySelector('[data-plan-suggest]'))"),false);
 for(const width of [320,1440]){await browser.viewport(width);await browser.screenshot(`org/reviews/weekly-plan-history-${width}.png`);}
 await browser.click('#history-week');await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 assert.equal(await browser.evaluate("document.activeElement.matches(':focus-visible')"),true,'native keyboard focus remains visible');
 assert.deepEqual(browser.errors.filter(error=>!/Failed to load resource: the server responded with a status of 409\b/.test(error)),[]);
 console.log('Chrome320/1440: seven dinners, labels/focus/no overflow, real approve/suggest/accept/reset, stale conflict refresh, paged menu, confirmation, immutable retained history passed.');
}catch(error){if(browser)console.error('Weekly browser diagnostic:',await browser.evaluate("({feedback:document.querySelector('[role=alert],[role=status]')?.textContent,active:document.activeElement?.outerHTML?.slice(0,300),selection:document.querySelector('#swap-0')?.value})"));throw error;}finally{await browser?.close();await server?.stop();await db?.close();await fixture.cleanup();}
