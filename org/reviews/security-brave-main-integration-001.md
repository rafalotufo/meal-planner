# Brave search — local main integration security review 001

- Reviewer: security-researcher; date: 2026-11-25.
- Artifact: `brave-parallel-recipe-search-main-integration`.
- Exact integrated source: `73bb7f3763fd3a9428d31548345d2f66b54c09ec`.
- Parents: feature `c0c8858b273d526f82986eba3f9aafa07cb30b7a` and main
  `1f7cf8bcd221b81b49875e31c279b8edfea059f6`.
- Verdict: **No blocking security findings for this local integration.**
  This review grants no hosted migration, deployment, promotion or release authority.

## Combined-source assessment

Compared the committed integrated source with both parents. All `lib/recipes/`,
`app/api/recipes/search/` and `app/search-notebook.tsx` content matches the approved
feature parent exactly. Auth, shared sessions, identity-access, verification,
Proxy, menu HTTP authority, database runtime/security and SQL/catalog/compatibility
content matches main exactly. Dependency manifest and lockfile also match main;
this integration introduces no dependency or migration change beyond that parent.
The only fixture changes in these comparisons force both Brave key names and the
OpenAI key empty and select Brave in auth/verification servers. Overrides cannot
restore paid credentials in either helper.

The search route still requires current server-derived family context before
provider effects (`app/api/recipes/search/route.ts:11`). Main's Google sessions
have the owner-selected fixed 30-day token/JWE lifetime, no read refresh, and a
separate one-hour account-data lifetime (`lib/auth.ts:61–70`). Current admission
and family eligibility remain database-checked on protected reads. Copied valid
stateless Google credentials remain usable until their own expiry despite browser
logout; this existing accepted 30-day exposure is not extended by this merge.
Legacy credentials retain their signed shorter deadlines.

Verification identity remains a separate principal, limited to its live synthetic
run/member/family and target-bound session. Runtime target checks require the
trusted Preview manifest plus exact project, deployment, source, profile, origin
and database identity; Production returns no target even with copied Preview
settings (`lib/verification/target.ts:25–30`). No Google identity or invitation
authority is inferred from synthetic family membership. One-time exchange,
revocation, expiry, canonical-host/Origin/nonce checks and restricted runtime grants
are preserved. The seven required migration identities and reviewed native
correction are unchanged from main; runtime still cannot create or retag synthetic
members. This review did not apply any schema or grants outside owned test DBs.

The prior feature security approvals remain applicable to unchanged Brave code:
one search/20 hits, 24 safe fetch attempts, bounded collection expansion, at most
12 tool-free curation calls/cards and 1200 output tokens per call. Public-address
DNS checks, pinned HTTPS, no redirects/proxies/credentials and bounded body/time/
encoding checks remain on all source requests. Required title/ingredient/method
evidence is associated with the fetched source; collection/snippet/model URLs do
not become recipe evidence. Model output cannot cause another fetch or tool call.

The fixed eight-second per-item budget still spans queue, transport, body and
validation (`lib/recipes/parallel-search.ts:66–81`). Expired queued starts and late
results are rejected; valid siblings may survive, zero-card expiry yields timeout,
and parent abort wins over partial output. Shared active leases remain held until
underlying work/cancellation settles. Notebook lookups retain six-source server
bounds, at most two chunks for twelve cards, per-chunk response association and
stale-response/save protection. No query/evidence/secret logging or persistence
was added.

## Independently executed verification

- `pnpm test`: **112 passed**, exit 0.
- `node --import tsx --test tests/verification/{target,cookies,session,identity,http,migration}.test.ts`
  (explicit file arguments): **16 passed**, exit 0.
- `node --import tsx --test --test-name-pattern='Google OAuth completes' tests/auth/oauth.test.ts`:
  **1 passed**, exit 0. This exercises exact 30-day inner/JWE/cookie expiry,
  one-hour account data, no refresh, legacy deadlines, tamper/expiry/admission
  rejection and family-guarded recipe requests through the real local HTTP stack.

The first verification-suite invocation was sandbox-denied connecting to local
PostgreSQL (`EPERM`); its approved local rerun above passed. Database/HTTP tests
used owned random local fixtures and empty paid keys. No hosted data, external
provider calls or deployment was used. Logs are under
`/private/tmp/brave-integration-security-{recipes,verification-approved,auth}.log`.

The feature's historical paid smoke timings predate its final timeout/ItemList
changes and this integration. They remain historical evidence with weak broad
query recall, not final-source quality, latency or load guarantees. Developer's
separate full-suite/browser checks and the owner's local merge gate remain
distinct from this focused independent security verdict. Org loop remains solved
at turn 9/10; this integration review does not reopen or advance it.
