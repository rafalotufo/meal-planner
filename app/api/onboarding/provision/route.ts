import { NextRequest } from 'next/server';
import { requireIdentity } from '../../../../lib/family';
import { getDatabase } from '../../../../lib/db';
import { provisionFamily } from '../../../../lib/family-store';
import allowedEmails from '../../../../lib/allowed-google-emails.json';
import { authConfiguration } from '../../../../lib/auth';
import { invitationContext } from '../../../../lib/invitation-context';
import { apiResponse, readJson } from '../../../../lib/http';
export async function POST(request: NextRequest) {
  return apiResponse(async () => {
    const session = await requireIdentity(request.headers);
    await readJson(request, []);
    await provisionFamily(await getDatabase(), session.identity, allowedEmails, invitationContext(request.headers, authConfiguration().origin).present);
    return { ready: true };
  });
}
