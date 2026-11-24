---
artifact: saved-recipe-menu-release-audit
release_source: 17881438e3c68f0099e063e714560682c93bd0fb
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: known-moderate-deferred
review_again_by: 2026-12-01
---

# Pinned release audit — existing esbuild moderate advisory

Disposition: retain the known moderate advisory as a documented deferred tooling
issue; no newly reachable Production serve path found in source1788143. Preserve
the actual `pnpm audit --prod` exit1; do not call the audit clean or zero findings.
No forced upgrade, override, dependency change or new release source is proposed.

Parent reported one advisory in the production audit graph, GHSA-67mh-4wv8-2f99,
through Better Auth's Drizzle Kit peer/tooling chain to @esbuild-kit and old
esbuild. Independently inspected the installed manifests/lock: drizzle-kit0.31.11
uses @esbuild-kit/esm-loader, whose core-utils3.3.2 depends on esbuild~0.18.20.
Better Auth declares Drizzle Kit as an optional peer. This explains graph presence;
it does not prove a Production HTTP listener invokes the vulnerable API.

The [maintainer advisory](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)
identifies affected esbuild versions through0.24.2 and patched versions from0.25.0.
The relevant exposure is the development serve API's permissive CORS, allowing
an unrelated website to read that server's content. It is not an assertion that
using esbuild's transform/build API by itself exposes such a server.

Source reachability review:

- Production is `next start`; build is the reviewed metadata verifier followed
  by `next build --webpack`; local dev is `next dev` (`package.json`). No esbuild
  serve process/script or direct esbuild/Drizzle Kit runtime import was found in
  application, libraries or operator migration scripts.
- Runtime SQL uses native pg and reviewed metadata. Explicit migrations use the
  public drizzle-orm migration loader, not a hosted Drizzle Kit development server.
- The installed @esbuild-kit core utility imports esbuild for transform tooling;
  no serve invocation was found in that utility. Dependency presence is not
  represented as absence from every installed/bundled artifact.
- Pins and lockfile are unchanged from saved-menu feature6458023 to release
  source1788143. Relative to main6efc2cf, the package change is the test:menu
  script; no new esbuild version or vulnerable serving mode is introduced.

Based on the advisory's prerequisites and these inspected execution paths, this
existing moderate finding is not a newly reachable Production vulnerability or
reason to mutate the reviewed fixed release source. Preserve the earlier deferral
and track an ordinary reviewed dependency-chain update; do not globally force a
transitive version across unsupported ranges during release preparation.

Review again by2026-12-01, or earlier before any tooling change or use/exposure of
an esbuild development server. Reassess immediately if a serve invocation or new
build/runtime entry point appears. This disposition does not waive other release
checks or future dependency audits.

This reviewer performed source/manifests/lock and maintainer-advisory reads only;
the actual audit command/result is parent evidence. No deployment, schema/data,
external write or runtime source mutation occurred. Add this artifact in a later
audit commit while keeping the pinned releaseSourceSha1788143 unchanged.
