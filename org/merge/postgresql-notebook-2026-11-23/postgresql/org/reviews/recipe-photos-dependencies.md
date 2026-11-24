# Recipe-photo dependency graph inspection

Date: 2026-11-23. Author: senior-developer. Planning evidence; application
package files and installed dependencies were not changed by this inspection.

## Method and results

Copied only the current package manifest/lock to
`/private/tmp/meal-planner-recipe-photos-dependency-review/`, added proposed
exact versions there, and resolved with `npm install --package-lock-only
--ignore-scripts --no-fund`. Exit 0: audited 396 packages, four moderate
findings. No node_modules directory was created and no package scripts ran.

The temporary directory selected a broken system Node 22 binary on the first
attempt (missing ICU dynamic library, exit 134 before npm ran). Repeated using
the repository's tested Node 24.15.0/npm 11.12.1 executable paths; the successful
resolution and audits use those paths. No system runtime was changed.

Prospective lock delta: eight additions below, zero existing version changes,
zero removals. Every added entry has an integrity hash and no `hasInstallScript`
flag. Registry metadata was retrieved for every exact added version without
executing its contents; none is marked deprecated, and none declares preinstall,
install, or postinstall hooks.

Lock SHA-256 fingerprints for comparison:

- Application baseline: `07312d3b692e6b7539c5a4633911543a391e1ee42255e3b1ee7d2becff9cdb20`.
- Prospective graph: `8fecdb77b122d956f14f6fb2d6ee075c5a17cbd0ebbc3545b1cb6fd5e53fdc82`.

| Added package | Version | Compatibility/script observations |
| --- | --- | --- |
| htmlparser2 | 10.1.0 | Dual import/require exports with corresponding bundled types. Prepare builds published outputs; not executed here. |
| ipaddr.js | 2.5.0 | CommonJS entry, bundled types, Node >=10. No prepare/install hooks. |
| dom-serializer | 2.0.0 | Dual exports/types; prepare build not executed. |
| domelementtype | 2.3.0 | Dual exports/types; prepare build not executed. |
| domhandler | 5.0.3 | Dual exports/types; prepare build not executed. |
| domutils | 3.2.2 | Dual exports/types; prepare build not executed. |
| entities | 7.0.1 | Dual exports/types; prepublish build not executed. |
| entities (nested under dom-serializer) | 4.5.0 | Dual exports/types; prepare build not executed. |

Metadata is from the public npm registry exact-version endpoints. Prepare,
test, lint and publish scripts are inspected metadata, not instructions or
authorization to execute them. No new package requires an install hook.

## Audit evidence

- `npm audit --json` against the prospective lock: exit 1 for the existing four
  moderate findings; zero high/critical findings. Detailed machine-readable
  output is retained in temporary `audit-full.json`.
- `npm audit --omit=dev --json`: exit 0; zero production vulnerabilities.
  Machine-readable output is temporary `audit-production.json`.
- New runtime graph: no audit finding attributed to the eight added entries.
  Existing development-tool advisories are not suppressed or removed.

## Implementation gate and limits

This is metadata/lock inspection, not dependency installation or an independent
security verdict. Install only after plan approval, keep exact versions and
scripts disabled, and compare the application lock delta with this reviewed
graph. If identical, reuse this inspection rather than repeating an unchanged
audit solely for reassurance. A changed graph or a new reachable security
finding requires review before proceeding. Test real imports/types and the
classifier's exact address-range behavior after authorized installation.

The application source, package files, lockfile, installed node_modules, org
state, ledger and Git history remain untouched by this planning inspection.

## Authorized installation checkpoint

After independent plan approval, `npm install --save-exact --ignore-scripts
htmlparser2@10.1.0 ipaddr.js@2.5.0` exited 0 and added exactly eight packages.
The application lockfile matches the reviewed prospective lock byte-for-byte
(SHA-256 above), so the reviewed graph/audit evidence applies without drift.
Actual classifier checks also identify IPv4/IPv6 documentation, 6to4, Teredo,
and mapped addresses separately from public unicast. No install script ran.
