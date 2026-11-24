# Native local recovery — actual observations

Date: 2026-11-24. Reviewed combined runtime source: `14fabbcb51365409bce2628000830404c98d73e3`.

Initial read-only diagnosis found reachable native PostgreSQL with four applied
weekly-planning migrations, incompatible with this URL-curation branch's third
migration. Anonymous localhost/sign-in worked, but the configured runtime schema
check failed. The owner reported authentication and explicit migration failure,
then chose combining the branch with latest main and existing local data.

The root's guarded helper `prepare` later returned `native-prefix-drift` before
mkdtemp/backup or any schema/data write. Read-only reinspection found that the
native database had changed externally during QA: all five migration hashes and
timestamps now exactly match the combined source, including curation0004.
The actor is unknown; this run did not apply that migration. No pre-cutover
backup or actual native before/after row fingerprint comparison is claimed.
The isolated four-to-five data-preservation proof is separately documented in
`main-integration-verification.md` and must not be mislabeled as native evidence.

Actual read-only native verification passed:

- Full runtime schema/catalog/history compatibility via openDatabase.
- Required mp_runtime companion SELECT/INSERT/UPDATE; menu SELECT/INSERT/DELETE
  and metadata-column UPDATE; weekly weeks/suggestions SELECT/INSERT/UPDATE and
  approvals SELECT/INSERT/UPDATE/DELETE.
- Denied menu ID/family/source/savedAt UPDATE, menu/companion TRUNCATE, companion
  DELETE, migration-ledger INSERT/UPDATE/DELETE and public-schema CREATE.
- No other native development database client was observed before restart.
- No matching installed LaunchAgent plist, loaded launch job or user cron entry
  for MealPlanner/meal-planner/generate-meal-plans was found; no job was changed.

Root started the combined production preview on port3000 (`pnpm run start`),
Ready in136ms, and left it running. Checks returned home307 to/sign-in,
sign-in200 and Google sign-in initiation200 with a generated authorization URL.
No Google callback was fabricated or automated by the root.
The owner then explicitly confirmed: “Sign-in works now.” This verifies actual
Google sign-in beyond the anonymous/initiation checks. The owner subsequently
requested “Merge to main,” authorizing the reviewed local-main merge only.

No additional migration, ledger rewrite, data deletion/import, backup restore,
hosted action, provider search, scheduler activation, push or deployment was
performed by this recovery. The archived native helper is hardened and reviewed
but its apply mode MUST NOT run against the already-compatible native state.
