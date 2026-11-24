import allowed from '../lib/allowed-google-emails.json';
import { openDatabase, validateDatabaseUrl } from '../lib/db/connection';
import { draftDay, dueWeek } from '../lib/plans/calendar';
import { generateDuePlans } from '../lib/plans/generate';
import { validateGoogleAccessList } from '../lib/google-access';
async function main() {
  if (process.argv.length !== 2) throw new Error('Invalid scheduler invocation');
  const day = draftDay(process.env.MEAL_PLAN_DRAFT_DAY);
  validateGoogleAccessList(allowed);
  const url = validateDatabaseUrl(process.env.DATABASE_URL);
  const now = new Date();
  if (!dueWeek(now, day)) { console.log(JSON.stringify({ skipped: true, created: 0, existing: 0, empty: 0, ineligible: 0 })); return; }
  const db = await openDatabase(url.href);
  try { console.log(JSON.stringify(await generateDuePlans(db, allowed, day, now))); }
  finally { await db.close(); }
}
main().catch(() => { console.error('Meal planning failed; no credentials printed.'); process.exitCode = 1; });
