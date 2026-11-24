import allowed from '../lib/allowed-google-emails.json';
import { openDatabase } from '../lib/db/connection';
import { draftDay } from '../lib/plans/calendar';
import { generateDuePlans } from '../lib/plans/generate';
import { validateGoogleAccessList } from '../lib/google-access';
async function main() {
  if (process.argv.length !== 2) throw new Error('Invalid scheduler invocation');
  const day = draftDay(process.env.MEAL_PLAN_DRAFT_DAY);
  validateGoogleAccessList(allowed);
  if (!process.env.DATABASE_URL) throw new Error('Storage unavailable');
  const db = await openDatabase(process.env.DATABASE_URL);
  try { console.log(JSON.stringify(await generateDuePlans(db, allowed, day))); }
  finally { await db.close(); }
}
main().catch(() => { console.error('Meal planning failed; no credentials printed.'); process.exitCode = 1; });
