import { NextRequest } from 'next/server';
import { requireFamilyContext } from '../../../../../../lib/session';
import { requireIdentity } from '../../../../../../lib/family';
import { apiResponse, readJson } from '../../../../../../lib/http';
import { getDatabase } from '../../../../../../lib/db';
import { revokeInvitation } from '../../../../../../lib/invitations';
import allowed from '../../../../../../lib/allowed-google-emails.json';
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return apiResponse(async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    await readJson(request, []);
    revokeInvitation(getDatabase(), session.identity, allowed, (await context.params).id);
    return { revoked: true };
  });
}
