import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import allowed from '../lib/allowed-google-emails.json';
import { openVerificationDatabase, validateDatabaseUrl, type FamilyDatabase } from '../lib/db/connection';
import { validateGoogleAccessList } from '../lib/google-access';
import { dueWeek } from '../lib/plans/calendar';
import { generateFamilyPlan } from '../lib/plans/generate';

const previewHosts = [
  'ep-wandering-breeze-bbtscekj.c-15.us-east-1.aws.neon.tech',
  'ep-wandering-breeze-bbtscekj-pooler.c-15.us-east-1.aws.neon.tech',
];
const tables = ['families', 'app_users', 'menu_recipes', 'menu_recipe_curations', 'meal_plan_weeks', 'meal_plan_approvals', 'meal_plan_suggestions'] as const;
async function projection(db: FamilyDatabase) {
  const result: Record<string, { count: number; hash: string }> = {};
  for (const table of tables) {
    // Identifiers come only from this closed constant list. No row data is returned.
    const count = await db.one<{ n: number }>(`SELECT count(*) AS n FROM ${table}`);
    if (!count || count.n > 1000) throw new Error('Probe inventory exceeds bound');
    const hash = await db.one<{ hash: string }>(`SELECT md5(COALESCE(string_agg(row_hash,'' ORDER BY row_hash),'')) AS hash FROM (SELECT md5(to_jsonb(t)::text) AS row_hash FROM ${table} t) rows`);
    if (!hash) throw new Error('Probe inventory unavailable');
    result[table] = { count: count.n, hash: hash.hash };
  }
  return result;
}
async function main() {
  if (process.argv.length !== 2) throw new Error('No probe arguments allowed');
  const policy = validateGoogleAccessList(allowed);
  const url = validateDatabaseUrl(process.env.MEAL_PLAN_SCHEDULER_PROBE_DATABASE_URL);
  if (!previewHosts.includes(url.hostname) || url.pathname !== '/meal_planner' || url.username !== 'mp_runtime' ||
    !['', '5432'].includes(url.port)) throw new Error('Probe target unavailable');
  const deadline = Date.now() + 60_000;
  const db = await openVerificationDatabase(url.href, deadline);
  const rollback = new Error('Owned rollback sentinel');
  let before: Awaited<ReturnType<typeof projection>> | undefined;
  let exercised = false;
  try {
    try {
      await db.verificationTransaction(deadline, async tx => {
        before = await projection(tx);
        const eligible = await tx.all<{ id: string }>(`SELECT f.id FROM families f WHERE f.identity_kind='google' AND EXISTS
          (SELECT 1 FROM app_users u WHERE u.family_id=f.id AND u.identity_kind='google' AND
          (u.invitation_granted_at IS NOT NULL OR lower(btrim(u.verified_email))=ANY($1::text[]))) ORDER BY f.id LIMIT 2`, [policy]);
        if (eligible.length !== 1) throw new Error('Expected exactly one existing eligible staging family');
        const familyId = eligible[0].id;
        // Operator-only deterministic due clock; never supplied to the HTTP route.
        const now = new Date('2026-11-25T14:00:00Z');
        const week = dueWeek(now, 'Wednesday'); assert.ok(week);
        if (await tx.one('SELECT id FROM meal_plan_weeks WHERE family_id=$1 AND week_start=$2::date', [familyId, week])) throw new Error('Probe refuses an existing target week');
        const fixtureId = randomUUID();
        await tx.execute("INSERT INTO menu_recipes(id,family_id,source_url,title,summary,saved_at,category) VALUES($1,$2,$3,$4,$5,$6,'main')",
          [fixtureId, familyId, 'https://example.test/scheduler-probe/' + fixtureId, 'Rollback-only scheduler dinner', 'Transient operator fixture; no network fetch.', now.getTime()]);
        assert.equal(await generateFamilyPlan(tx, policy, familyId, week, now), 'created');
        const draft = await tx.one<{ id: string; meals: { sourceUrl: string }[] }>('SELECT * FROM meal_plan_weeks WHERE family_id=$1 AND week_start=$2::date', [familyId, week]);
        assert.ok(draft && draft.meals.length >= 1 && draft.meals.length <= 8);
        assert.equal(new Set(draft.meals.map(meal => meal.sourceUrl)).size, draft.meals.length);
        assert.equal(await generateFamilyPlan(tx, policy, familyId, week, now), 'existing');
        assert.deepEqual(await tx.one('SELECT * FROM meal_plan_weeks WHERE id=$1', [draft.id]), draft);
        await tx.execute("UPDATE meal_plan_weeks SET status='final',finalized_at=$2 WHERE id=$1", [draft.id, now.getTime() + 1]);
        const final = await tx.one('SELECT * FROM meal_plan_weeks WHERE id=$1', [draft.id]);
        assert.equal(await generateFamilyPlan(tx, policy, familyId, week, now), 'existing');
        assert.deepEqual(await tx.one('SELECT * FROM meal_plan_weeks WHERE id=$1', [draft.id]), final);
        exercised = true;
        throw rollback;
      });
      throw new Error('Probe must never commit');
    } catch (error) { if (error !== rollback) throw error; }
    const after = await db.verificationReadOnly(deadline, projection);
    assert.ok(exercised && before); assert.deepEqual(after, before);
    console.log(JSON.stringify({ probe: 'weekly-plan-scheduler', target: 'recorded-preview', rollbackOnly: true,
      created: true, draftPreserved: true, finalPreserved: true, preserved: true, before, after }));
  } finally { await db.close(); }
}
main().catch(() => { console.error('Scheduler probe failed; no credentials printed.'); process.exitCode = 1; });
