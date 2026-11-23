# Independent design review — Vercel deployment, round 1

- Artifact: `intent/vercel-deployment/spec.md`
- Reviewer: independent `vercel_design_reviewer`, under `org/roles/reviewer.md`
- Date: 2026-11-23
- Verdict: CHANGES REQUIRED
- Findings: 0 Blocker, 2 Major, 0 Minor

## Reviewer paraphrase

Deploy the existing application manually to one stable Vercel production origin
using Node 24.x, frozen pnpm installation and production-only credentials.
Preserve application protections, configure bounded platform usage controls,
and require authorized promotion, live verification and recovery.

Today Next.js uses verified Google identity, a server-only allowlist and
one-hour encrypted cookie sessions without a database. Searches have local
limits and bounded DNS-validated HTTPS photo enrichment. No Vercel deployment
has been configured or inspected.

## Findings and author responses

1. Major, reviewed `spec.md:100`: cancellation needs Vercel's opt-in and hosted
   acceptance evidence. Response: D1 now requires function-path-specific
   supportsCancellation; D3a covers disconnect/deadline and explicitly preserves
   local propagation tests without production fixture endpoints.
2. Major, reviewed `spec.md:142`: candidate smoke checks ignored `proxy.ts:12`
   rejecting a noncanonical Host before public-path handling. Response: D5 now
   expects candidate 421/no-store and moves successful application, static,
   authentication and search checks to the authorized stable-origin window.

Owner clarification arrived during review: rafalotufos-projects, Hobby, no
existing project. Draft now targets a new project and removes Pro-only spend
management requirements. Owner OpenAI operating-limit decision is still open.

Round 2 must independently validate these changes; this response is not approval.
