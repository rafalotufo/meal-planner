import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import type { FamilyDatabase } from '../../lib/db/connection.ts';
import { provisionFamily } from '../../lib/family-store.ts';
import { requireMember } from '../../lib/identity-access.ts';
import { listMenuRecipes, removeMenuRecipe, saveMenuRecipe } from '../../lib/menu/store.ts';
import { encodeMenuCursor } from '../../lib/menu/validation.ts';
import { testDatabase } from '../family/database.ts';

const first = { googleSubject: 'menu-first', email: 'menu.test.first@gmail.com', emailVerified: true as const };
const second = { googleSubject: 'menu-second', email: 'menu.test.second@gmail.com', emailVerified: true as const };
const allowed = [first.email, second.email];
const recipe = { title: 'Private family recipe', sourceUrl: 'https://example.test/private', imageUrl: null, summary: 'Private family choice.', time: null };

test('current family owners scope all reads/writes and foreign guessed IDs/cursors reveal no other entries', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    const member = await provisionFamily(db, first, allowed, false);
    await provisionFamily(db, second, allowed, false);
    const saved = await saveMenuRecipe(db, first, allowed, recipe);
    assert.deepEqual(await listMenuRecipes(db, second, allowed), { entries: [], nextCursor: null });
    assert.deepEqual(await listMenuRecipes(db, second, allowed, encodeMenuCursor(saved.entry)), { entries: [], nextCursor: null });
    assert.deepEqual(await removeMenuRecipe(db, second, allowed, saved.entry.id), await removeMenuRecipe(db, second, allowed, randomUUID()));
    assert.equal((await listMenuRecipes(db, first, allowed)).entries.length, 1);
    const separate = await saveMenuRecipe(db, second, allowed, recipe);
    assert.notEqual(separate.entry.id, saved.entry.id);
    const invited = { googleSubject: 'menu-joined', email: 'joined@example.test', emailVerified: true as const };
    await db.execute('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at,invitation_granted_at) VALUES ($1,$2,$3,$4,$5,$6)', [randomUUID(), invited.googleSubject, invited.email, member.familyId, 1, 1]);
    assert.deepEqual((await listMenuRecipes(db, invited, [])).entries, [saved.entry]);
    await removeMenuRecipe(db, invited, [], saved.entry.id);
    assert.equal((await listMenuRecipes(db, first, allowed)).entries.length, 0);
  } finally { await db.close(); await fixture.cleanup(); }
});

test('admission and membership are rechecked after the common write lock, not only at the outer session read', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    const member = await provisionFamily(db, first, allowed, false);
    await db.execute('UPDATE app_users SET invitation_granted_at=1 WHERE id=$1', [member.id]);
    await requireMember(db, first, []); // Equivalent outer verified session context.
    const denied = Object.create(db) as FamilyDatabase;
    denied.transaction = action => db.transaction(async tx => { await tx.execute('UPDATE app_users SET invitation_granted_at=NULL WHERE id=$1', [member.id]); return action(tx); });
    await assert.rejects(saveMenuRecipe(denied, first, [], recipe), { status: 403 });
    const missing = Object.create(db) as FamilyDatabase;
    missing.transaction = action => db.transaction(async tx => { await tx.execute('DELETE FROM app_users WHERE id=$1', [member.id]); return action(tx); });
    await assert.rejects(saveMenuRecipe(missing, first, allowed, recipe), { status: 403 });
    const saved = await saveMenuRecipe(db, first, allowed, recipe);
    await assert.rejects(removeMenuRecipe(denied, first, [], saved.entry.id), { status: 403 });
    assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 1);
    await db.execute('UPDATE app_users SET invitation_granted_at=NULL WHERE id=$1', [member.id]);
    await assert.rejects(listMenuRecipes(db, first, []), { status: 403 });
    await assert.rejects(saveMenuRecipe(db, { ...second, googleSubject: 'never-provisioned' }, allowed, recipe), { status: 403 });
  } finally { await db.close(); await fixture.cleanup(); }
});
