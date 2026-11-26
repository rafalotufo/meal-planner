import { randomUUID } from 'node:crypto';
import type { FamilyDatabase } from '../db/connection';
import type { MenuRecipeRow } from '../db/schema';
import { validateGoogleAccessList } from '../google-access';
import { menuEntryFromRow } from '../menu/validation';
import { addDays, dueWeek, type DraftDay } from './calendar';

export interface GenerationExecution { deadline: number; signal?: AbortSignal }
function checkExecution(execution?: GenerationExecution) {
  execution?.signal?.throwIfAborted();
  if (execution && Date.now() >= execution.deadline) throw new Error('Scheduler deadline');
}
export async function generateDuePlans(db: FamilyDatabase, allowedEmails: unknown, day: DraftDay, now = new Date(), execution?: GenerationExecution) {
  checkExecution(execution);
  const allowed = validateGoogleAccessList(allowedEmails);
  const week = dueWeek(now, day);
  const result = { skipped: !week, created: 0, existing: 0, empty: 0, ineligible: 0 };
  if (!week) return result;
  let after = '';
  for (;;) {
    checkExecution(execution);
    const page = (tx: FamilyDatabase) => tx.all<{ id: string }>("SELECT id FROM families WHERE identity_kind='google' AND id>$1 ORDER BY id LIMIT 100", [after]);
    const families = execution ? await db.verificationReadOnly(execution.deadline, page) : await page(db);
    for (const family of families) {
      checkExecution(execution);
      const create = (tx: FamilyDatabase) => generateFamilyPlan(tx, allowed, family.id, week, now);
      const outcome = execution ? await db.verificationTransaction(execution.deadline, create) : await db.transaction(create);
      checkExecution(execution);
      result[outcome]++;
    }
    checkExecution(execution);
    if (families.length < 100) return result;
    after = families[99].id;
  }
}

/** Caller owns the common locked transaction; shared with the rollback-only operator probe. */
export async function generateFamilyPlan(tx: FamilyDatabase, allowed: string[], familyId: string, week: string, now: Date) {
  const eligible = await tx.one(`SELECT f.id FROM families f WHERE f.id=$1 AND f.identity_kind='google' AND EXISTS (SELECT 1 FROM app_users u WHERE u.family_id=f.id AND (u.invitation_granted_at IS NOT NULL OR lower(btrim(u.verified_email))=ANY($2::text[])))`, [familyId, allowed]);
  if (!eligible) return 'ineligible';
  if (await tx.one('SELECT id FROM meal_plan_weeks WHERE family_id=$1 AND week_start=$2::date', [familyId, week])) return 'existing';
  const rows = await tx.all<MenuRecipeRow>(`WITH recent AS MATERIALIZED (
    SELECT week_start,meals FROM meal_plan_weeks WHERE family_id=$1 AND status='final' AND week_start >= $3::date AND week_start < $2::date ORDER BY week_start DESC LIMIT 8
  ), used AS (SELECT meal->>'sourceUrl' AS source_url,max(week_start) AS last_use FROM recent CROSS JOIN LATERAL jsonb_array_elements(meals) meal GROUP BY meal->>'sourceUrl')
  SELECT m.id,m.family_id AS "familyId",m.source_url AS "sourceUrl",m.image_url AS "imageUrl",m.title,m.summary,m.time_kind AS "timeKind",m.time_text AS "timeText",m.saved_at AS "savedAt"
  FROM menu_recipes m LEFT JOIN used ON used.source_url=m.source_url WHERE m.family_id=$1 AND NOT EXISTS (SELECT 1 FROM menu_recipe_curations c WHERE c.entry_id=m.id AND c.state<>'ready')
  ORDER BY used.last_use ASC NULLS FIRST, md5($2::text || m.source_url),m.source_url,m.id LIMIT 7`, [familyId, week, addDays(week, -56)]);
  if (!rows.length) return 'empty';
  const candidates = rows.map(row => menuEntryFromRow(row).recipe);
  const offset = Math.floor(Date.parse(week + 'T12:00:00Z') / 604800000) % candidates.length;
  const meals = candidates.map((_, index) => candidates[(index + offset) % candidates.length]);
  await tx.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,meals,created_at) VALUES ($1,$2,$3,$4,$5)', [randomUUID(), familyId, week, JSON.stringify(meals), now.getTime()]);
  return 'created';
}
