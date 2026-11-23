import { NextRequest } from 'next/server';
import { requireFamilyContext } from '../../../lib/session';
import { requireIdentity } from '../../../lib/family';
import { apiResponse } from '../../../lib/http';
import { getDatabase } from '../../../lib/db';
import { familySummary } from '../../../lib/family-store';
import allowed from '../../../lib/allowed-google-emails.json';
export async function GET(request: NextRequest) {
  return apiResponse(async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    return familySummary(await getDatabase(), session.identity, allowed);
  });
}
