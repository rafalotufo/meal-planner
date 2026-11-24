import { NextRequest, NextResponse } from 'next/server';
import { requireFamilyContext } from '../../../../lib/session';
import { requireIdentity } from '../../../../lib/family';
import { apiResponse, readJson } from '../../../../lib/http';
import { noStore } from '../../../../lib/auth-policy';
import { FamilyError } from '../../../../lib/identity-access';
import { getDatabase } from '../../../../lib/db';
import { actOnPlan } from '../../../../lib/plans/store';
import allowed from '../../../../lib/allowed-google-emails.json';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return apiResponse(async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    if (request.nextUrl.searchParams.size) throw new FamilyError(400, 'Invalid request');
    const body = await readJson(request, ['action','revision','day','menuRecipeId','suggestionId']);
    return actOnPlan(await getDatabase(), session.identity, allowed, (await params).id, body);
  });
}
async function unsupported(request: NextRequest) {
  return apiResponse(async () => {
    await requireFamilyContext(request.headers);
    await requireIdentity(request.headers);
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: { ...noStore, Allow: 'POST' } });
  });
}
export const GET = unsupported;
export const HEAD = unsupported;
export const PUT = unsupported;
export const PATCH = unsupported;
export const DELETE = unsupported;
export const OPTIONS = unsupported;
