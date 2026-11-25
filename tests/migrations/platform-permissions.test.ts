import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePlatformPermissions, type PermissionContext, type RuntimeMembership, type NonOwnerDefaultPrivilege } from '../../lib/db/platform-permissions.ts';

const hosted: PermissionContext = { database: 'meal_planner', databaseOwner: 'neondb_owner', managedOwner: 'mp_migrator', cloudAdminSuperuser: true };
const native: PermissionContext = { database: 'meal_planner_dev', databaseOwner: 'mp_migrator', managedOwner: 'mp_migrator', cloudAdminSuperuser: false };
const creator: RuntimeMembership = { role: 'mp_runtime', member: 'neondb_owner', grantor: 'cloud_admin', admin: true, inherit: false, set: false };
const platformDefaults: NonOwnerDefaultPrivilege[] = [
  ...['SELECT','UPDATE','USAGE'].map(privilege => ({owner:'cloud_admin',grantor:'cloud_admin',schema:'public',objectType:'S',grantee:'neon_superuser',privilege,grantable:true})),
  ...['DELETE','INSERT','MAINTAIN','SELECT','TRUNCATE','UPDATE'].map(privilege => ({owner:'cloud_admin',grantor:'cloud_admin',schema:'public',objectType:'r',grantee:'neon_superuser',privilege,grantable:true})),
];

test('exact catalog-bound hosted creator/default baseline is accepted without modifying permissions', () => {
  assert.doesNotThrow(() => validatePlatformPermissions(hosted,[creator],platformDefaults));
  assert.doesNotThrow(() => validatePlatformPermissions(hosted,[creator],[...platformDefaults].reverse()), 'catalog row order is not identity');
});
test('existing empty normal policy is preserved without adding a database-name whitelist', () => {
  for(const context of [native,{...native,database:'mp_test_'+'a'.repeat(24),databaseOwner:'mp_test',managedOwner:'mp_test'},{...native,database:'other_explicit_database'},{...native,database:'meal_planner'}]) {
    assert.doesNotThrow(() => validatePlatformPermissions(context,[],[]));
    assert.throws(() => validatePlatformPermissions(context,[creator],platformDefaults),/permission-failure/);
  }
});
test('recognized hosted context requires exact nonempty creator and default sets', () => {
  for(const [memberships,defaults] of [[[],platformDefaults],[[creator],[]],[[],[]],[[creator],platformDefaults.slice(1)],[[creator], [...platformDefaults,platformDefaults[0]]],[[creator,creator],platformDefaults]] as const) {
    assert.throws(() => validatePlatformPermissions(hosted,memberships,defaults),/permission-failure/);
  }
});
for(const [field,value] of [['database','other'],['databaseOwner','other'],['managedOwner','other'],['cloudAdminSuperuser',false]] as const) {
  test(`hosted baseline cannot activate with wrong actual context ${field}`,()=>{
    assert.throws(()=>validatePlatformPermissions({...hosted,[field]:value},[creator],platformDefaults),/permission-failure/);
    assert.throws(()=>validatePlatformPermissions({...hosted,[field]:value},[],[]),/permission-failure/);
  });
}
for(const [field,value] of [['role','other'],['member','other'],['grantor','neondb_owner'],['admin',false],['inherit',true],['set',true]] as const) {
  test(`creator membership rejects changed ${field}`,()=>{
    assert.throws(()=>validatePlatformPermissions(hosted,[{...creator,[field]:value}],platformDefaults),/permission-failure/);
  });
}
test('all outward runtime and additional inbound memberships fail closed',()=>{
  for(const extra of [{...creator,role:'neon_superuser',member:'mp_runtime'},{...creator,member:'other'},creator]) {
    assert.throws(()=>validatePlatformPermissions(hosted,[creator,extra],platformDefaults),/permission-failure/);
    assert.throws(()=>validatePlatformPermissions(native,[extra],[]),/permission-failure/);
  }
});
for(const [field,value] of [['owner','mp_migrator'],['grantor','neondb_owner'],['schema',null],['schema','other'],['objectType','f'],['grantee','mp_runtime'],['privilege','REFERENCES'],['grantable',false]] as const) {
  test(`platform default baseline rejects changed ${field}=${String(value)}`,()=>{
    const defaults=structuredClone(platformDefaults);defaults[0]={...defaults[0],[field]:value};
    assert.throws(()=>validatePlatformPermissions(hosted,[creator],defaults),/permission-failure/);
  });
}
test('managed-creator non-owner defaults remain prohibited in every context',()=>{
  const managed={...platformDefaults[0],owner:'mp_migrator',grantor:'mp_migrator',grantee:'mp_runtime',grantable:false};
  assert.throws(()=>validatePlatformPermissions(hosted,[creator],[...platformDefaults,managed]),/permission-failure/);
  assert.throws(()=>validatePlatformPermissions(native,[],[managed]),/permission-failure/);
});
test('malformed fields, unknown fields and missing actual bindings never authorize exceptions',()=>{
  const invalidContexts: unknown[]=[null,{}, {...hosted,cloudAdminSuperuser:'true'},{...hosted,managedOwner:undefined},{...hosted,override:true}];
  for(const context of invalidContexts) {
    assert.throws(()=>validatePlatformPermissions(context as PermissionContext,[creator],platformDefaults),/permission-failure/);
    assert.throws(()=>validatePlatformPermissions(context as PermissionContext,[],[]),/permission-failure/);
  }
  const invalidMemberships: unknown[]=[null,{}, {...creator,admin:'true'},{...creator,set:undefined},{...creator,extra:true}];
  for(const row of invalidMemberships) assert.throws(()=>validatePlatformPermissions(hosted,[row as RuntimeMembership],platformDefaults),/permission-failure/);
  const invalidDefaults: unknown[]=[null,{}, {...platformDefaults[0],grantable:'true'},{...platformDefaults[0],grantor:undefined},{...platformDefaults[0],extra:true}];
  for(const row of invalidDefaults) {
    const defaults=structuredClone(platformDefaults);defaults[0]=row as NonOwnerDefaultPrivilege;
    assert.throws(()=>validatePlatformPermissions(hosted,[creator],defaults),/permission-failure/);
  }
});

test('malformed catalog arrays are rejected before an empty-policy fallback',()=>{
  for(const rows of [null,{},''] as unknown[]) {
    assert.throws(()=>validatePlatformPermissions(native,rows as RuntimeMembership[],[]),/permission-failure/);
    assert.throws(()=>validatePlatformPermissions(native,[],rows as NonOwnerDefaultPrivilege[]),/permission-failure/);
  }
});


test('actual provider indicators require full hosted policy even with empty catalog arrays',()=>{
  for(const context of [{...native,cloudAdminSuperuser:true},{...native,databaseOwner:'neondb_owner'}]) {
    assert.throws(()=>validatePlatformPermissions(context,[],[]),/permission-failure/);
  }
});
