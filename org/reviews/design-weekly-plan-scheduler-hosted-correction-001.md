# Scheduler deployment Host correction — independent design review

- Reviewer: reviewer, independent of architect
- Date: 2026-11-26
- Reviewed design: 3a3767bc35e37c90484a1f4849d512a8662e0895
- Artifacts: hosted-target-correction.md and appended active spec/plan
- Verdict: **Approved for local correction and isolated staging validation**
- Blocking design findings: none

## Concrete failure and corrected boundary

The registered Ed9c cron host was its generated deployment hostname, while7fe
accepted only the automatic alias. The proposed correction addresses that
observed cause directly: the machine route accepts exactly its existing fixed
service Host and a strictly validated server-owned VERCEL_URL hostname.
Missing/malformed metadata fails503 before either Host is accepted. This is an
explicit two-element equality check, not suffix/wildcard trust for requests.

The planned lowercase ASCII/DNS length/label/canonical checks reject schemes,
ports, paths, credentials, whitespace, wildcard and normalization surprises.
No incoming forwarded header, cookie, User-Agent or request parameter chooses
the deployment host. Fixed project/environment, stable service configuration,
browser origin, Wednesday, independent bearer and all-method guards remain
mandatory. Ordinary browser/menu/auth Host policy stays unchanged.

Preserving deadline/pool ownership, same bounded waitUntil work, current
eligibility, ready snapshots, synthetic exclusion and existing/final plans
keeps this a narrow trust-binding correction. No schema/grant/provider/runtime
dependency change or identity exception is needed.

## Proof that closes the prior gap

The plan requires failing tests for own generated Host acceptance, different
generated Host rejection and missing/malformed metadata failure on either
allowed Host. Real HTTP/compiled tests retain browser/menu generated-host421
and service authentication/method/security behavior.

New exact-source Preview validation must actually reach both the stable and
inspected generated HTTPS origins, distinguish platform interception from app
responses, and verify no/wrong bearer401, protected405, invalid400 and valid
off-day skip. Runtime VERCEL_URL must be attributed to that exact generated
deployment; a guessed environment override is forbidden. Existing rollback-only
storage/local proofs remain separately labeled.

A future separately authorized candidate must show unauthenticated generated
service401, ordinary generated browser421 and post-promotion registered cron
hosts/deployment equal to its own inspected generated URL. This would have
detected the original integration defect. It remains distinct from future
unattended Wednesday delivery and actual cloud-disconnect observations.

## Workflow and authority

The original source/approvals/failed attempt and recovery stay historical.
Existing fix/staging authority permits this peer-reviewed corrective work.
The consumed first-attempt approval permits no new Production configuration,
candidate build or promotion. New fixed source/profile/staging results and
fresh owner acceptance/release authority remain necessary.

The implementation paths are within the existing manifest; correction notes/
evidence stay in the same feature folder. Record exact new evidence paths in
the active manifest/graph when selected and retain the failed cycle's audit
history. Final code/security review and actual verification still precede
staging selection. This is design approval, not implementation or release proof.
