# Local development migration — 2026-11-24

The owner explicitly authorized: “approved, create a private backup and apply the
migration and runtime grants to the local development database only.” This is a
separate operational authorization; the human merge and release gates remain pending.

The reported authentication `Storage unavailable` failure was reproduced at the
storage boundary: local development had the reviewed initial schema and one
migration, while this branch requires two. The current catalog exactly matched
the original reviewed catalog before any change.

At 18:10 UTC, the operation revalidated the exact target
`127.0.0.1:5432/meal_planner_dev`, distinct `mp_migrator`/`mp_runtime` roles, and
valid initial history. It created a complete custom-format PostgreSQL backup at
`.data/postgres/backups/meal-planner-dev-before-saved-menu-2026-11-24T18-10-50.098Z.dump`.
The ignored private backup directory is mode 0700; the nonempty backup is mode
0600. `pg_restore --list` verified expected domain and migration-history table
data entries. Credentials were passed only in child environments, never arguments
or logs. The backup was not restored or uploaded.

The existing explicit `scripts/migrate-db.ts` operation exited 0, applying the
reviewed `0001_saved_recipe_menu` and runtime grants. Verification then passed:

- `openDatabase` using the application's actual runtime URL passed full migration
  history and exact catalog checks; the original storage-boundary error is resolved.
- Migration count increased from 1 to 2; the initial history entry is unchanged.
- Families: 1 before/after; users: 1 before/after; invitations: 0 before/after.
- The new menu table is empty.
- Runtime menu SELECT/INSERT/DELETE are allowed; UPDATE/TRUNCATE, migration-ledger
  INSERT, and public-schema CREATE remain denied.
- The backup and sanitized verification JSON remain ignored and private locally.

No application source changes or new test fixtures were needed. Existing migration,
privilege, and backup/restore regressions already cover this operation. No hosted
URL/database, merge, deployment, provider, or real OAuth flow was changed/tested.
The user can retry Google sign-in; successful live OAuth is not claimed here.
