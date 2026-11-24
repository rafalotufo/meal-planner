# Recipe result count — verification

2026-11-24, Node 24.15.0 / pnpm 10.33.0.

Independent plan review: `org/reviews/recipe-result-count-plan.md` approved.
Only the provider research instruction changed; no parser, payload budgets,
model, UI, authentication, database or deployment changes.

- `pnpm install --frozen-lockfile`: passed after sandbox registry DNS failure;
  approved network-enabled retry installed pinned dependencies.
- Initial `pnpm test`: could not compile because dependencies were absent.
  This was an environment failure, not a reproduction of live underfilling.
- `pnpm test` after installation and prompt correction: 82 passed, 0 failed.
  Existing fixtures exercise six distinct emitted sources, mixed rejected cards,
  native grounding, evidence isolation, request limits and parent cancellation.
- `pnpm run lint`: passed.
- `pnpm run typecheck`: passed.
- `pnpm run build`: passed, including reviewed runtime migration metadata.
- `python3 -m unittest discover -s tests`: 7 passed.
- `git diff --check`: passed.
- Changed-file secret scan: 0 findings.

Independent final review: `org/reviews/recipe-result-count-final.md` approved
with no blocking findings.

No new test merely mirrors the wording of this reversible prompt correction.
At the initial correction verification, no paid/live provider requests were made. The permissive instruction is a
plausible contributor, not a proven diagnosis of the user's exact requests:
those responses were not captured. Fixture success does not prove six live
results for chilli/pizza. The change makes the six-result target explicit;
grounding and fixed budgets can still legitimately yield fewer. Broader
database/auth/browser suites were not run for this instruction-only change.
No deployment, merge, push or hosted migration was performed.

## Subsequent authorized live evaluation

Rafael explicitly requested live searches for `chilli` and `pizza` to confirm
more than three results. Run the actual modified provider through the existing
search handler and photo enricher, with its default 60-second deadline and
unchanged payload/validation. This is a direct local service evaluation, not a
browser, authentication or deployed-production check. The temporary TypeScript
helper is in ignored `build/live-recipe-count.ts`; standalone strict typechecking
passed using the pinned compiler with `--ignoreConfig` and Node16 resolution.
No credentials or raw provider response bodies are printed or persisted.

Chilli: HTTP 200, six validated distinct recipe sources, one provider request,
model `gpt-6.2-sol`, 30,723 ms including optional photo enrichment. Titles include
Chilli con carne recipe, Creamy White Chili, Vegan chilli, Ultimate chilli con
carne, Sweet potato & black bean chilli with zesty quinoa, and Healthy chilli
con carne. More than three: confirmed for this live run.

Pizza: HTTP 200, six validated distinct recipe sources, one provider request,
model `gpt-6.2-sol`, 31,049 ms including optional photo enrichment. Titles:
Crispy Cheesy Pan Pizza, Weeknight Detroit Pizza, Grandma Pizza, No-Knead Pan
Pizza, Weeknight Neapolitan-Style Pizza, and Thin-Crust Pizza (all King Arthur).

Both live samples met the requested more-than-three threshold. This is one
sample per query; it does not guarantee six on every future search or prove
causation versus the previous prompt. No retry, settings increase or deployment
was needed. Recipe source contents were not independently manually audited.
