# Security review — plan recipe thumbnails

- Reviewer: security-researcher (independent of implementation)
- Date: 2026-11-26
- Reviewed source: `e16c6e9d55ceed42a958a2b1eb69983d3de43a5d`, against `dcd34ca`
- Inputs: accepted intent, approved sibling spec/plan and local verification in
  `intent/plan-recipe-thumbnails/`; design approval `277aa47`
- Verdict: **Approved for local implementation handoff. No blocking findings.**

## Trust boundaries and findings

The protected family plan snapshot crosses into an existing client component;
the browser then requests its saved third-party photo. Assets are family plan
contents, browser credentials and server network authority. Relevant abuse cases
are an unsafe image URL, cross-family disclosure, unintended optimizer fetching,
referrer leakage and stale error state after a swap. No new threat boundary needs
an API, credential or storage change.

- `app/plans/page.tsx:11–17` still requires family/session context before reading
  the plan. `lib/plans/store.ts:14–25` parses persisted meals and derives the
  queried family from `requireMember`, using bound SQL. The feature changes none
  of these paths or the mutation handlers.
- `lib/plans/validation.ts:19–23`, `lib/menu/validation.ts:12–25` and
  `lib/recipes/validation.ts:7–21` retain snapshot URL admission: bounded HTTPS
  URLs without credentials, explicit ports, raw IPs or local/internal host forms.
  `app/plans/plan-controls.tsx:60` passes only the existing snapshot `imageUrl`.
- `app/plans/plan-controls.tsx:8–12` uses unoptimized Next Image with direct lazy
  loading and `no-referrer`. It creates no server fetch, optimizer request,
  endpoint, logging or persistence. React renders the URL as an image property;
  no raw HTML or script sink is added. Third-party image availability remains an
  external dependency under the already approved direct-image policy.
- `app/plans/plan-controls.tsx:9–11,60` bounds failure handling to local URL state
  and keys the thumbnail by recipe source identity. A failed load removes the
  image without retrying or changing plan contents; accepted swaps get fresh
  thumbnail state. Title/source/action rendering remains unchanged.

The only application/configuration/dependency delta against the base is eight
added lines in `app/plans/plan-controls.tsx`. No auth, proxy, headers, URL
validation, schema, secret, dependency or hosted configuration was changed.

## Independent checks and evidence limits

- `git diff --check dcd34ca e16c6e9`: exit0.
- `python3 scripts/scan_secrets.py --base dcd34ca --head e16c6e9`: exit0,
  `scan_secrets: 0 finding(s)`.
- An independent Node assertion against installed `next/image.getImageProps`
  passed: exact original `src`, no `srcSet`, no `/_next/image`, lazy loading,
  `no-referrer` and empty alt for the implemented props. No network call needed.
- Inspected `tests/plans/browser.ts:39–50` snapshot-by-snapshot assertions for
  successful direct sources, lazy/no-referrer/decorative attributes, null/404
  fallback and fixed geometry. The implementer's `verification.md` separately
  records full Chrome swap/final/history coverage and308 Node/7 Python passes;
  those broad suites were not redundantly rerun during this review.

This approval covers the fixed local change. It grants no merge, push, hosted
deployment, migration or release authority, and does not certify real external
photo-host availability.
