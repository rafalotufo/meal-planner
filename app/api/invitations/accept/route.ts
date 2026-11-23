import { NextRequest, NextResponse } from 'next/server';
import { readCryptographicSession } from '../../../../lib/session';
import { FamilyError } from '../../../../lib/identity-access';
import { apiResponse, readJson } from '../../../../lib/http';
import { acceptInvitation } from '../../../../lib/invitations';
import { getDatabase } from '../../../../lib/db';
import { authConfiguration } from '../../../../lib/auth';
import { contextCookie, invitationContext } from '../../../../lib/invitation-context';
import { noStore } from '../../../../lib/auth-policy';
import allowed from '../../../../lib/allowed-google-emails.json';
export async function POST(request: NextRequest) {
  return apiResponse(async () => {
    const session = await readCryptographicSession(request.headers);
    if (!session) throw new FamilyError(401, "Unauthorized");
    await readJson(request, []);
    const origin = authConfiguration().origin;
    acceptInvitation(getDatabase(), session.identity, allowed, invitationContext(request.headers, origin).token);
    return NextResponse.json({ ready: true }, { headers: { ...noStore, 'Set-Cookie': contextCookie(origin, null) } });
  });
}
