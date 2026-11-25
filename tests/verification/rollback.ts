// Owned disposable regression fixtures only. Never import from application code.
import type { FamilyDatabase } from '../../lib/db/connection.ts';
import { compatibility } from '../../lib/db/compatibility.ts';
import { descriptorDigest } from '../../lib/db/migration-graph.ts';

/** Remove empty verification infrastructure before preserved historical rollback SQL. */
export async function rollbackEmptyVerificationFixture(db: FamilyDatabase) {
  const identity = await db.one<{ database: string; actor: string; owner: string }>('SELECT current_database() AS database,current_user AS actor,pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname=current_database()');
  if (!identity || !/^mp_test_[a-f0-9]{24}$/.test(identity.database) || identity.actor !== 'mp_test' || identity.owner !== 'mp_test') throw new Error('Owned disposable fixture required');
  const populated = await db.one<{ n: number }>(`SELECT
    (SELECT count(*) FROM verification_runs)+(SELECT count(*) FROM verification_capabilities)+
    (SELECT count(*) FROM verification_sessions)+(SELECT count(*) FROM verification_throttles)+
    (SELECT count(*) FROM app_users WHERE identity_kind='verification')+
    (SELECT count(*) FROM families WHERE identity_kind='verification') AS n`);
  if (!populated || populated.n !== 0) throw new Error('Verification fixture must be empty');
  const expected = compatibility.migrations.filter(row => !row.legacy).map(row => ({ id: row.id, hash: row.hash, descriptor_hash: descriptorDigest(row) })).sort((a, b) => a.id.localeCompare(b.id));
  const actual = await db.all('SELECT id,hash,descriptor_hash FROM __app_migrations ORDER BY id');
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Unexpected native fixture history');
  await db.execute('DROP TABLE verification_sessions,verification_capabilities,verification_throttles');
  await db.execute('ALTER TABLE app_users DROP CONSTRAINT app_users_run_family');
  await db.execute('DROP TABLE verification_runs');
  await db.execute('DROP TABLE __app_migrations');
}
