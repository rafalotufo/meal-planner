import { Pool, types, type PoolClient } from 'pg';
import { attachDatabasePool } from '@vercel/functions/db-connections';
import { validateDatabase, type ValidationOptions } from './validation';

export function validateDatabaseUrl(value: string | undefined): URL {
  try {
    if (!value || value.trim() !== value) throw new Error();
    const url = new URL(value);
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.username || !url.password || url.pathname.length < 2 || url.hash || url.searchParams.getAll('sslmode').length > 1 || [...url.searchParams.keys()].some((key) => key !== 'sslmode') || (local ? ![null, 'disable', 'verify-full'].includes(url.searchParams.get('sslmode')) : url.searchParams.get('sslmode') !== 'verify-full')) throw new Error();
    return url;
  } catch { throw new Error('Storage unavailable'); }
}
export function validateMigrationPair(owner: URL, runtime: URL) {
  const runtimeHost = runtime.hostname.endsWith('.neon.tech') ? runtime.hostname.replace(/-pooler(?=\.)/, '') : runtime.hostname;
  if (owner.hostname !== runtimeHost || (owner.port || '5432') !== (runtime.port || '5432') || owner.pathname !== runtime.pathname || owner.username === runtime.username) throw new Error('Separate owner/runtime roles on the same database required');
}
// Parse only this pool's bigint values; never change pg's global type registry.
function safeInteger(value: string) {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new Error('Storage unavailable');
  return number;
}
export function connectDatabase(value: string) {
  const url = validateDatabaseUrl(value);
  const pool = new Pool({
    connectionString: url.href, max: 4, connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000, allowExitOnIdle: true,
    query_timeout: 12000,
    types: { getTypeParser: (oid, format) => oid === 20 && format !== 'binary' ? safeInteger : types.getTypeParser(oid, format) },
  });
  attachDatabasePool(pool);
  return new FamilyDatabase(pool);
}
export const FAMILY_WRITE_LOCK = 73462901;
export class FamilyDatabase {
  constructor(private readonly pool: Pool, private readonly client?: PoolClient, private readonly deadline?: { at: number; expired: boolean }) {
    if (!client) pool.on('error', () => { /* Idle disconnects must not crash the process or expose connection details. */ });
  }
  async all<Row extends object = Record<string, unknown>>(sql: string, values: readonly unknown[] = []): Promise<Row[]> {
    this.checkDeadline();
    if (!this.client) return this.readOnly(tx => tx.all<Row>(sql, values));
    return (await this.client.query<Row>(sql, [...values])).rows;
  }
  async one<Row extends object = Record<string, unknown>>(sql: string, values: readonly unknown[] = []): Promise<Row | undefined> {
    return (await this.all<Row>(sql, values))[0];
  }
  async execute(sql: string, values: readonly unknown[] = []): Promise<void> {
    this.checkDeadline();
    if (!this.client) return this.transaction(tx => tx.execute(sql, values));
    await this.client.query(sql, [...values]);
  }
  private checkDeadline() {
    if (this.deadline && (this.deadline.expired || Date.now() >= this.deadline.at)) throw new Error('Verification deadline');
  }
  /** Owns and destroys its connection on expiry; timed-out callbacks cannot issue later SQL. */
  async verificationTransaction<T>(at: number, action: (db: FamilyDatabase) => Promise<T>): Promise<T> {
    if (this.client || !Number.isSafeInteger(at) || at <= Date.now()) throw new Error('Verification deadline');
    const state = { at, expired: false };
    let client: PoolClient | undefined;
    let released = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const expiry = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        state.expired = true;
        if (client && !released) { released = true; client.release(true); }
        reject(new Error('Verification deadline'));
      }, Math.max(1, at - Date.now()));
    });
    const work = (async () => {
      const acquired = await this.pool.connect();
      if (state.expired || Date.now() >= at) { acquired.release(true); throw new Error('Verification deadline'); }
      client = acquired;
      try {
        await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
        const remaining = Math.max(1, at - Date.now() - 25);
        await client.query("SELECT set_config('statement_timeout',$1,true), set_config('lock_timeout',$1,true), set_config('idle_in_transaction_session_timeout',$1,true), set_config('search_path','pg_catalog, public, pg_temp',true)", [String(remaining)]);
        await client.query('SELECT pg_advisory_xact_lock($1)', [FAMILY_WRITE_LOCK]);
        const tx = new FamilyDatabase(this.pool, client, state);
        tx.checkDeadline();
        const result = await action(tx);
        tx.checkDeadline();
        await client.query('COMMIT');
        return result;
      } catch (error) {
        if (!released) { try { await client.query('ROLLBACK'); } catch { released = true; client.release(true); } }
        if (state.expired || Date.now() >= at - 25 || (error && typeof error === 'object' && 'code' in error && ['57014', '55P03'].includes(String(error.code)))) throw new Error('Verification deadline');
        throw error;
      } finally { if (!released) { released = true; client.release(); } }
    })();
    try { return await Promise.race([work, expiry]); }
    finally { if (timer) clearTimeout(timer); }
  }
  async transaction<T>(action: (db: FamilyDatabase) => Promise<T>, lock = FAMILY_WRITE_LOCK): Promise<T> {
    if (this.client) throw new Error('Nested transaction is unsupported');
    const client = await this.pool.connect();
    let failed = false;
    try {
      await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
      // Transaction-local settings work through Neon/PgBouncer transaction pooling.
      await client.query("SET LOCAL statement_timeout = '10s'; SET LOCAL lock_timeout = '5s'; SET LOCAL idle_in_transaction_session_timeout = '15s'; SET LOCAL search_path = pg_catalog, public, pg_temp");
      await client.query('SELECT pg_advisory_xact_lock($1)', [lock]);
      const result = await action(new FamilyDatabase(this.pool, client));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { failed = true; }
      throw error;
    } finally { client.release(failed); }
  }
  async readOnly<T>(action: (db: FamilyDatabase) => Promise<T>): Promise<T> {
    if (this.client) throw new Error('Nested transaction is unsupported');
    const client = await this.pool.connect();
    let failed = false;
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      await client.query("SET LOCAL statement_timeout = '10s'; SET LOCAL lock_timeout = '5s'; SET LOCAL idle_in_transaction_session_timeout = '15s'; SET LOCAL search_path = pg_catalog, public, pg_temp");
      const result = await action(new FamilyDatabase(this.pool, client));
      await client.query('COMMIT'); return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { failed = true; }
      throw error;
    } finally { client.release(failed); }
  }
  async close() { await this.pool.end(); }
}
export async function catalogSignature(db: FamilyDatabase) {
  return db.all<{ kind: string; name: string; definition: string }>(`
    SELECT 'column' AS kind, c.relname || '.' || a.attname AS name,
      format_type(a.atttypid, a.atttypmod) || ':' || a.attnotnull || ':' || coalesce(pg_get_expr(d.adbin, d.adrelid), '') AS definition
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_attribute a ON a.attrelid=c.oid
    LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum
    WHERE n.nspname='public' AND c.relkind='r' AND c.relname <> '__drizzle_migrations' AND a.attnum>0 AND NOT a.attisdropped
    UNION ALL SELECT 'constraint', c.relname || '.' || co.conname, pg_get_constraintdef(co.oid)
    FROM pg_constraint co JOIN pg_class c ON c.oid=co.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname <> '__drizzle_migrations'
    UNION ALL SELECT 'index', indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename <> '__drizzle_migrations'
    UNION ALL SELECT 'trigger', c.relname || '.' || t.tgname, pg_get_triggerdef(t.oid)
    FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND NOT t.tgisinternal
    UNION ALL SELECT 'function', p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')', pg_get_functiondef(p.oid)
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind IN ('f','p')
    UNION ALL SELECT 'policy', tablename || '.' || policyname, coalesce(qual,'') || ':' || coalesce(with_check,'') || ':' || cmd || ':' || roles::text
    FROM pg_policies WHERE schemaname='public'
    UNION ALL SELECT 'relation', c.relname, c.relkind::text || ':' || c.relrowsecurity || ':' || c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname <> '__drizzle_migrations' AND c.relname <> '__drizzle_migrations_pkey'
    ORDER BY kind, name`);
}
export async function openDatabase(url: string, options: ValidationOptions = {}) {
  const db = connectDatabase(url);
  try { await db.readOnly(async tx => { await validateDatabase(tx, options); }); return db; }
  catch { await db.close(); throw new Error('Storage unavailable'); }
}
