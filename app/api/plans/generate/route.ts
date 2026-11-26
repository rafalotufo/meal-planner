import allowed from '../../../../lib/allowed-google-emails.json';
import { openVerificationDatabase, validateDatabaseUrl } from '../../../../lib/db/connection';
import { schedulerResponse } from '../../../../lib/plans/scheduler';
import { waitUntil } from '@vercel/functions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

function handle(request: Request) {
  const work = schedulerResponse(request, {
    env: process.env, allowed,
    db: deadline => openVerificationDatabase(validateDatabaseUrl(process.env.DATABASE_URL).href, deadline),
  });
  // Retain this same bounded work through disconnect so SQL/pool cleanup settles.
  waitUntil(work);
  return work;
}
export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const OPTIONS = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
