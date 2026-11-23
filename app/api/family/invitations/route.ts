import { NextRequest, NextResponse } from 'next/server';
import { requireFamilyContext } from '../../../../lib/session';
import { requireIdentity } from '../../../../lib/family';
import { apiResponse, readJson } from '../../../../lib/http';
import { createInvitation } from '../../../../lib/invitations';
import { getDatabase } from '../../../../lib/db';
import allowed from '../../../../lib/allowed-google-emails.json';
import { authConfiguration } from '../../../../lib/auth';
import { noStore } from '../../../../lib/auth-policy';
export async function POST(request: NextRequest) {
  return apiResponse(async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    const body = await readJson(request, ['recipientEmail']);
    return NextResponse.json(await createInvitation(await getDatabase(), session.identity, allowed, body.recipientEmail, authConfiguration().origin), { status: 201, headers: noStore });
  });
}
