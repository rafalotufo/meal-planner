import { randomUUID } from 'node:crypto';
import type { FamilyDatabase } from '../db/connection';
import type { MealPlanWeekRow, MealPlanSuggestionRow, MenuRecipeRow } from '../db/schema';
import { FamilyError, requireMember, type VerifiedIdentity } from '../identity-access';
import { listMenuRecipes } from '../menu/store';
import { menuEntryFromRow, parseMenuId, parseMenuRecipe } from '../menu/validation';
import { currentWeek, parseWeek } from './calendar';
import { maxRevision, parseMeals, parsePlanAction, parsePlanQuery, validRevision } from './validation';
import type { PlanView, PlanWeek } from './types';
const columns = 'id,family_id AS "familyId",week_start::text AS "weekStart",revision,status,meals,created_at AS "createdAt",finalized_at AS "finalizedAt"';
const conflict = () => new FamilyError(409, 'This plan changed or is read-only. Refresh to see the latest week.');
const invalid = () => new FamilyError(400, 'Invalid request');
function planFromRow(row: MealPlanWeekRow): PlanWeek {
  const meals = parseMeals(row.meals);
  if (!meals || !parseMenuId(row.id) || !parseWeek(row.weekStart) || !validRevision(row.revision) || !['draft','final'].includes(row.status) || !Number.isSafeInteger(row.createdAt) || row.createdAt < 0 || (row.status === 'draft' ? row.finalizedAt !== null : !Number.isSafeInteger(row.finalizedAt) || row.finalizedAt! < 0)) throw new Error('Storage unavailable');
  return { id: row.id, weekStart: row.weekStart, revision: row.revision, status: row.status, meals, createdAt: row.createdAt, finalizedAt: row.finalizedAt };
}
export async function readPlans(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, queryValue: Record<string, unknown> = {}, now = new Date()): Promise<PlanView> {
  const query = parsePlanQuery(queryValue); if (!query) throw invalid();
  // Use the same lock for a coherent read across revision, approvals and suggestions.
  return db.transaction(async tx => {
    const user = await requireMember(tx, identity, allowed);
    const row = await tx.one<MealPlanWeekRow>(`SELECT ${columns} FROM meal_plan_weeks WHERE family_id=$1 AND ${query.week ? 'week_start=$2::date' : 'week_start >= $2::date'} ORDER BY week_start DESC LIMIT 1`, [user.familyId, query.week ?? currentWeek(now)]);
    const plan = row ? planFromRow(row) : null;
    const history = await tx.all<{ week: string }>("SELECT week_start::text AS week FROM meal_plan_weeks WHERE family_id=$1 AND status='final' AND week_start<$2::date ORDER BY week_start DESC LIMIT 12", [user.familyId, currentWeek(now)]);
    const approvals = plan ? await tx.all<{ userId: string }>('SELECT a.user_id AS "userId" FROM meal_plan_approvals a JOIN app_users u ON u.id=a.user_id WHERE a.plan_id=$1 AND a.revision=$2 AND u.family_id=$3', [plan.id, plan.revision, user.familyId]) : [];
    const rows = plan ? await tx.all<MealPlanSuggestionRow>(`SELECT id,day_index AS day,recipe FROM meal_plan_suggestions WHERE plan_id=$1 AND base_revision=$2 AND status='pending' ORDER BY created_at,id LIMIT 100`, [plan.id, plan.revision]) : [];
    const suggestions = rows.map(row => { const recipe = parseMenuRecipe(row.recipe); if (!recipe || !parseMenuId(row.id) || !Number.isInteger(row.day) || row.day < 0 || row.day > 6) throw new Error('Storage unavailable'); return { id: row.id, day: row.day, recipe }; });
    return { plan, history: history.map(row => row.week), approvals: approvals.length, approved: approvals.some(row => row.userId === user.id), suggestions, menu: await listMenuRecipes(tx, identity, allowed, query.menuAfter), editable: Boolean(plan && plan.status === 'draft' && plan.weekStart >= currentWeek(now)) };
  });
}
export async function actOnPlan(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, idValue: unknown, actionValue: unknown, now = new Date()) {
  const id = parseMenuId(idValue), action = parsePlanAction(actionValue);
  if (!id || !action) throw invalid();
  return db.transaction(async tx => {
    const user = await requireMember(tx, identity, allowed);
    const row = await tx.one<MealPlanWeekRow>(`SELECT ${columns} FROM meal_plan_weeks WHERE id=$1 AND family_id=$2`, [id, user.familyId]);
    if (!row) throw new FamilyError(404, 'Plan unavailable');
    const plan = planFromRow(row);
    if (plan.status !== 'draft' || plan.weekStart < currentWeek(now) || plan.revision !== action.revision) throw conflict();
    if (action.action === 'approve') {
      await tx.execute('INSERT INTO meal_plan_approvals (plan_id,user_id,revision,created_at) VALUES ($1,$2,$3,$4) ON CONFLICT (plan_id,user_id) DO UPDATE SET revision=EXCLUDED.revision,created_at=EXCLUDED.created_at', [id, user.id, plan.revision, now.getTime()]);
    } else if (action.action === 'suggest') {
      const row = await tx.one<MenuRecipeRow>('SELECT id,family_id AS "familyId",source_url AS "sourceUrl",image_url AS "imageUrl",title,summary,time_kind AS "timeKind",time_text AS "timeText",saved_at AS "savedAt" FROM menu_recipes WHERE id=$1 AND family_id=$2', [action.menuRecipeId, user.familyId]);
      if (!row) throw new FamilyError(409, 'That recipe is no longer saved. Refresh your menu.');
      const recipe = menuEntryFromRow(row).recipe;
      if (recipe.sourceUrl === plan.meals[action.day].sourceUrl) throw new FamilyError(400, 'Choose a different dinner.');
      const existing = await tx.one<{ menuRecipeId: string }>(`SELECT menu_recipe_id AS "menuRecipeId" FROM meal_plan_suggestions WHERE plan_id=$1 AND base_revision=$2 AND day_index=$3 AND user_id=$4 AND status='pending'`, [id, plan.revision, action.day, user.id]);
      if (existing) { if (existing.menuRecipeId !== action.menuRecipeId) throw new FamilyError(409, 'Resolve your existing suggestion for this dinner first.'); return { ok: true as const }; }
      const count = await tx.one<{ n: number }>("SELECT count(*) AS n FROM meal_plan_suggestions WHERE plan_id=$1 AND base_revision=$2 AND status='pending'", [id, plan.revision]);
      if (!count || count.n >= 100) throw new FamilyError(409, 'Resolve pending suggestions before adding more.');
      await tx.execute('INSERT INTO meal_plan_suggestions (id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [randomUUID(), id, user.id, plan.revision, action.day, action.menuRecipeId, JSON.stringify(recipe), now.getTime()]);
    } else if (action.action === 'finalize') {
      await tx.execute("UPDATE meal_plan_suggestions SET status='rejected' WHERE plan_id=$1 AND base_revision=$2 AND status='pending'", [id, plan.revision]);
      await tx.execute("UPDATE meal_plan_weeks SET status='final',finalized_at=$2 WHERE id=$1", [id, now.getTime()]);
    } else {
      const suggestion = await tx.one<MealPlanSuggestionRow>(`SELECT id,day_index AS day,recipe,menu_recipe_id AS "menuRecipeId" FROM meal_plan_suggestions WHERE id=$1 AND plan_id=$2 AND base_revision=$3 AND status='pending'`, [action.suggestionId, id, plan.revision]);
      if (!suggestion) throw conflict();
      const savedSnapshot = parseMenuRecipe(suggestion.recipe);
      if (!savedSnapshot || !Number.isInteger(suggestion.day) || suggestion.day < 0 || suggestion.day > 6) throw new Error('Storage unavailable');
      if (action.action === 'reject') await tx.execute("UPDATE meal_plan_suggestions SET status='rejected' WHERE id=$1", [suggestion.id]);
      else {
        if (plan.revision === maxRevision) throw conflict();
        const menu = await tx.one<MenuRecipeRow>('SELECT id,family_id AS "familyId",source_url AS "sourceUrl",image_url AS "imageUrl",title,summary,time_kind AS "timeKind",time_text AS "timeText",saved_at AS "savedAt" FROM menu_recipes WHERE id=$1 AND family_id=$2', [suggestion.menuRecipeId, user.familyId]);
        if (!menu) throw new FamilyError(409, 'That recipe is no longer saved. Reject this suggestion and choose another.');
        const replacement = menuEntryFromRow(menu).recipe;
        plan.meals[suggestion.day] = replacement;
        await tx.execute('UPDATE meal_plan_weeks SET meals=$2,revision=revision+1 WHERE id=$1', [id, JSON.stringify(plan.meals)]);
        await tx.execute('DELETE FROM meal_plan_approvals WHERE plan_id=$1', [id]);
        await tx.execute(`UPDATE meal_plan_suggestions
          SET status=CASE WHEN id=$2 THEN 'accepted' WHEN day_index=$3 THEN 'stale' ELSE status END,
              base_revision=CASE WHEN day_index<>$3 THEN $4 ELSE base_revision END
          WHERE plan_id=$1 AND base_revision=$5 AND status='pending'`, [id, suggestion.id, suggestion.day, plan.revision + 1, plan.revision]);
      }
    }
    return { ok: true as const };
  });
}
