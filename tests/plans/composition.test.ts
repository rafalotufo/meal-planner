import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canReplaceMeal, planTargets, maxPlanMeals } from '../../lib/plans/composition.ts';
test('fixed weekly targets and category-preserving replacements retain legacy null behavior', () => {
 assert.deepEqual(planTargets.map(({category,target}) => [category,target]), [['main',4],['side',2],['veggie',2]]);
 assert.equal(maxPlanMeals,8);
 assert.equal(canReplaceMeal({category:'main'}, {category:'main'}),true);
 for(const category of ['side','veggie',null] as const) assert.equal(canReplaceMeal({category:'main'}, {category}),false);
 assert.equal(canReplaceMeal({}, {category:'veggie'}),true);
 assert.equal(canReplaceMeal({category:null}, {}),true);
});
