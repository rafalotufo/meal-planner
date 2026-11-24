import { NextRequest } from 'next/server';
import { requireFamilyContext } from '../../../lib/session';
import { requireIdentity } from '../../../lib/family';
import { menuApiResponse } from '../../../lib/menu/http';
import { authConfiguration } from '../../../lib/auth';
import { getDatabase } from '../../../lib/db';
import { FamilyError } from '../../../lib/identity-access';
import { readMenuBody } from '../../../lib/menu/body';
import { listMenuRecipes, saveMenuRecipe } from '../../../lib/menu/store';
import allowed from '../../../lib/allowed-google-emails.json';

export const runtime = 'nodejs';
const methods = ['GET', 'HEAD', 'POST'];

export async function GET(request: NextRequest) {
  return menuApiResponse(request, methods, async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    const query = request.nextUrl.searchParams;
    if ([...query.keys()].some(key => key !== 'after') || query.getAll('after').length > 1) throw new FamilyError(400, 'Invalid request');
    return listMenuRecipes(await getDatabase(), session.identity, allowed, query.get('after') ?? undefined);
  });
}

export async function POST(request: NextRequest) {
  return menuApiResponse(request, methods, async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    if (request.nextUrl.searchParams.size) throw new FamilyError(400, 'Invalid request');
    const body = await readMenuBody(request, authConfiguration().origin, 'save');
    return saveMenuRecipe(await getDatabase(), session.identity, allowed, body);
  });
}

export const HEAD = GET;
const unsupported = (request: NextRequest) => menuApiResponse(request, methods, async () => ({}));
export const OPTIONS = unsupported;
export const PUT = unsupported;
export const PATCH = unsupported;
export const DELETE = unsupported;
