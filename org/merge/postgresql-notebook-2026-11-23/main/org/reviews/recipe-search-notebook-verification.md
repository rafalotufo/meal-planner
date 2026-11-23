# Recipe search notebook — local verification

Date: 2026-11-23. Branch: codex/recipe-search-notebook. Base: 766a792.
Scope: approved intent/recipe-search-notebook/intent.md, spec.md and plan.md.

## Application results

- Node v24.15.0 and pnpm10.33.0 verified.
- `pnpm install --frozen-lockfile`: exit0,401 packages installed, lockfile
  unchanged. Initial sandbox registry ENOTFOUND was resolved by the approved
  network retry; no dependency or package-manager pin changed.
- TDD red: new notebook tests failed with missing notebook module (TS2307).
  TDD green: `pnpm test`,63 tests/63 pass/0 fail, including six notebook tests.
- `pnpm run lint`: exit0, no warnings.
- `pnpm run typecheck`: exit0. An initial intentional red-test run reported
  the not-yet-written notebook module; a browser-helper request-ID guard was
  also corrected before the successful run. No suppression was added.
- Final `pnpm run build`: exit0. Next16.4.6 compiled successfully in2.8s,
  strict TypeScript passed,5 static pages generated; original protected dynamic
  routes and proxy retained.
- `pnpm run test:auth`: exit0,12 tests/12 pass/0 fail, including allowlist,
  session, anonymous access, cookie and Google verification regressions.
- `python3 -m unittest discover -s tests`: exit0,7 tests,OK.
- `git diff --check`: exit0. package.json/pnpm-lock.yaml diff: empty.
- Independent code mutation check changed <=25 to <25 in an isolated copy:
  the boundary test failed (5 pass/1 fail), proving coverage without modifying
  shared source. Independent design/code/security reports contain no required
  findings.

The bounded repository workflow additionally records full acceptance-command
exit codes, including deployment smoke unit tests, in org/loop/history.jsonl.
Final workflow/plan-sync/secret-scan outcomes are appended below when complete.

## Real browser evidence

`node --import tsx tests/auth/browser.ts`: exit0, isolated headless Google
Chrome. Passed at320,390,768,1024,1440 pixels:

- Google sign-in page and authenticated search form; provider HTTP auth fixture
  remains process-only. Real HTTPS publisher image decoded500x500 under the
  application CSP. No production fixture endpoint or authentication bypass.
- Two successful searches retained as separate, newest-first collapsible groups.
  Opening older results and returning preserves each group's filter/sort.
- Chickpeas/Pasta and25-minute pills filter visible cards; All recipes restores
  all six. Quickest first uses only known totals. All history/pill/sort actions
  caused zero additional intercepted search requests.
- Keyboard Tab/Enter, pressed state, native accessible controls,>=44px visible
  action targets, and1/2/3 card columns at the corresponding breakpoints.
- Earlier cards/groups retained during a held loading response and a deliberate
  fixture HTTP429. Error creates no history group; next successful zero-result
  search clears the error and shows the empty state.
-1000-character unbroken queries, long titles and summaries wrap without page
  overflow. Blank validation makes no request and focuses the query field.
- Reload clears all history, returning to the initial guidance. Logout and
  subsequent protected-page navigation redirect correctly; Google button still
  completes via the existing test-process-only provider fixture.
- Exactly five deliberate fixture429 resource logs required (one per width);
  unexpected console/network errors and JavaScript exceptions:[]

First keyboard harness run lacked headless page focus; the helper now brings
its isolated page to front and enables focus emulation. Expected429 logs are
asserted exactly, not globally suppressed. No application workaround was made.

Search responses are **browser-intercepted fixtures**, not live provider or
recipe-grounding evidence. Only the original publisher image load is live HTTPS.
No LLM requests or paid provider calls were made. Extra fixture cards intentionally
exercise optional-photo fallback. Existing auth/form/photo checks were preserved.

Screenshots: recipe-search-notebook-{320,390,768,1024,1440}.png and corresponding
loading/error screenshots. Desktop1440/mobile390/320 screenshots were visually
inspected; independent review also inspected mobile/desktop. All five widths
were measured for no overflow. Mobile spacing was tightened after the first
inspection and the final flow rerun passed at every width.

## Limits and release gates

History is page-local memory and clears on reload/navigation. Ingredient pills
match title words and do not verify ingredient lists. Ambiguous/missing/cook-only
times stay in All recipes. Authentication/provider/photo-transport boundaries
and dependency/configuration files were not changed. This is local readiness;
human merge and release gates remain closed. No production deployment occurred.

## Final repository checks

Bounded loop completed six role turns with status solved/phase done; all seven
configured acceptance commands exit0, including deployment smoke unit tests.
No budgets or checks were lowered. Prior deployment state/history were archived
before initialization. Plan-sync and staged zero-secret/diff checks passed
before both implementation commits. Final audit staged secret scan:0 findings; staged plan-sync and diff checks:
exit0. Loop/message/memory checks:0 violations. Independent final layout/harness review remains approved.
