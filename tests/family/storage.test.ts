import assert from 'node:assert/strict';
import { test } from 'node:test';
import Database from 'better-sqlite3';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('committed family schema enforces membership and invitation integrity', async () => {
  const db = new Database(':memory:');
  try {
    db.pragma('foreign_keys = ON');
    const files = await readdir('drizzle').catch(() => [] as string[]);
    for (const file of files.filter((name) => name.endsWith('.sql')).sort()) db.exec(await readFile(join('drizzle', file), 'utf8'));
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
    assert.deepEqual(tables, [{ name: 'app_users' }, { name: 'families' }, { name: 'family_invitations' }]);
    db.prepare('INSERT INTO families (id,created_at) VALUES (?,?)').run('family', 1);
    const insert = db.prepare('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at) VALUES (?,?,?,?,?)');
    insert.run('user', 'subject', 'member@gmail.com', 'family', 1);
    assert.throws(() => insert.run('duplicate', 'subject', 'other@gmail.com', 'family', 1));
    assert.throws(() => insert.run('orphan', 'another', 'another@gmail.com', 'missing', 1));
    assert.throws(() => insert.run('unassigned', 'third', 'third@gmail.com', null, 1));
    assert.throws(() => db.prepare('DELETE FROM families WHERE id=?').run('family'));
    const invitation = db.prepare('INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES (?,?,?,?,?,?,?,?)');
    assert.throws(() => invitation.run('invalid', 'family', 'user', 'new@gmail.com', 'hash', 1, 10, 'accepted'));
    invitation.run('pending', 'family', 'user', 'new@gmail.com', 'hash', 1, 10, 'pending');
    assert.throws(() => invitation.run('unknown', 'family', 'user', 'new@gmail.com', 'hash2', 1, 10, 'unknown'));
  } finally { db.close(); }
});

test('explicit migrations are repeatable; runtime opening never creates a missing file', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'family-storage-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const { migrateDatabase } = await import('../../lib/db/migrate.ts');
  const { openDatabase } = await import('../../lib/db/connection.ts');
  const path = join(dir, 'family.sqlite');
  assert.throws(() => openDatabase(path));
  assert.throws(() => openDatabase('relative.sqlite'));
  migrateDatabase(path); migrateDatabase(path);
  const db = openDatabase(path);
  assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
  assert.equal(db.pragma('journal_mode', { simple: true }), 'wal');
  db.close();
  const empty = join(dir, 'empty.sqlite'); new Database(empty).close();
  assert.throws(() => openDatabase(empty));
});

test('changed migration history and partial schema fail closed without repair', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'family-tamper-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const { migrateDatabase } = await import('../../lib/db/migrate.ts');
  const { openDatabase } = await import('../../lib/db/connection.ts');
  const path = join(dir, 'family.sqlite'); migrateDatabase(path);
  const db = new Database(path);
  db.prepare("UPDATE __drizzle_migrations SET hash='changed'").run(); db.close();
  assert.throws(() => openDatabase(path));
  assert.throws(() => migrateDatabase(path));
  const partial = join(dir, 'partial.sqlite'); migrateDatabase(partial);
  const changed = new Database(partial); changed.exec('DROP INDEX users_family'); changed.close();
  assert.throws(() => openDatabase(partial));
  assert.throws(() => migrateDatabase(partial));
});

test('a failed explicit migration rolls back schema and ledger writes together', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'family-rollback-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const { migrateDatabase } = await import('../../lib/db/migrate.ts');
  const path = join(dir, 'family.sqlite');
  const original = new Database(path); original.exec('CREATE TABLE families (id TEXT PRIMARY KEY)'); original.close();
  assert.throws(() => migrateDatabase(path));
  const failed = new Database(path);
  assert.deepEqual(failed.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all(), [{ name: 'families' }]);
  failed.close();
});
