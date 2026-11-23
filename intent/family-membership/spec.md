# Meal Planner — family membership specification (V1)

- Derived from: accepted sibling `intent.md`
- Author: architect
- Status: Draft — independently reviewed; human specification approval required
- Date: 2026-11-23

## Objective and confirmed behavior

Make a family the durable ownership boundary for application data. An
application member belongs to exactly one family. Members can invite a new
person into their existing family. A person already in any family cannot
accept another invitation, including when their family has no data or other
members. An invited person joins the inviting family; automatic family creation
applies only to users without an invitation. A valid invitation grants its
Google-verified recipient access beyond the existing Gmail allowlist.

No recipe or meal feature is built. Document the required family owner and
server authorization contract for future entities. Keep `/` limited to its
existing `Meal Planner` heading. Family controls live on separate pages.

## Design choices for review

1. Use one local SQLite database through Drizzle, with durable storage on one
   application host. This V1 requires a persistent local volume; ephemeral
   serverless filesystems and shared network-mounted database files are not
   supported. PostgreSQL is appropriate for a later multi-host deployment but
   adds a service, credentials and setup that this feature does not need.
2. Retain Better Auth's encrypted, one-hour, nonrefreshing stateless sessions.
   Store application users, families, invitations and accepted-invitation access
   in SQLite; do not add Better Auth account/session tables.
3. Members enter a recipient email and copy a generated invitation link to
   share themselves. No automatic email delivery, SMTP service or email
   permission is introduced.
4. Resolve onboarding through explicit, same-origin POST requests after Google
   authentication. Application GET/HEAD, proxy checks, session reads, provider
   admission lookups and server rendering do not mutate application data.
   The verified OAuth callback may update an existing subject's email after
   admission, as specified below; it never provisions or accepts invitations.
5. A pending invitation permits only authenticated onboarding. It grants full
   application access only after acceptance creates durable membership and an
   invitation-based access grant in the same transaction.

These are proposed technical choices, not claims about an existing production
hosting environment. If the intended host cannot preserve a local database,
revise the storage design before Build rather than deploying ephemeral SQLite.

## Components and dependency direction

| Component | Responsibility | Depends on |
| --- | --- | --- |
| persistence | Schema, connection and reviewed migrations | Existing Drizzle; SQLite driver |
| identity-access | Verified Google subject and current eligibility | Persistence; existing Better Auth |
| family-service | Transactional provisioning, invitations and membership | Identity-access; persistence |
| family-interface | Onboarding, family pages and HTTP handlers | Family-service |

This is one integrated feature specification. Build planning follows approval;
no separately shippable recipe, meal, email or role module is included.

## Dependencies and runtime

Keep all existing exact versions, including `better-auth@1.7.27`,
`drizzle-orm@0.45.4`, `drizzle-kit@0.31.11`, Next.js 16.4.6 and pnpm 10.33.0.
Add runtime `better-sqlite3@13.2.0` and development-only
`@types/better-sqlite3@9.6.0`. Registry metadata checked during Design reports
Node `>=22` for the driver. It publishes platform prebuilds and has no install
lifecycle script; inspect the actual downloaded package, native loader,
transitive changes, provenance and supported target architecture before use.
Do not blanket-enable dependency scripts. Preserve `strictDepBuilds` and the
existing narrow script policy. Generate the lockfile with pnpm and prove a
frozen install and native driver smoke test during Build.

Use `drizzle-orm/better-sqlite3` and SQLite table definitions. Native SQLite
requires Node runtime, not Edge. Next already lists `better-sqlite3` among its
automatically externalized packages; verify the installed Next release and
production build rather than adding speculative bundler configuration.
Keep strict library checking, Node/React types and the existing SQLite ambient
type workaround. Do not replace types with `any`, suppress diagnostics, patch
vendor code or upgrade unrelated packages to resolve compatibility.

## Persistence and schema

Server-only `lib/db.ts` lazily opens the absolute path in server-only
`DATABASE_PATH`; no browser variable or default in-memory database. The runtime
opens an existing, migrated file and fails closed if it is absent, unreadable,
unmigrated or locked beyond a bounded timeout. Build can run without a database
or secrets. The explicit migration command may create the configured file.
Enable `foreign_keys=ON`, WAL journaling and a 5-second busy timeout on every
connection. Do not emit SQL parameters or personal data in logs.

Use UUIDs generated by Node's crypto API for application record IDs, integer
UTC timestamps, foreign keys with restricted deletion, and these tables:

| Table | Required fields and constraints |
| --- | --- |
| `families` | `id` primary key; `created_at` |
| `app_users` | `id` primary key; unique nonempty `google_subject`; unique normalized `verified_email`; required `family_id` foreign key; `created_at`; nullable `invitation_granted_at` |
| `family_invitations` | `id` primary key; required `family_id`; `created_by_user_id`; normalized `recipient_email`; unique `token_hash`; `created_at`; `expires_at`; `status`; nullable `accepted_by_user_id`, `accepted_at`, `revoked_at` |

Allowed stored statuses are `pending`, `accepted`, `revoked`; expiry is derived
from the deadline. An accepted invitation has an accepting-user foreign key and
acceptance time; pending/revoked invitations do not. A check enforces those
combinations. Index recipient/status/deadline and family/creation time. One
pending unexpired invitation per recipient is enforced inside a serialized
write transaction; creating another while one exists returns a generic conflict.
There is no cross-table invitation-to-membership inference for access.

`app_users.family_id` is non-null: a user row is inserted only with a family
assignment. A Google-authenticated person awaiting acceptance is an onboarding
identity, not a family member or a partially populated application user. This
keeps the one-family constraint structural. No member-removal, reassignment or
family-deletion handler exists in V1. Reject any verified-email collision with
a different Google subject; never implicitly merge people by email.

All family creation and acceptance use short synchronous Drizzle transactions
with `behavior: "immediate"`. Never `await` network work inside a SQLite
transaction. The write lock serializes provisioning, creation and redemption;
unique keys provide an additional integrity boundary across connections and
processes. Re-read membership, recipient invitations and eligibility while
holding that transaction. Roll back the complete operation on failure. Never
catch a constraint failure and continue with partial writes.

## Stable identity and session eligibility

The current stateless Better Auth `session.user.id` is not the Google subject:
pinned `oauth2/link-account.mjs` discards the provider ID before local user
creation. Do not key membership by that ephemeral ID or by email alone.

Continue verifying the Google ID token using the pinned library verifier in
`getUserInfo`: signature, issuer, audience, lifetime, nonempty `sub`, and strict
`email_verified === true`. Normalize email only by trim/lowercase. Google `sub`
is the durable identity key. Invite recipient addresses can be Google-verified
addresses outside `gmail.com`; the existing allowlist remains Gmail-only.
Do not collapse dots, plus suffixes or aliases in either comparison.

Declare a required string `googleSubject` additional user field and populate it
only from the verified `sub` returned by this provider path, overwriting any
mapped value. The pinned library's provider-profile parser drops fields marked
`input: false`, so this field uses the provider-mapping-compatible input
setting. Keep `returned: true` (or the true default): the library filters user
output before constructing its encrypted session cache. `returned: false`
would remove the subject from that cache. Application response allowlists,
rather than the library output flag, exclude it from public JSON.
This is safe only with the existing exact route/method allowlist:
generic profile update, signup and account-linking endpoints stay inaccessible;
social sign-in accepts only the approved Google request fields and rejects
`googleSubject`, `familyId`, user claims and direct ID-token submissions.
Regression tests must prove those routes cannot write this field. The
encrypted library session carries it; it is not returned in public JSON.
If pinned runtime inspection disproves this mapping, revise/review the design;
do not substitute client data or an unverified decoded token.

Pre-feature cookies lack this field and require fresh Google sign-in. On every
protected read, validate the cryptographic session and its trusted subject,
verified email and expiry, then classify current database eligibility:

| Current state | Result |
| --- | --- |
| Member with `invitation_granted_at` | Full access using current server-side membership |
| Member without invitation grant, currently allowlisted | Full access using current membership |
| Member without invitation grant, removed from allowlist | Denied, including existing cookies |
| No membership, valid pending invitation for verified email | Onboarding access only |
| No membership or pending invitation, currently allowlisted | Provisioning access only |
| Otherwise | Denied |

Check the same admission policy before issuing a Google session. Neither family
membership nor a previously allowlisted login creates an invitation grant.
Accepted invitation access is tied to Google subject and survives consumption,
invitation expiry, logout and a later verified email change for that same
subject. In the existing Google `getUserInfo` override, keep signature/claim
verification and admission lookup read-only. Only after those checks succeed,
the post-admission portion of that same OAuth callback updates an existing
`google_subject` row's normalized `verified_email` in an immediate transaction.
Recheck the subject and email uniqueness inside that transaction. It does not
create a user, family, invitation or grant, or change membership. An email
collision with another subject or storage failure aborts the provider return
and issues no session, using the generic authentication failure/unavailable
contract. Then return the verified subject/profile for library session creation.
No extra login-proof token or custom cryptography is introduced. Session reads,
onboarding/provisioning of an already existing member and older copied cookies
never rewrite stored email. Newly provisioned/accepted users take their initial
email from the library-verified onboarding identity in their creation transaction.
Current allowlist membership is evaluated against the session's verified email,
as today. Do not cache a durable authorization decision in a cookie.

`lib/session.ts` remains the single protected boundary. `readSession` returns a
typed eligible identity including its access state; `requirePageSession` gates
authentication/admission. Add `requireFamilyContext` for member-only pages,
endpoints and actions, returning `{ userId, familyId }` from a current database
lookup. Proxy can direct onboarding identities to `/onboarding` for application
navigation and return `403 { error: "Family membership required" }` for
member-only APIs. It must not provision, consume invitations or trust incoming
context headers. Route handlers and data services repeat their own guards.

Missing configuration, malformed allowlist or database/verification errors
return generic `503` and no protected data; never interpret failure as empty
membership or absent invitation. An empty allowlist still denies allowlist-only
users, while valid invitation recipients and invitation-granted members remain
eligible under the owner's explicitly expanded policy.

## Invitation transport and lifecycle

Any family member may create or revoke an invitation for their own family;
there are no owner/admin roles. Creation takes only `recipientEmail`, validates
a bounded email string (maximum 254 characters), and derives the family and
inviter from the server context. Reject existing application members, self
invitations, duplicate active invitations and ineligible requests with generic
errors that identify no other family or account state.

Generate 32 random bytes encoded as base64url. Persist only SHA-256 of the token;
return the plaintext once in the creation response as
`<canonical-origin>/invite#<token>`. Links expire seven days after creation.
Do not persist plaintext tokens, place them in query strings or provider
callback URLs, send them to telemetry, or embed them in server logs.

`/invite` is a public, data-free shell with a small client component. It captures
the fragment, immediately removes it with `history.replaceState`, and POSTs it
to the exact public `/api/invitation-context` endpoint. That endpoint validates
format/size and same-origin request protections, sets an HttpOnly, host-only,
SameSite=Lax context cookie (Secure on HTTPS), and returns the same generic
`204` without looking up or revealing an invitation. The cookie carries the
opaque token and lasts at most seven days; server validation always checks the
stored hash, deadline, status and Google-verified recipient. A context cookie
is a selection hint, not authentication. No public preview exposes family or
recipient details. Render no third-party content; preserve no-referrer/CSP.

The shell navigates to `/sign-in`, using the existing Google flow. A pending
invitation for the verified email permits an onboarding session even without
the context cookie, so signing in normally cannot accidentally create another
family for an invited person. Without the secret context, onboarding asks the
recipient to reopen their invitation; it cannot accept by email alone.

All successful Google redirects go to the fixed same-origin `/onboarding`.
Do not accept arbitrary callback destinations. Existing members with invitation
context see an explicit existing-family rejection and a route back to their
family; no acceptance POST is enabled for them. Existing members without
invitation context are redirected to `/` by a read-only onboarding check.

New invited identities see the inviting family's generic label and their
verified recipient email, with an explicit **Join family** button. That button
POSTs acceptance. Within one immediate transaction:

1. Recheck cryptographic identity, current eligibility and intended-recipient
   binding; resolve the opaque token by hash and check pending/nonexpired status.
2. Reject existing membership, even if one-person or empty. A retry of the
   *same already-completed acceptance* by the same subject/family returns its
   existing success without changing membership or consuming a new invitation.
3. Insert the application user with the inviting `family_id` and
   `invitation_granted_at`; mark the invitation accepted with that user/time.
   Commit both together; clear context on the response and navigate to `/`.

Revocation is allowed only while pending and never removes accepted members
or their durable grants. Expiry/revocation between login and acceptance denies
acceptance and protected member access immediately. Unknown, malformed,
expired, revoked and wrong-recipient tokens have the same generic unavailable
result and cause no provisioning. For a valid cryptographic session, always
permit clearing its own session through the guarded sign-out flow even if
current application eligibility has since disappeared.

Define `readCryptographicSession` separately from admission-aware `readSession`:
it verifies the library cookie, expiry and trusted subject but performs no
allowlist-membership, invitation-eligibility or family/database lookup. Apply
that guard at all three layers for exact GET/HEAD `/sign-out` and POST
`/api/auth/sign-out`: proxy, sign-out page, and auth route handler. Those routes
are authenticated exceptions to admission, not anonymous/public routes. They
return no family data and retain canonical Origin/CSRF and exact auth-route
restrictions. Logout clears the invitation-context cookie as well as every
library session/account cookie chunk, using matching path/transport attributes.
An expired/revoked pending invitation or removed allowlist entry must not trap
a still-cryptographically-authenticated person before logout. Other protected
routes continue to enforce admission and family guards.

Declining means canceling onboarding/signing out; it does not consume or delete
the pending invitation and does not create a family. The recipient can return
before expiry. An expired/revoked link never falls through to automatic
creation. A later fresh normal sign-in without invitation context may provision
only if the person is allowlisted and has no valid pending invitation. This is
an explicit definition of "without invitation" for expired/revoked history,
not a creation side effect of cancellation or a failing link.

## Automatic provisioning and UI

An allowlisted onboarding identity with no family, no valid pending invitation,
and no presented invitation context gets a minimal **Setting up your family**
screen. A small client component automatically POSTs
`/api/onboarding/provision`; rendering itself is read-only. The transaction
rechecks those conditions and inserts exactly one family and its user together.
Retries return the existing membership. If an invitation was created before
the transaction acquired its lock, return onboarding-required without creating
a family. If provisioning committed first, a later invitation creation detects
existing membership and fails generically. Busy/operational failures return
generic `503`; a failed request cannot leave a family without its user.

`/family` is a protected server page showing **Your family**, member verified
emails, a recipient-email invitation form, pending invitation status/expiry and
revoke controls. The generated link is displayed only immediately after
creation with a copy control. Keep client state local to form pending/error
and link-copy feedback. No external assets, family names, profile editor,
global state library or home-page navigation is added. Document `/family` as
the management URL. All labels, focus states, errors and pending controls must
be accessible and fit 320- and 1440-pixel viewports.

## HTTP and authorization contracts

Use JSON bodies no larger than 4096 bytes; reject unknown fields. JSON mutations
require the canonical Origin and must reject `Sec-Fetch-Site: cross-site`;
retain Better Auth's own OAuth/CSRF controls. All responses are private/no-store.

| Route | Methods | Guard and result |
| --- | --- | --- |
| `/invite` | GET/HEAD | Public shell only; no protected lookup or mutation |
| `/api/invitation-context` | POST | Public exact exception; same-origin; generic context-cookie response |
| `/sign-out`, `/api/auth/sign-out` | GET/HEAD page; POST API | Cryptographic-session-only guard at proxy/page/handler; no admission requirement; clear session and invitation context on POST |
| `/onboarding` | GET/HEAD | Eligible authenticated identity; no family data except its verified invitation |
| `/api/onboarding/provision` | POST | Eligible identity; transactional no-invitation provisioning |
| `/api/invitations/accept` | POST | Eligible identity plus bound invitation context; transactional acceptance |
| `/family`, `/api/family` | GET/HEAD | Full family context; only current family's members/invitation summaries |
| `/api/family/invitations` | POST | Full family context; create recipient-bound invitation |
| `/api/family/invitations/[id]/revoke` | POST | Full family context and invitation belonging to that family |

Keep auth/static exceptions exact in `lib/auth-policy.ts`; only the two new
public entry points above are added. New onboarding routes require authenticated
identity, even though no membership exists yet. Existing `/api/session` remains
`{ authenticated: true }` for fully provisioned members and exposes no profile,
eligibility list, subject or token. Unsupported routes/methods cannot reach
generic Better Auth APIs. Anonymous protected APIs return `401`; authenticated
membership conflicts return `409`; unknown/foreign invitation management IDs
share `404`; invalid input returns `400`; temporary configuration/storage
failure returns generic `503`. A server service must never accept caller-owned
`familyId` as authority.

Limit invitation creation to 10 per family per rolling hour and 20 pending
unexpired invitations per family, counted transactionally from durable rows.
Return generic `429` on limits. This is a bounded new mutation surface, not a
replacement for existing Google authentication protections. Do not add a public
email existence endpoint or return other families' names/memberships.

## Future family-owned data contract

Every future shared table (including recipes and meals) must have a non-null
`family_id` foreign key. Server reads, updates and deletes constrain both record
ID and the `familyId` obtained from `requireFamilyContext`; inserts derive that
owner from context. Related shared records must have matching family ownership,
enforced by composite constraints or transactional validation. Never authorize
by URL IDs, hidden UI, cookie family claims or a caller-supplied context header.

Example service convention, illustrating the required scope rather than adding
a recipe implementation:

```ts
const context = await requireFamilyContext(request.headers);
return listInvitations(context); // Service derives every query's family filter.
```

## Files and commands

Proposed source layout: `lib/db.ts`, `lib/db/schema.ts`, `lib/family.ts`,
`lib/invitations.ts`, `lib/session.ts` and the existing auth/policy modules;
`app/onboarding/`, `app/invite/`, `app/family/`, and matching API handlers above.
Keep schema/migration helpers testable without importing Next server-only
runtime; boundary adapters remain server-only. Store reviewed generated SQL and
Drizzle journal/snapshots in `drizzle/`, with `drizzle.config.ts`. The approved
Build plan will supply the exact file manifest. No plan or implementation is
authorized by this draft.

Retain commands and add these scripts during Build:

```sh
pnpm install --frozen-lockfile
pnpm run db:generate    # drizzle-kit generate --config=drizzle.config.ts
pnpm run db:migrate     # node --env-file=.env.local --import tsx scripts/migrate-db.ts
pnpm run dev
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test:auth
pnpm run test:family    # node --import tsx --test tests/family/*.test.ts
python3 -m unittest discover -s tests
python3 scripts/scan_secrets.py --staged
```

The migration script also accepts an already-exported `DATABASE_PATH` when run
directly without `--env-file`; tests call the reusable migrator against their
own temporary files. Migrations run explicitly, never on page rendering, proxy,
server import, build or ordinary request. Existing auth tests must own temporary
migrated databases too; no test uses a developer or production database.
Keep all new application tests, helpers and migration scripts in strict
TypeScript checking using the pinned tsx loader and Node built-in test runner.

## Verification matrix

| Area | Required proof |
| --- | --- |
| Identity/session | Stable subject across fresh logins and restart; different subjects stay distinct; legacy cookies require login; no client-set subject; subject survives encrypted library cache but no public JSON; changed-email fresh login updates existing subject only; collision aborts issuance; older cookie reads cannot rewrite email; malformed/unverified/wrong-audience/expired Google tokens denied |
| Eligibility | Existing allowlist cases preserved; uninvited unlisted identities denied; pending recipient gets onboarding only; wrong recipient denied; accepted unlisted member signs in later; removing allowlist-only member denies copied existing cookie; mere family membership never creates access |
| Provisioning | No invitation creates one family/user; repeated and cross-connection concurrent POSTs create no duplicates/orphans; invitation creation racing provisioning serializes correctly; application GET/HEAD/prefetch/session reads cause no writes (verified OAuth callback metadata update is the explicit exception) |
| Acceptance | Recipient and token both required; existing members rejected even if empty/one-person; expiry/revocation/forged token/replay/double acceptance/concurrent different attempts; exact same completed retry harmless; insert/status/grant rollback together |
| Isolation | Two real families through HTTP; foreign invitation list/revoke IDs denied indistinguishably; forged family fields/header ignored or rejected; only own members/invitations returned |
| Persistence/failure | Fresh migration and repeat migration; unique/FK/check constraints; missing schema, busy timeout and unavailable path deny closed; reopen/restart retains membership and grants |
| Security/UI | Origin/CSRF, size and unknown-field rejection; cookie transport attributes; expired/revoked pending invitation and removed allowlist eligibility still permit guarded sign-out GET and POST, clearing session/context cookies while other routes deny; no raw tokens in DB or server paths/logs; no allowlist/subject leaks; creation limits; browser 320/1440, keyboard, focus, no overflow or application console/network failures |

Extend the existing test-process-only Google network fixture with distinct
subjects and verified addresses for each identity. It may intercept provider
transport only; production must not import it or gain a test-user/config bypass.
Keep existing authentication scenarios meaningful under the new intentional
eligibility policy. HTTP tests must exercise built Next handlers, library-issued
cookies and separate cookie jars, not just matcher mocks. Database concurrency
tests use separate connections/processes to the same temporary file. Browser
tests exercise manual copy-link, new invited login, acceptance, family page and
automatic setup through real routes. Save screenshots and actual commands in
`org/reviews/`; do not claim a live Google round trip from mocked-provider proof.

## Setup, retention and recovery

Document `DATABASE_PATH` as a server-only absolute path on a durable local
volume; add ignored database/WAL/SHM/backup patterns and a placeholder in
`.env.example`. Use least-privilege host filesystem permissions, encrypted
storage/backups where the host supports them, and no public/static directory.
The database contains personal identifiers (Google subject and verified email)
only for membership/access, and recipient email for invitation delivery/binding;
do not store additional profile images, Google tokens or analytics copies.

Pending invitation expiry is always checked, even without cleanup. A local
maintenance command may purge expired/revoked/accepted invitation records 30
days after expiry or terminal state, using reviewed parameterized deletes;
accepted users retain their independent invitation grant. Keep member identity
and grant data for the lifetime of membership. No account/family deletion UI is
added; operator erasure/export requires a separately authorized, reviewed
procedure and must account for membership references and backups. Document
backup retention (30 days) and supported SQLite backup/restore, not copying a
live database file while ignoring WAL state. No scheduled job or external
service is created by this feature.

Before a production migration, obtain human authorization, take a consistent
backup and verify restore in isolation. Release is separate from implementing
and testing the initial schema. Rollback must preserve the database: do not
drop tables to restore old code. Old allowlist-only code cannot serve invited
users, so document that compatibility limit. Secret rotation invalidates all
cookies as today. For emergency invitation-grant removal, a separately reviewed
operator change clears the grant and current eligibility checks deny access
unless the subject's verified email is still allowlisted; no member-removal
interface is implicitly authorized.

## Approval boundary and sources

Always preserve strict checks, audit history, independent reviews, TypeScript
tests, scoped server authorization and secret scanning. Never add a fake-user
bypass, weaken failing tests or expose the eligibility list. Production changes,
merge and release retain human gates. This draft requires human specification
approval before Build planning under the applied specification workflow.

Primary sources checked 2026-11-23 (rolling docs are cross-checked against pinned
packages; Build must verify native/platform and mapping behavior):

- [Drizzle SQLite drivers](https://orm.drizzle.team/docs/sqlite/get-started-sqlite),
  [transactions](https://orm.drizzle.team/docs/transactions), and
  [migration workflow](https://orm.drizzle.team/docs/migrations).
- [SQLite WAL](https://www.sqlite.org/wal.html): same-host storage and one writer;
  do not use a shared network filesystem as a multi-host database.
- [better-sqlite3 13.2.0 registry metadata](https://registry.npmjs.org/better-sqlite3/latest),
  [pinned package manifest](https://raw.githubusercontent.com/WiseLibs/better-sqlite3/v13.2.0/package.json),
  and [pinned transaction API](https://raw.githubusercontent.com/WiseLibs/better-sqlite3/v13.2.0/docs/api.md).
  Registry query `pnpm view @types/better-sqlite3 version engines --json`
  returned exact stable `9.6.0` during Design.
- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect):
  verified provider identity and stable subject rather than email as user key.
- [Better Auth stateless sessions](https://better-auth.com/docs/concepts/session-management#stateless-session-management),
  [pinned OAuth user creation](https://raw.githubusercontent.com/better-auth/better-auth/v1.7.27/packages/better-auth/src/oauth2/link-account.ts),
  [pinned additional-field parser](https://raw.githubusercontent.com/better-auth/better-auth/v1.7.27/packages/better-auth/src/db/schema.ts),
  and [pinned Google provider](https://raw.githubusercontent.com/better-auth/better-auth/v1.7.27/packages/core/src/social-providers/google.ts).
  Installed `node_modules/better-auth/dist/oauth2/link-account.mjs` and
  `dist/db/schema.mjs` confirm generated user identity and provider-field rules.
- [Next server package externalization](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages).
