import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePlanAction, parsePlanQuery, parseMeals } from '../../lib/plans/validation.ts';
const id = 'a1234567-1234-1234-1234-123456789abc';
test('exact action unions reject missing/excess keys, unbounded revisions and invalid IDs/days', () => {
  for (const action of ['approve', 'finalize']) assert.deepEqual(parsePlanAction({ action, revision: 1 }), { action, revision: 1 });
  assert.ok(parsePlanAction({ action: 'suggest', revision: 2, day: 6, menuRecipeId: id }));
  assert.ok(parsePlanAction({ action: 'accept', revision: 2, suggestionId: id }));
  for (const value of [{ action: 'approve' }, { action: 'approve', revision: 1, day: 0 }, { action: 'finalize', revision: 0 }, { action: 'approve', revision: 2147483648 }, { action: 'suggest', revision: 1, day: 7, menuRecipeId: id }, { action: 'reject', revision: 1, suggestionId: 'bad' }, []]) assert.equal(parsePlanAction(value), null);
});
test('week/query and one-to-seven unique validated recipe snapshots fail closed', () => {
  assert.deepEqual(parsePlanQuery({}), {});
  assert.equal(parsePlanQuery({ week: ['2026-11-29', '2026-12-06'] }), null);
  assert.equal(parsePlanQuery({ family: id }), null);
  assert.equal(parsePlanQuery({ week: '2026-11-30' }), null);
  const recipe = { title: 'Dinner', summary: 'Cook it.', sourceUrl: 'https://example.test/dinner', imageUrl: null, time: null };
  for (const count of [1,2,6,7]) assert.equal(parseMeals(Array.from({length:count},(_,n)=>({...recipe,sourceUrl:`https://example.test/dinner/${n}`})))?.length,count);
  for (const value of [[],Array(8).fill(recipe),Array(2).fill(recipe),[recipe,{...recipe,sourceUrl:recipe.sourceUrl+'#method'}]]) assert.equal(parseMeals(value),null);
  assert.equal(parseMeals(Array(7).fill({ ...recipe, sourceUrl: 'javascript:alert(1)' })), null);
});
