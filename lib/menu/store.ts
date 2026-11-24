import { randomUUID } from 'node:crypto';
import type { FamilyDatabase } from '../db/connection';
import type { MenuRecipeRow } from '../db/schema';
import { FamilyError, requireMember, type VerifiedIdentity } from '../identity-access';
import type { MenuPage } from './types';
import { encodeMenuCursor, menuEntryFromRow, parseMenuCursor, parseMenuId, parseMenuRecipe, parseMenuSourceUrls, parseMenuSearch } from './validation';

const columns = 'id, family_id AS "familyId", source_url AS "sourceUrl", image_url AS "imageUrl", title, summary, time_kind AS "timeKind", time_text AS "timeText", saved_at AS "savedAt"';
const invalid = () => new FamilyError(400, 'Invalid request');

export async function lookupMenuRecipes(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown, value: unknown) {
  const sources = parseMenuSourceUrls(value);
  if (!sources) throw invalid();
  const user = await requireMember(db, identity, allowedEmails);
  const rows = await db.all<{sourceUrl: string}>('SELECT source_url AS "sourceUrl" FROM menu_recipes WHERE family_id=$1 AND source_url=ANY($2::text[]) LIMIT 6', [user.familyId, sources]);
  return { savedSourceUrls: rows.map(row => row.sourceUrl) };
}

export async function listMenuRecipes(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown, after?: unknown, query?: unknown): Promise<MenuPage> {
  const position = after === undefined ? null : parseMenuCursor(after);
  const search = parseMenuSearch(query);
  if (after !== undefined && !position || search === null) throw invalid();
  const user = await requireMember(db, identity, allowedEmails);
  const values: unknown[] = position ? [user.familyId, position.savedAt, position.id] : [user.familyId];
  if (search) values.push(search);
  const rows = await db.all<MenuRecipeRow>(`SELECT ${columns} FROM menu_recipes WHERE family_id=$1${position ? ' AND (saved_at,id) < ($2,$3)' : ''}${search ? ` AND strpos(lower(title COLLATE pg_catalog."und-x-icu"),lower($${values.length}::text COLLATE pg_catalog."und-x-icu"))>0` : ''} ORDER BY saved_at DESC,id DESC LIMIT 51`, values);
  const entries = rows.map(menuEntryFromRow);
  const visible = entries.slice(0, 50);
  return { entries: visible, nextCursor: entries.length > 50 ? encodeMenuCursor(visible[49]) : null };
}

export async function saveMenuRecipe(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown, value: unknown) {
  const recipe = parseMenuRecipe(value);
  if (!recipe) throw invalid();
  return db.transaction(async tx => {
    const user = await requireMember(tx, identity, allowedEmails);
    const existing = await tx.one<MenuRecipeRow>(`SELECT ${columns} FROM menu_recipes WHERE family_id=$1 AND source_url=$2`, [user.familyId, recipe.sourceUrl]);
    if (existing) return { entry: menuEntryFromRow(existing), created: false };
    const inserted = await tx.one<MenuRecipeRow>(`INSERT INTO menu_recipes (id,family_id,source_url,image_url,title,summary,time_kind,time_text,saved_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${columns}`, [randomUUID(), user.familyId, recipe.sourceUrl, recipe.imageUrl, recipe.title, recipe.summary, recipe.time?.kind ?? null, recipe.time?.text ?? null, Date.now()]);
    return { entry: menuEntryFromRow(inserted), created: true };
  });
}

export async function removeMenuRecipe(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown, value: unknown) {
  const id = parseMenuId(value);
  if (!id) throw invalid();
  return db.transaction(async tx => {
    const user = await requireMember(tx, identity, allowedEmails);
    await tx.execute('DELETE FROM menu_recipes WHERE family_id=$1 AND id=$2', [user.familyId, id]);
    return { removed: true as const };
  });
}
