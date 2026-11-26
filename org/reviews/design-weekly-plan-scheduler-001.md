# Hosted weekly scheduler — independent design and plan review

- Reviewer: reviewer (independent of architect and PM)
- Date: 2026-11-26
- Reviewed source: `2fb7e5d`
- Artifacts: `intent/weekly-plan-scheduler/spec.md`, `plan.md`, `design-notes.md`
- Verdict: **Approved for implementation and the authorized isolated staging validation**
- Blocking findings: none

## Bugs pass

The owner-selected Wednesday09:00 America/Toronto target and accepted Hobby
09:00–09:59 delivery window are explicit (`spec.md:19`). Dual Wednesday
13/14UTC expressions cover both EST and EDT without seasonal deployment; the
existing Toronto calendar guard skips08EST and leaves the10EDT invocation as
an idempotent recovery opportunity. The possible later recovery is disclosed,
not represented as a09:00 guarantee. Requiring explicit hosted Wednesday
configuration avoids silently inheriting the existing CLI Thursday default.
CLI calendar compatibility and the strictly subsequent Sunday are preserved.

The per-family transactional core keeps eligibility, ready-menu filtering,
existing-plan preservation, keyset paging and the common lock. The optional
request deadline spans admission/read/write operations; abort stops additional
family work and requires settlement before response (`spec.md:111`). No runtime
clock override, background generation or schema change is planned. Tests must
verify the implemented behavior rather than assuming this design proves it.

## Security pass

The exact service-only origin, fixed Vercel project/environment attribution,
independent bearer and fail-closed configuration form a concrete machine
boundary (`spec.md:61`). Browser canonical origins, user sessions and synthetic
principal scope remain unchanged. The exact Proxy exclusion carries complete
handler-owned all-method guards/headers, including protected405, rather than
a public auth-policy exemption. Client forwarding headers, User-Agent and
cookies cannot establish scheduler authority. Source/URL/credential details
must remain absent from public errors and operational events.

The rollback-only probe is restricted to the recorded verified-TLS Preview
target and has no commit/Production fallback (`spec.md:175`). It must use the
shared generator core inside one owned transaction, preserve current member
eligibility, deliberately throw the rollback sentinel, and recheck preservation.
This is acceptable staging test scope; it does not authorize persistent fixtures,
a synthetic-family exception, schema/grant work or Production access.

## Compliance and verification pass

The changed-file manifest is bounded to the route, guard, existing generator,
Proxy/config/docs, focused regressions and operator probe (`plan.md:10`). It
requires test-first hostile HTTP, DST/due/abort/deadline, restricted disposable
DB, compiled packaging, repository checks and real Chrome evidence. No added
dependency or broad shared database refactor is needed.

Today is Thursday, so deployed Preview calls must show an off-day skip before
DB access; they cannot prove a due HTTP mutation. The empty existing staging
menu is documented. Rollback-only staging storage and local disposable tests
are separate proof classes. Preview never runs native cron. Authenticated
staging UI evidence is conditional on an existing valid staging identity; any
gap must be explicit (`spec.md:198`).

## Release boundaries retained

Approval opens implementation and the existing isolated staging work authorized
by the owner. It is not staging-result acceptance, human merge approval,
Production configuration/deployment/promotion/activation authority or paid-plan
authority. The final package must pin the exact reviewed source and actual
Preview/profile/results/gaps. Later audit commits cannot substitute for that
source (`spec.md:205`).

Native cron target/Host and first actual unattended delivery remain unobserved.
The exact proposed Production machine origin is a reviewed trust boundary, not
proof Vercel will dispatch there. Reinspect registered target configuration and
obtain actual observation under a separately approved activation/recovery scope;
a mismatch requires a reviewed compatible correction, never widened Host trust
or a fabricated pass (`spec.md:77`).

## Evidence

Read the accepted intent/owner amendment, all three architecture artifacts,
`REVIEW.md`, existing calendar/generator and deadline connection methods. This
is a document/design review: no application tests, hosted mutation or runtime
success is claimed. Required implementation and final security/code reviews
remain outstanding.
