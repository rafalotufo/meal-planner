# Recipe result count — correction plan

- Status: Approved
- Approval: org/reviews/recipe-result-count-plan.md; release follow-up reviewed
  in org/reviews/recipe-result-count-release.md.

## Files that change

- `lib/recipes/openai.ts`
- `intent/recipe-result-count/*`
- `org/reviews/recipe-result-count-*.md`
- `org/reviews/recipe-result-count-*.jpg`
- `gates/ledger.jsonl`

## Ordered work

1. Independently review this bounded correction before implementation.
2. Clarify the research prompt in `lib/recipes/openai.ts` only. This reversible
   prompt edit needs no new test that merely asserts the prompt's own wording.
   Reuse the existing six-distinct-source, mixed-invalid-card, evidence, abort
   and fixed-budget regression coverage in `tests/recipe-openai.test.ts`.
3. Run recipe tests, lint, strict typecheck and production build. Record actual
   results and live-provider coverage limits in sibling `verification.md`.
4. Independently review the final diff and evidence. Leave the correction local;
   no push, merge, deployment, hosted database or paid provider effects.

Changed-file manifest: the three sibling artifacts, sibling verification.md,
`lib/recipes/openai.ts`, and `org/reviews/recipe-result-count-*.md`.
The completed shared-site-layout org loop remains historical, untouched.

## Owner-authorized live verification and release follow-up

Rafael subsequently requested two live searches: both returned six validated
recipes, recorded in verification.md. He then instructed: “Merge and deploy
this change so I can try it in the app.” This authorizes merging the reviewed
correction and preparing a release in the existing project, including its
isolated staging Preview. It does not silently accept new exact-source staging
coverage gaps before those results exist. Follow staging-first-release/spec.md:
pin a reviewed committed source, validate it on staging, obtain the owner's
exact-source scope/gap acceptance and concrete Production release authority,
then build/promote a separate same-source Production artifact.

Release preparation may additionally change sibling release/staging evidence,
`org/reviews/recipe-result-count-release.md` and append merge/release gate records
to `gates/ledger.jsonl`. Preserve existing project/configuration/domains/secrets,
databases and protection. No migration or further paid call is authorized.
