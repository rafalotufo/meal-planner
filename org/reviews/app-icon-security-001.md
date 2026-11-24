---
artifact: app-icon-implementation
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# App icon — independent implementation security assessment

Approved within the local app-icon scope. No blocking security findings.
This assessor authored the design proposal, but did not implement or modify
the application/assets/tests reviewed here. This is an implementation security
assessment, separate from independent spec/plan approval and code review.

## Threat model and evidence

The trust boundary is an unauthenticated request's pathname/method entering
the public-path policy. The protected assets remain identity/session data,
family records, search provider effects and server configuration. The intended
public assets contain only an original static plate/fork illustration.

- **Spoofing/elevation:** `lib/auth-policy.ts:5` adds exact equality checks for
  `/icon.svg` and `/favicon.ico` inside the existing GET/HEAD-only condition.
  No directory, extension or lookalike prefix is newly public. Other methods
  remain protected. `tests/auth/app-icon.test.ts:6` covers both exact reads,
  five rejected methods, nested/suffixed/case-varied paths and representative
  protected page/family/search paths. Real HTTP at lines 50–57 verifies POST
  denial and continued sign-in redirects/API denial.
- **Tampering/disclosure:** `app/icon.svg:1–6` contains one root SVG and only
  rect/circle/path geometry with explicit colors. There are no scripts,
  handlers, references, fonts, foreign objects, CSS, metadata or remote URLs
  beyond the standard SVG namespace. The 1,341-byte ICO has exactly two valid
  PNG payloads (16×16 and 32×32, 32bpp) containing only IHDR/pHYs/IDAT/IEND
  chunks; both payload offsets/lengths and dimensions were independently
  parsed. No personal data or runtime input appears in either asset.
- **Content confusion:** `tests/auth/app-icon.test.ts:30–49` checks successful
  same-origin image requests without redirects, `nosniff`, SVG/ICO MIME and
  signatures, correct ICO resolutions and successful empty-body HEAD. The
  compiled production app passed these checks with an unreachable DB URL.
- **Denial of service/effects:** `proxy.ts` is byte-identical to the baseline.
  Its existing public branch skips `readSession`; public icons perform no
  database/session lookup or provider call. Authentication configuration,
  canonical Host validation and response security headers remain in place.
  This is bounded static asset serving with no dynamic image generation.
- **Auditability:** the new public exceptions and artifact hashes are explicit
  here and in the approved design. Existing auth, session, DB, provider and
  deployment code is untouched; no new personal-data store or retention path
  exists. The change does not introduce a new logging or audit requirement.

`app/layout.tsx:5–7` only removes the blank data-URL icon setting; the title
and server layout remain. `package.json`, `pnpm-lock.yaml`, `next.config.ts`,
`vercel.json`, `lib/auth.ts` and `lib/session.ts` are unchanged from baseline
`2ee77aa`. No dependencies, credentials, production bypasses, migrations or
hosted configuration changes are introduced.

The Chrome helper `tests/auth/app-icon-browser.ts` uses the existing
test-process Google transport fixture and owned temporary profile/server.
It does not add production fake-user behavior or send paid provider traffic.
It confines fixture identities/cookies to the isolated local test server and
records only title/image/viewport status in its output.

## Independent verification

`node --import tsx --test tests/auth/app-icon.test.ts` against the compiled app:
**2 tests passed, 0 failed** (747.7ms total). The first sandboxed run could
not open a loopback listener (`EPERM`); the authorized rerun with loopback
execution passed. No application change was made to obtain the pass.

`python3 scripts/scan_secrets.py` over the SVG, layout, auth policy and both
new TypeScript helpers: **0 findings**. Full regression and real-browser
evidence remain the developer's verification handoff; this focused assessment
does not claim to rerun them or authorize release. No dependency audit was
required for this no-dependency-change local assessment; a future release
retains its separate release checks and human gate.

## Reviewed source hashes

The source was stable but uncommitted at review time. These SHA-256 values
bind the assessment to the implementation; substantive changes require review.

| File | SHA-256 |
| --- | --- |
| `app/icon.svg` | `f711cfaa475e933a98038c218badf30ef4f26b6c5aa6ca97b436dad87b82de81` |
| `app/favicon.ico` | `f74fb55e3545b1f8851d273785ff01bb6bc56cbd6850100d5552b917f36a0ac4` |
| `app/layout.tsx` | `05be832e17203e7a2db3bc411006ceb717eb57b68a604de61d15515c158c48b3` |
| `lib/auth-policy.ts` | `7d8dde23b2b80ff7ae407aaf5bf0e23b201051e5a46f96c63bf2756ad4c386d8` |
| `tests/auth/app-icon.test.ts` | `247e6723689f79d7549aa98b7c313ef9351f349f91bface3d2c6650a56d80887` |
| `tests/auth/app-icon-browser.ts` | `ab9c00a6b168442eda6d52ec966766453687c76e8b6b08153f14f1727529fd04` |

Human merge and release approval remain required. No push, merge, deployment
or hosted data action was performed by this assessment.

## Final committed-source addendum

Reconfirmed approval against implementation commit
`b311ac61a1d9512f932232b505b8a6fb21be9b11`. The four production source/asset
hashes and focused HTTP test hash above still match exactly. The final Chrome
helper hash supersedes its earlier working-tree value:

`tests/auth/app-icon-browser.ts`:
`12fdb3e8f05ab83ece8ed5d823a394fc542188490897b8ec5da042ce4fe28a92`.

The helper's scoped corrections assert the existing sign-in heading separately
from the unchanged `document.title === "Meal Planner"` assertion, give the
inspection document explicit UTF-8 encoding, and raise contact-sheet viewport
height to 1,100px. They add no production behavior, privileges, external
requests or exposed fixture credentials. The final helper secret scan again
reports zero findings. Developer verification in
`org/reviews/app-icon-verification.md` and its committed logs records the full
suite and refreshed Chrome evidence. No additional full-suite rerun is claimed
by this security addendum. Approval and the separate human gates are unchanged.
