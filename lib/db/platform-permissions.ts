import { StorageDiagnostic } from './migration-graph';

export interface PermissionContext {
  database: string;
  databaseOwner: string;
  managedOwner: string;
  cloudAdminSuperuser: boolean;
}
export interface RuntimeMembership {
  role: string;
  member: string;
  grantor: string;
  admin: boolean;
  inherit: boolean;
  set: boolean;
}
export interface NonOwnerDefaultPrivilege {
  owner: string;
  grantor: string;
  schema: string | null;
  objectType: string;
  grantee: string;
  privilege: string;
  grantable: boolean;
}
const denied = (): never => { throw new StorageDiagnostic('permission-failure'); };
function exactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype &&
    Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function strings(value: Record<string, unknown>, keys: string[]) {
  return keys.every(key => typeof value[key] === 'string' && value[key] !== '');
}
const expectedDefaults = new Set([
  'S:SELECT','S:UPDATE','S:USAGE',
  'r:DELETE','r:INSERT','r:MAINTAIN','r:SELECT','r:TRUNCATE','r:UPDATE',
]);

// Called only with catalog-derived context by checkSecurity. This finite policy
// does not make trusted platform administration powerless: creator ADMIN grants
// can change memberships. Actual runtime flags and object/effective ACL checks
// remain separate and mandatory.
export function validatePlatformPermissions(context: PermissionContext, memberships: readonly RuntimeMembership[], defaults: readonly NonOwnerDefaultPrivilege[]): void {
  if (!exactKeys(context,['database','databaseOwner','managedOwner','cloudAdminSuperuser']) ||
      !strings(context,['database','databaseOwner','managedOwner']) || typeof context.cloudAdminSuperuser !== 'boolean' ||
      !Array.isArray(memberships) || !Array.isArray(defaults)) denied();
  for (const row of memberships) {
    if (!exactKeys(row,['role','member','grantor','admin','inherit','set']) || !strings(row,['role','member','grantor']) ||
        typeof row.admin !== 'boolean' || typeof row.inherit !== 'boolean' || typeof row.set !== 'boolean') denied();
  }
  for (const row of defaults) {
    if (!exactKeys(row,['owner','grantor','schema','objectType','grantee','privilege','grantable']) ||
        !strings(row,['owner','grantor','objectType','grantee','privilege']) ||
        row.schema !== null && typeof row.schema !== 'string' || typeof row.grantable !== 'boolean') denied();
  }
  const providerIndicated = context.databaseOwner === 'neondb_owner' || context.cloudAdminSuperuser;
  if (!providerIndicated) {
    // Preserve the pre-existing empty policy for normal databases; no new
    // database-name whitelist or caller/environment bypass is introduced.
    if (memberships.length || defaults.length) denied();
    return;
  }
  if (context.database !== 'meal_planner' || context.databaseOwner !== 'neondb_owner' ||
      context.managedOwner !== 'mp_migrator' || !context.cloudAdminSuperuser) denied();
  if (memberships.length !== 1) denied();
  const creator = memberships[0];
  if (creator.role !== 'mp_runtime' || creator.member !== 'neondb_owner' || creator.grantor !== 'cloud_admin' ||
      !creator.admin || creator.inherit || creator.set) denied();
  if (defaults.length !== expectedDefaults.size) denied();
  const seen = new Set<string>();
  for (const row of defaults) {
    const key = `${row.objectType}:${row.privilege}`;
    if (row.owner !== 'cloud_admin' || row.grantor !== 'cloud_admin' || row.schema !== 'public' ||
        row.grantee !== 'neon_superuser' || !row.grantable || !expectedDefaults.has(key) || seen.has(key)) denied();
    seen.add(key);
  }
}
