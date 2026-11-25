import type { FamilyDatabase } from './connection';
import { StorageDiagnostic, type SchemaProfile } from './migration-graph';
import { validatePlatformPermissions, type PermissionContext, type RuntimeMembership, type NonOwnerDefaultPrivilege } from './platform-permissions';

const denied = () => { throw new StorageDiagnostic('permission-failure'); };
export async function checkSecurity(db: FamilyDatabase, profile: SchemaProfile, presence: { legacy: boolean; native: boolean }, ownerTooling: boolean, requireGrants: boolean) {
  const identity = await db.one<{ actor: string; owner: string; database: string; databaseOwner: string; cloudAdminSuperuser: boolean }>("SELECT current_user AS actor, current_database() AS database, pg_get_userbyid(datdba) AS \"databaseOwner\", coalesce((SELECT rolsuper FROM pg_roles WHERE rolname='cloud_admin'),false) AS \"cloudAdminSuperuser\", CASE WHEN current_database() ~ '^mp_test_[a-f0-9]{24}$' AND pg_get_userbyid(datdba)='mp_test' THEN 'mp_test' ELSE 'mp_migrator' END AS owner FROM pg_database WHERE datname=current_database()");
  if (!identity || (ownerTooling ? identity.actor !== identity.owner : identity.actor !== 'mp_runtime' || identity.actor === identity.owner)) denied();
  const role = await db.one<{ unsafe: boolean }>(`SELECT rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls AS unsafe FROM pg_roles r WHERE rolname='mp_runtime'`);
  if (!role || role.unsafe) denied();
  const memberships = await db.all<RuntimeMembership>(`SELECT pg_get_userbyid(roleid) AS role, pg_get_userbyid(member) AS member, pg_get_userbyid(grantor) AS grantor, admin_option AS admin, inherit_option AS inherit, set_option AS "set" FROM pg_auth_members WHERE roleid=(SELECT oid FROM pg_roles WHERE rolname='mp_runtime') OR member=(SELECT oid FROM pg_roles WHERE rolname='mp_runtime')`);
  const defaults = await db.all<NonOwnerDefaultPrivilege>(`SELECT pg_get_userbyid(d.defaclrole) AS owner, pg_get_userbyid(a.grantor) AS grantor, n.nspname AS schema, d.defaclobjtype::text AS "objectType", CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee, a.privilege_type AS privilege, a.is_grantable AS grantable FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace WHERE a.grantee<>d.defaclrole`);
  const context: PermissionContext = { database: identity!.database, databaseOwner: identity!.databaseOwner, managedOwner: identity!.owner, cloudAdminSuperuser: identity!.cloudAdminSuperuser };
  validatePlatformPermissions(context, memberships, defaults);
  // Unsupported security-bearing objects are forbidden by this finite contract.
  // A future reviewed function/trigger/policy profile requires validator support.
  const unexpected = await db.one<{ bad: boolean }>(`SELECT
    EXISTS (SELECT 1 FROM pg_namespace WHERE nspname NOT IN ('public','information_schema') AND nspname !~ '^pg_') OR
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_operator p JOIN pg_namespace n ON n.oid=p.oprnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND NOT (t.typtype='c' AND t.typrelid<>0) AND NOT EXISTS (SELECT 1 FROM pg_type base WHERE base.oid=t.typelem AND base.typtype='c' AND base.typrelid<>0)) OR
    EXISTS (SELECT 1 FROM pg_extension WHERE extname<>'plpgsql') OR
    EXISTS (SELECT 1 FROM pg_collation p JOIN pg_namespace n ON n.oid=p.collnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_conversion p JOIN pg_namespace n ON n.oid=p.connamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_statistic_ext p JOIN pg_namespace n ON n.oid=p.stxnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_ts_config p JOIN pg_namespace n ON n.oid=p.cfgnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_ts_dict p JOIN pg_namespace n ON n.oid=p.dictnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_ts_parser p JOIN pg_namespace n ON n.oid=p.prsnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_ts_template p JOIN pg_namespace n ON n.oid=p.tmplnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_event_trigger) OR
    EXISTS (SELECT 1 FROM pg_rewrite r JOIN pg_class c ON c.oid=r.ev_class JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public') OR
    EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND (NOT t.tgisinternal OR t.tgenabled<>'O')) OR
    EXISTS (SELECT 1 FROM pg_constraint co JOIN pg_class c ON c.oid=co.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND (NOT co.convalidated OR co.condeferrable OR co.condeferred)) OR
    EXISTS (SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND (NOT i.indisvalid OR NOT i.indisready OR NOT i.indislive)) OR
    EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND (pg_get_userbyid(c.relowner)<>$1 OR c.relrowsecurity OR c.relforcerowsecurity OR c.relpersistence<>'p' OR c.reloptions IS NOT NULL)) OR
    EXISTS (SELECT 1 FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_type typ ON typ.oid=a.atttypid WHERE n.nspname='public' AND a.attnum>0 AND NOT a.attisdropped AND (a.attidentity<>'' OR a.attgenerated<>'' OR a.attoptions IS NOT NULL OR a.attcollation<>typ.typcollation)) AS bad`, [identity!.owner]);
  if (unexpected?.bad) throw new StorageDiagnostic('incompatible-schema');
  const grants = { ...profile.grants };
  if (presence.legacy) grants.__drizzle_migrations = ['SELECT'];
  if (presence.native) grants.__app_migrations = ['SELECT'];
  const acls = await db.all<{ name: string; grantee: string; privilege: string; grantable: boolean }>(`
    SELECT c.relname AS name, CASE WHEN acl.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(acl.grantee) END AS grantee, acl.privilege_type AS privilege, acl.is_grantable AS grantable
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) acl WHERE n.nspname='public' AND c.relkind='r'
    UNION ALL SELECT c.relname||'.'||a.attname,CASE WHEN acl.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(acl.grantee) END,acl.privilege_type,acl.is_grantable
    FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(a.attacl) acl WHERE n.nspname='public' AND a.attnum>0 AND NOT a.attisdropped`);
  for (const acl of acls) {
    if (acl.grantee === identity!.owner) continue;
    if (acl.grantee !== 'mp_runtime' || acl.grantable || !grants[acl.name]?.includes(acl.privilege)) denied();
  }
  const schema = await db.one<{ unsafe: boolean }>(`SELECT has_database_privilege('mp_runtime',current_database(),'CREATE') OR has_schema_privilege('mp_runtime','public','CREATE') OR EXISTS (SELECT 1 FROM pg_namespace n CROSS JOIN LATERAL aclexplode(n.nspacl) a WHERE n.nspname='public' AND a.grantee<>n.nspowner AND NOT (pg_get_userbyid(a.grantee)=$1 AND a.privilege_type IN ('USAGE','CREATE') AND NOT a.is_grantable) AND NOT (a.grantee=0 AND a.privilege_type='USAGE' AND NOT a.is_grantable) AND NOT (a.grantee=(SELECT oid FROM pg_roles WHERE rolname='mp_runtime') AND a.privilege_type='USAGE' AND NOT a.is_grantable)) AS unsafe`, [identity!.owner]);
  if (schema?.unsafe) denied();
  const namespace = await db.one<{ ok: boolean }>("SELECT (pg_get_userbyid(nspowner)='pg_database_owner' OR nspowner=(SELECT datdba FROM pg_database WHERE datname=current_database())) AS ok FROM pg_namespace WHERE nspname='public'");
  if (!namespace?.ok) denied();
  if (!requireGrants) return;
  if (!(await db.one<{ ok: boolean }>("SELECT has_schema_privilege('mp_runtime','public','USAGE') AS ok"))?.ok) denied();
  // Test actual role-qualified effective privileges, including inherited/PUBLIC
  // grants and table-level privilege implications for each protected column.
  for (const [name, required] of Object.entries(grants)) {
    const [table, column] = name.split('.');
    for (const privilege of required) {
      const result = column
        ? await db.one<{ ok: boolean }>('SELECT has_column_privilege($1,$2,$3,$4) AS ok', ['mp_runtime', `public.${table}`, column, privilege])
        : await db.one<{ ok: boolean }>('SELECT has_table_privilege($1,$2,$3) AS ok', ['mp_runtime', `public.${table}`, privilege]);
      if (!result?.ok) denied();
    }
  }
}
export async function applyRuntimeGrants(db: FamilyDatabase, profile: SchemaProfile, presence: { legacy: boolean; native: boolean }) {
  // Namespace ownership stays with bootstrap (not necessarily the migrator).
  // Setup must already grant runtime USAGE; final validation verifies it.
  for (const [name, privileges] of Object.entries(profile.grants)) {
    const [table,column] = name.split('.');
    // Names/privileges have already passed the trusted manifest allowlist.
    await db.execute(column ? `GRANT ${privileges.map(p => `${p} (${column})`).join(', ')} ON public.${table} TO mp_runtime` : `GRANT ${privileges.join(', ')} ON public.${table} TO mp_runtime`);
  }
  if (presence.legacy) await db.execute('GRANT SELECT ON public.__drizzle_migrations TO mp_runtime');
  if (presence.native) await db.execute('GRANT SELECT ON public.__app_migrations TO mp_runtime');
}
