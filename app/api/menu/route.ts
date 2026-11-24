import { after, NextRequest } from 'next/server';
import { requireFamilyContext } from '../../../lib/session';
import { requireIdentity } from '../../../lib/family';
import { menuApiResponse, requireMenuAuthority } from '../../../lib/menu/http';
import { authConfiguration } from '../../../lib/auth';
import { getDatabase } from '../../../lib/db';
import { FamilyError } from '../../../lib/identity-access';
import { readMenuBody } from '../../../lib/menu/body';
import { listMenuRecipes, saveMenuRecipe, lookupMenuRecipes, saveMenuRecipeUrl, retryMenuRecipeCuration } from '../../../lib/menu/store';
import { registerMenuCuration } from '../../../lib/menu/curation';
import allowed from '../../../lib/allowed-google-emails.json';

export const runtime = 'nodejs';
const methods = ['GET', 'HEAD', 'POST'];

async function scheduleCuration(entryId: string, generation: string) {
  await registerMenuCuration(entryId, generation, after, getDatabase, allowed);
}

export async function GET(request: NextRequest) {
  return menuApiResponse(request, methods, async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    const query = request.nextUrl.searchParams;
    if ([...query.keys()].some(key => key !== 'after' && key !== 'q') || query.getAll('after').length > 1 || query.getAll('q').length > 1) throw new FamilyError(400, 'Invalid request');
    return listMenuRecipes(await getDatabase(), session.identity, allowed, query.get('after') ?? undefined, query.get('q') ?? undefined);
  });
}

export async function POST(request: NextRequest) {
  return menuApiResponse(request, methods, async () => {
    await requireFamilyContext(request.headers);
    const session = await requireIdentity(request.headers);
    const query = request.nextUrl.searchParams;
    if (query.size === 1 && (query.get('import') === 'url' || query.get('curate') === 'retry')) {
      const importing = query.get('import') === 'url';
      const body = await readMenuBody(request, authConfiguration().origin, importing ? 'import' : 'retry');
      const authority = await requireMenuAuthority(request);
      const db = await getDatabase();
      if (importing) {
        const result = await saveMenuRecipeUrl(db, authority.identity, allowed, body.sourceUrl, authority.credentialExpiresAt);
        if (result.generation) await scheduleCuration(result.entry.id, result.generation);
        return { entry: result.entry, created: result.created };
      }
      const result = await retryMenuRecipeCuration(db, authority.identity, allowed, body.id, authority.credentialExpiresAt);
      if (result.generation) await scheduleCuration(result.entry.id, result.generation);
      return { entry: result.entry, started: result.started };
    }
    if (query.size === 1 && query.get('lookup') === 'saved') {
      const body = await readMenuBody(request, authConfiguration().origin, 'lookup');
      return lookupMenuRecipes(await getDatabase(), session.identity, allowed, body.sourceUrls);
    }
    if (query.size) throw new FamilyError(400, 'Invalid request');
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
