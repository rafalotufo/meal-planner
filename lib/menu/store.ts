import { isRecipeCategory } from '../recipes/category';
import { randomUUID } from 'node:crypto';
import type { FamilyDatabase } from '../db/connection';
import type { MenuRecipeRow, MenuCurationRow } from '../db/schema';
import { FamilyError, requireMember, verifiedIdentity, requireGoogleIdentity, type Principal } from '../identity-access';
import type { MenuPage, MenuRecipe } from './types';
import { encodeMenuCursor, menuEntryFromRow, parseMenuCursor, parseMenuId, parseMenuRecipe, parseMenuSourceUrl, parseMenuSourceUrls, parseMenuSearch } from './validation';

const columns = 'm.id, m.family_id AS "familyId", m.source_url AS "sourceUrl", m.image_url AS "imageUrl", m.title, m.summary, m.category, m.time_kind AS "timeKind", m.time_text AS "timeText", m.saved_at AS "savedAt", c.state AS "curationState", c.expires_at AS "curationExpiresAt"';
const relation = 'menu_recipes m LEFT JOIN menu_recipe_curations c ON c.entry_id=m.id';
const invalid = () => new FamilyError(400, 'Invalid request');
async function entryById(db: FamilyDatabase, id: string) {
  return menuEntryFromRow(await db.one(`SELECT ${columns} FROM ${relation} WHERE m.id=$1`, [id]));
}
export async function lookupMenuRecipes(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, value: unknown) {
  const sources = parseMenuSourceUrls(value);
  if (!sources) throw invalid();
  const user = await requireMember(db, identity, allowedEmails);
  const rows = await db.all<{sourceUrl: string}>('SELECT source_url AS "sourceUrl" FROM menu_recipes WHERE family_id=$1 AND source_url=ANY($2::text[]) LIMIT 6', [user.familyId, sources]);
  return { savedSourceUrls: rows.map(row => row.sourceUrl) };
}
export async function listMenuRecipes(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, after?: unknown, query?: unknown, category?: unknown): Promise<MenuPage> {
  const position = after === undefined ? null : parseMenuCursor(after);
  const search = parseMenuSearch(query);
  if (after !== undefined && !position || search === null || category !== undefined && !isRecipeCategory(category)) throw invalid();
  const user = await requireMember(db, identity, allowedEmails);
  const values: unknown[] = position ? [user.familyId, position.savedAt, position.id] : [user.familyId];
  if (search) values.push(search);
  const searchParameter = values.length;
  if (category !== undefined) values.push(category);
  const rows = await db.all<MenuRecipeRow>(`SELECT ${columns} FROM ${relation} WHERE m.family_id=$1${position ? ' AND (m.saved_at,m.id) < ($2,$3)' : ''}${search ? ` AND strpos(lower(m.title COLLATE pg_catalog."und-x-icu"),lower($${searchParameter}::text COLLATE pg_catalog."und-x-icu"))>0` : ''}${category !== undefined ? ` AND m.category=$${values.length}` : ''} ORDER BY m.saved_at DESC,m.id DESC LIMIT 51`, values);
  const entries = rows.map(menuEntryFromRow), visible = entries.slice(0, 50);
  return { entries: visible, nextCursor: entries.length > 50 ? encodeMenuCursor(visible[49]) : null };
}
async function existingEntry(db: FamilyDatabase, familyId: string, source: string) {
  const row = await db.one(`SELECT ${columns} FROM ${relation} WHERE m.family_id=$1 AND m.source_url=$2`, [familyId, source]);
  return row ? menuEntryFromRow(row) : null;
}
async function insertRecipe(db: FamilyDatabase, familyId: string, recipe: MenuRecipe) {
  const id = randomUUID();
  await db.execute('INSERT INTO menu_recipes (id,family_id,source_url,image_url,title,summary,time_kind,time_text,saved_at,category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [id, familyId, recipe.sourceUrl, recipe.imageUrl, recipe.title, recipe.summary, recipe.time?.kind ?? null, recipe.time?.text ?? null, Date.now(), recipe.category ?? null]);
  return id;
}
export async function saveMenuRecipe(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, value: unknown) {
  const recipe = parseMenuRecipe(value);
  if (!recipe) throw invalid();
  return db.transaction(async tx => {
    const user = await requireMember(tx, identity, allowedEmails);
    const existing = await existingEntry(tx, user.familyId, recipe.sourceUrl);
    if (existing) return { entry: existing, created: false };
    return { entry: await entryById(tx, await insertRecipe(tx, user.familyId, recipe)), created: true };
  });
}
export async function removeMenuRecipe(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, value: unknown) {
  const id = parseMenuId(value); if (!id) throw invalid();
  return db.transaction(async tx => {
    const user = await requireMember(tx, identity, allowedEmails);
    await tx.execute('DELETE FROM menu_recipes WHERE family_id=$1 AND id=$2', [user.familyId, id]);
    return { removed: true as const };
  });
}
function delegation(identity: Principal, credentialExpiresAt: number) {
  identity = requireGoogleIdentity(identity);
  const verified = verifiedIdentity(identity), now = Date.now();
  if (!verified || !Number.isSafeInteger(credentialExpiresAt) || credentialExpiresAt <= now) throw new FamilyError(401, 'Unauthorized');
  return { now, expiresAt: Math.min(now + 30000, credentialExpiresAt), generation: randomUUID() };
}
async function setTask(db: FamilyDatabase, entryId: string, identity: Principal, credentialExpiresAt: number, retry: boolean) {
  const { now, expiresAt, generation } = delegation(identity, credentialExpiresAt);
  const values = [entryId, generation, now, expiresAt, requireGoogleIdentity(identity).googleSubject, requireGoogleIdentity(identity).email, credentialExpiresAt];
  if (retry) await db.execute("UPDATE menu_recipe_curations SET state='pending',generation=$2,scheduled_at=$3,expires_at=$4,lease=NULL,google_subject=$5,verified_email=$6,credential_expires_at=$7 WHERE entry_id=$1", values);
  else await db.execute("INSERT INTO menu_recipe_curations (entry_id,state,generation,scheduled_at,expires_at,google_subject,verified_email,credential_expires_at) VALUES ($1,'pending',$2,$3,$4,$5,$6,$7)", values);
  return generation;
}
export async function saveMenuRecipeUrl(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, value: unknown, credentialExpiresAt: number) {
  const source = parseMenuSourceUrl(typeof value === 'string' ? value.trim() : value); if (!source) throw invalid();
  return db.transaction(async tx => {
    delegation(identity, credentialExpiresAt);
    const user = await requireMember(tx, identity, allowedEmails);
    const existing = await existingEntry(tx, user.familyId, source);
    if (existing) return { entry: existing, created: false, generation: undefined };
    const id = await insertRecipe(tx, user.familyId, { title: 'Saved recipe link', sourceUrl: source, imageUrl: null, summary: 'Recipe details are not available yet.', time: null });
    const generation = await setTask(tx, id, identity, credentialExpiresAt, false);
    return { entry: await entryById(tx, id), created: true, generation };
  });
}
export async function retryMenuRecipeCuration(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, value: unknown, credentialExpiresAt: number) {
  const id = parseMenuId(value); if (!id) throw invalid();
  return db.transaction(async tx => {
    delegation(identity, credentialExpiresAt);
    const user = await requireMember(tx, identity, allowedEmails);
    const row = await tx.one(`SELECT ${columns} FROM ${relation} WHERE m.id=$1 AND m.family_id=$2`, [id, user.familyId]);
    if (!row) throw new FamilyError(404, 'Recipe unavailable');
    const entry = menuEntryFromRow(row);
    if (!entry.curation.retryable) return { entry, started: false, generation: undefined };
    const generation = await setTask(tx, id, identity, credentialExpiresAt, true);
    return { entry: await entryById(tx, id), started: true, generation };
  });
}
export interface CurationJob { entryId: string; generation: string; lease: string; sourceUrl: string; expiresAt: number }
type StoredTask = MenuCurationRow & { familyId: string; sourceUrl: string };
async function task(db: FamilyDatabase, id: string, generation: string): Promise<StoredTask | null> {
  if (!parseMenuId(id) || !parseMenuId(generation)) return null;
  const row = await db.one<StoredTask>('SELECT c.entry_id AS "entryId",c.state,c.generation,c.scheduled_at AS "scheduledAt",c.expires_at AS "expiresAt",c.lease,c.google_subject AS "googleSubject",c.verified_email AS "verifiedEmail",c.credential_expires_at AS "credentialExpiresAt",m.family_id AS "familyId",m.source_url AS "sourceUrl" FROM menu_recipe_curations c JOIN menu_recipes m ON m.id=c.entry_id WHERE c.entry_id=$1 AND c.generation=$2', [id, generation]);
  if (!row) return null;
  const identity = verifiedIdentity({ googleSubject: row.googleSubject, email: row.verifiedEmail, emailVerified: true });
  if (!identity || identity.email !== row.verifiedEmail || !parseMenuSourceUrl(row.sourceUrl) || ![row.scheduledAt, row.expiresAt, row.credentialExpiresAt].every(value => Number.isSafeInteger(value) && value >= 0) || row.expiresAt < row.scheduledAt || row.expiresAt > Math.min(row.scheduledAt + 30000, row.credentialExpiresAt) || !['pending', 'processing', 'ready', 'failed'].includes(row.state) || (row.state === 'processing' ? !parseMenuId(row.lease) : row.lease !== null)) throw new Error('Storage unavailable');
  return row;
}
async function authorizedTask(db: FamilyDatabase, row: StoredTask, allowedEmails: unknown) {
  if (row.expiresAt <= Date.now() || row.credentialExpiresAt <= Date.now()) return false;
  try {
    const user = await requireMember(db, { googleSubject: row.googleSubject, email: row.verifiedEmail, emailVerified: true }, allowedEmails);
    return user.familyId === row.familyId && user.verifiedEmail === row.verifiedEmail && row.expiresAt > Date.now() && row.credentialExpiresAt > Date.now();
  } catch (error) { if (error instanceof FamilyError) return false; throw error; }
}
async function failTask(db: FamilyDatabase, id: string, generation: string, lease: string | null) {
  await db.execute("UPDATE menu_recipe_curations SET state='failed',lease=NULL WHERE entry_id=$1 AND generation=$2 AND lease IS NOT DISTINCT FROM $3::uuid AND state IN ('pending','processing')", [id, generation, lease]);
}
export async function failMenuRecipeCuration(db: FamilyDatabase, id: string, generation: string, lease: string | null = null) {
  await db.transaction(tx => failTask(tx, id, generation, lease));
}
export async function claimMenuRecipeCuration(db: FamilyDatabase, id: string, generation: string, allowedEmails: unknown): Promise<CurationJob | null> {
  return db.transaction(async tx => {
    const row = await task(tx, id, generation); if (!row || row.state !== 'pending') return null;
    if (!await authorizedTask(tx, row, allowedEmails)) { await failTask(tx, id, generation, null); return null; }
    const lease = randomUUID();
    await tx.execute("UPDATE menu_recipe_curations SET state='processing',lease=$3 WHERE entry_id=$1 AND generation=$2", [id, generation, lease]);
    return { entryId: id, generation, lease, sourceUrl: row.sourceUrl, expiresAt: row.expiresAt };
  });
}
export async function completeMenuRecipeCuration(db: FamilyDatabase, job: CurationJob, allowedEmails: unknown, value: unknown): Promise<boolean> {
  const recipe = parseMenuRecipe(value); if (!recipe) throw invalid();
  return db.transaction(async tx => {
    const row = await task(tx, job.entryId, job.generation);
    if (!row || row.state !== 'processing' || row.lease !== job.lease) return false;
    if (recipe.sourceUrl !== row.sourceUrl || !await authorizedTask(tx, row, allowedEmails)) { await failTask(tx, row.entryId, row.generation, row.lease); return false; }
    await tx.execute('UPDATE menu_recipes SET title=$2,summary=$3,image_url=$4,time_kind=$5,time_text=$6,category=CASE WHEN category_overridden THEN category ELSE $7 END WHERE id=$1', [row.entryId, recipe.title, recipe.summary, recipe.imageUrl, recipe.time?.kind ?? null, recipe.time?.text ?? null, recipe.category ?? null]);
    await tx.execute("UPDATE menu_recipe_curations SET state='ready',lease=NULL WHERE entry_id=$1 AND generation=$2 AND lease=$3", [row.entryId, row.generation, row.lease]);
    return true;
  });
}

/** Category-only editing; curation completion preserves this durable override. */
export async function updateMenuRecipeCategory(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, value: unknown, category: unknown) {
  const id = parseMenuId(value); if (!id || !isRecipeCategory(category)) throw invalid();
  requireGoogleIdentity(identity);
  return db.transaction(async tx => {
    const user = await requireMember(tx, identity, allowedEmails);
    const row = await tx.one<{ id: string }>('UPDATE menu_recipes SET category=$3,category_overridden=true WHERE id=$1 AND family_id=$2 RETURNING id', [id, user.familyId, category]);
    if (!row) throw new FamilyError(404, 'Recipe unavailable');
    return { entry: await entryById(tx, id) };
  });
}
