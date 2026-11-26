import { timingSafeEqual } from 'node:crypto';
import type { FamilyDatabase } from '../db/connection';
import { validateGoogleAccessList } from '../google-access';
import { dueWeek } from './calendar';
import { generateDuePlans } from './generate';

export const SCHEDULER_PATH = '/api/plans/generate';
export const SCHEDULER_PROJECT = 'prj_ntxXnJAVA977jHjLNDR7xJuwSx4V';
export const SCHEDULER_PREVIEW_ORIGIN = 'https://meal-planner-staging-rafalotufos.vercel.app';
export const SCHEDULER_PRODUCTION_ORIGIN = 'https://meal-planner-rafalotufos-projects.vercel.app';
export interface SchedulerDependencies {
  env: Record<string, string | undefined>;
  allowed: unknown;
  db: (deadline: number) => Promise<FamilyDatabase>;
  now?: () => Date;
  event?: (event: object) => void;
}
function protect(response: Response) {
  for (const [name, value] of Object.entries({
    'Cache-Control': 'private, no-store', Pragma: 'no-cache',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=31536000',
  })) response.headers.set(name, value);
  return response;
}
/** Separate machine authority: browser sessions and forwarded headers confer no access. */
export async function schedulerResponse(request: Request, deps: SchedulerDependencies) {
  const deadline = Date.now() + 60000;
  const reply = (status: number, error: string, headers?: HeadersInit) => protect(Response.json({ error }, { status, headers }));
  const env = deps.env;
  if (env.MEAL_PLAN_SCHEDULER_ENABLED === undefined || env.MEAL_PLAN_SCHEDULER_ENABLED === 'false') return reply(404, 'Not found');
  const preview = env.VERCEL_ENV === 'preview';
  const origin = preview ? SCHEDULER_PREVIEW_ORIGIN : SCHEDULER_PRODUCTION_ORIGIN;
  const browserOrigin = preview ? SCHEDULER_PREVIEW_ORIGIN : 'https://lotufo-meals.vercel.app';
  const secret = env.CRON_SECRET;
  if (env.MEAL_PLAN_SCHEDULER_ENABLED !== 'true' || !secret || !/^[a-fA-F0-9]{64}$/.test(secret) ||
    env.VERCEL_PROJECT_ID !== SCHEDULER_PROJECT || !['preview', 'production'].includes(env.VERCEL_ENV ?? '') ||
    env.MEAL_PLAN_SCHEDULER_ORIGIN !== origin || env.BETTER_AUTH_URL !== browserOrigin || env.MEAL_PLAN_DRAFT_DAY !== 'Wednesday') return reply(503, 'Scheduler unavailable');
  if (request.headers.get('host') !== new URL(origin).host) return reply(421, 'Misdirected request');
  const authorization = request.headers.get('authorization');
  const expected = 'Bearer ' + secret;
  if (!authorization || !/^Bearer [a-fA-F0-9]{64}$/.test(authorization) || !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))) return reply(401, 'Unauthorized');
  if (request.method !== 'GET') return reply(405, 'Method not allowed', { Allow: 'GET' });
  const target = new URL(request.url);
  if (target.pathname !== SCHEDULER_PATH || target.search || target.hash || request.url.includes('?') ||
    request.body || request.headers.has('content-length') || request.headers.has('transfer-encoding')) return reply(400, 'Invalid request');
  let db: FamilyDatabase | undefined;
  let result: Awaited<ReturnType<typeof generateDuePlans>> | undefined;
  let failed = false;
  try {
    validateGoogleAccessList(deps.allowed);
    request.signal.throwIfAborted();
    const now = deps.now?.() ?? new Date();
    if (!dueWeek(now, 'Wednesday')) result = { skipped: true, created: 0, existing: 0, empty: 0, ineligible: 0 };
    else {
      db = await deps.db(deadline);
      request.signal.throwIfAborted();
      result = await generateDuePlans(db, deps.allowed, 'Wednesday', now, { deadline, signal: request.signal });
    }
    request.signal.throwIfAborted();
  } catch { failed = true; }
  finally {
    if (db) { try { await db.close(); } catch { failed = true; } }
  }
  const event = { event: 'meal-plan-scheduler', at: new Date().toISOString(), outcome: failed ? 'failed' : 'completed', ...(!failed ? result : {}) };
  // Only fixed fields and aggregate counts reach operational logs.
  (deps.event ?? (entry => console.log(JSON.stringify(entry))))(event);
  return failed || !result ? reply(503, 'Scheduler unavailable') : protect(Response.json(result));
}
