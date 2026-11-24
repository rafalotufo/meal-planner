import { NextRequest } from 'next/server';
import { requireFamilyContext } from '../../../../../lib/session';
import { requireIdentity } from '../../../../../lib/family';
import { menuApiResponse } from '../../../../../lib/menu/http';
import { authConfiguration } from '../../../../../lib/auth';
import { getDatabase } from '../../../../../lib/db';
import { FamilyError } from '../../../../../lib/identity-access';
import { readMenuBody } from '../../../../../lib/menu/body';
import { removeMenuRecipe } from '../../../../../lib/menu/store';
import allowed from '../../../../../lib/allowed-google-emails.json';

export const runtime = 'nodejs';
const methods = ['POST'];

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return menuApiResponse(request, methods, async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    if (request.nextUrl.searchParams.size) throw new FamilyError(400, 'Invalid request');
    await readMenuBody(request, authConfiguration().origin, 'remove');
    return removeMenuRecipe(await getDatabase(), session.identity, allowed, (await context.params).id);
  });
}

const unsupported = (request: NextRequest) => menuApiResponse(request, methods, async () => ({}));
export const GET = unsupported;
export const HEAD = unsupported;
export const OPTIONS = unsupported;
export const PUT = unsupported;
export const PATCH = unsupported;
export const DELETE = unsupported;
