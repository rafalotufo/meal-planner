---
artifact: intent/single-call-recipe-search/plan.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent implementation-plan review — single-call recipe search

## Verdict

Approved for local implementation under the org peer-review plan gate. No
blocking or required findings. This approval does not approve unimplemented
code or authorize merge, push, production configuration, or release.

## Evidence and review passes

Read the active intent, approved specification, prior specification review,
plan.md, current provider and fixture structure, handler boundary, README's
provider description, strict TypeScript configuration, browser harness output
paths, and org loop configuration/state. The application is unchanged at this
gate; no application verification or mutation experiment was performed by this
reviewer for this plan-only approval.

- **Bugs/correctness:** plan.md:53–76 requires meaningful red tests before
  provider edits, retaining citation-cleanup regressions while adapting the
  obsolete second-call shape. Coverage includes one-request success/failure,
  source-local method/metadata excerpts, optional-null behavior, invalid/valid
  duplicate ordering, bounded public projection and cancellation. The proposed
  direct parser and failure semantics implement the approved specification.
- **Security/compliance:** plan.md:10–44 gives an exact source/test manifest
  and bounded workflow/evidence paths, without auth, photo-transport, handler,
  client, dependency, model or deployment edits. plan.md:81–90 limits actual
  provider verification to three synthetic queries using an unchanged payload
  wrapper; committed evidence excludes keys and raw source bodies.
- **Architecture/performance:** plan.md:64–79 removes the second call and its
  dead prompt/schema/ID join rather than relocating the two-stage pipeline.
  It preserves source validation and resource caps, and documents the lost
  second-pass schema plus same-response evidence limitations. No promised
  duration or universal speedup is inferred from prototype measurements.
- **Audit and verification:** plan.md:91–108 names the full required suite,
  real Chrome mobile/desktop checks, and an explicit backup/copy/restore path
  for the harness's existing screenshot names. Those names match the writes in
  tests/auth/browser.ts; distinct single-call evidence is covered by the
  manifest. plan.md:129–144 separates red/green and final verification while
  retaining required org acceptance invocations. The six-turn and two-round
  bounds and final human merge/release authority remain intact.

Implementation review must inspect actual red/green output, final application
checks, live one-request evidence, screenshot preservation, and the resulting
code before code/security clearance can be granted.

## Bounded diagnostic addendum approval

Accepted the verification delta proposed by the orchestrator during code review
on 2026-11-23, to be recorded in plan.md before execution: one additional
synthetic mushroom-pasta query through the unchanged implemented provider.
The initial three live searches returned null time/image metadata on all nine
cards, an unresolved quality observation deserving diagnosis rather than an
unsubstantiated parser change.

Keep the configured model, payload, request count, caps and cancellation
unchanged. Clone the response only to inspect optional field presence, types,
null values and same-record excerpt containment. Confine any raw response to
ignored local storage; commit only sanitized diagnostic findings. The delta
authorizes exactly one additional paid request, with no retry, fix, budget,
model-limit, account, production configuration or release action implied.

This is a narrow extension of the existing live verification, not a new product
requirement, a changed evidence policy or final code approval. An actual defect
must be diagnosed and reviewed before any production-source change.

## Prompt-only remediation and final live proof

The diagnostic established that all expected fields were present, but the model
put commentary in evidence fields and different actual quoted metadata in
excerpt fields. Inspection of the ignored diagnostic summary and one raw
record independently confirmed that mismatch. The existing parser correctly
rejected unsupported containment; relaxing it would violate the specification.

Approved the narrow follow-up proposed through the orchestrator: record this
cause and limit in plan.md, then clarify only the production prompt. Require
the evidence fields to include actual source-observed metadata text, with
excerpt fields containing literal substrings of that evidence without citation
display. A small internally consistent example is appropriate. Do not change
the parser, schema policy, model, usage caps, fallback policy, UI, photo/auth
boundaries, dependencies, or production configuration.

After the prompt change, repeat required source verification and exactly the
three original synthetic-query live calls against the final adapter, recording
one request per search and sanitized metadata-presence/containment observations.
This permits seven paid requests for this implementation verification in total:
three initial calls, one diagnostic, and three final calls. Existing real Chrome
fixture evidence remains applicable to the unchanged UI; it is not live model
proof. Final code/security clearance remains pending final-source verification.
