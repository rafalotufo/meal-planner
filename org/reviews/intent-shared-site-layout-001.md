# PM intent review — shared site layout

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/shared-site-layout/intent.md`
- Verdict: Accepted for Design

## Evidence and assessment

The owner explicitly requests consistent site styling through a Next.js layout
and a common header, citing the family page as the visible gap. Inspection of
`app/layout.tsx` confirms it currently applies only white body styling and
global CSS; `app/page.tsx` independently owns the stone background, constrained
width and Meal Planner header. `app/family/page.tsx`, `app/sign-in/page.tsx`,
`app/onboarding/page.tsx` and `app/sign-out/page.tsx` each render separate
plain main containers, supporting a shared presentation change.

The intent covers all existing pages with the home page as the visual reference.
It preserves family/session eligibility and invitation/logout behavior, avoids
data/provider effects in the shared layout and keeps paid usage and hosted
actions outside scope. Mobile/desktop, keyboard and long-content acceptance
criteria make the outcome reviewable without prescribing unnecessary UI.

No product ambiguity or conflict requires CEO escalation. Exact header
composition and modest visual details are delegated design choices. This PM
acceptance opens Design under `org/protocol.md`; it is not merge or release
approval. Independent spec/plan and implementation review remain required.
