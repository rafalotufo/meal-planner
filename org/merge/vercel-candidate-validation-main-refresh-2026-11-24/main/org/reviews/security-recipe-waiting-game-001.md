# Word Snack — independent security assessment

- Role: security-researcher
- Date: 2026-11-23
- Reviewed implementation: 47a5878; feature baseline a678691 (implementation comparison also checked against 7a36d8f).
- Verdict: clear for the scoped change; no security findings or required fixes.
- Blocking: false. This assessment grants neither merge nor release approval.
- Method: source/diff review against the approved intent/spec/plan, REVIEW.md and security-and-hardening skill, with threat model and concrete abuse cases below.

## Trust boundaries and assets

The new untrusted value is the player's typed/pasted draft. It crosses a local
input-to-reducer boundary and returns to React-rendered input/text, never to a
server, provider, URL, log or persistent store. The authored puzzle catalogue is
bundled client data, not remotely supplied content. Game progress has no
authority over recipes, billing, identities or server authorization.

Existing assets remain authenticated recipe access, allowed Google identities,
session cookies, provider credentials/usage and the guarded photo-fetch
transport. The only recipe POST remains query-only at
app/recipe-search.tsx:78–79. Home authentication precedes rendering at
app/page.tsx:5; the API checks readSession before searchRecipes at
app/api/recipes/search/route.ts:10–16. Server-only identity enforcement remains
lib/session.ts:1–10. Those files and the auth/provider/photo implementation have
no feature diff; no route, action, dependency or lockfile was added.

## Abuse cases and controls

| Boundary / STRIDE lens | Concrete abuse attempt | Evidence and assessment |
| --- | --- | --- |
| Draft → UI; tampering / disclosure | Paste HTML, script fragments or unusual characters and submit. | app/word-snack.tsx:51–54 uses a controlled value and maxLength=6; lib/word-snack.ts:53 independently truncates local state. Submission allows ASCII letters only at :62–68. Feedback and found words are ordinary React text at app/word-snack.tsx:61–64; there is no raw HTML/eval/URL sink. Invalid drafts cannot execute code. |
| Draft → reducer; denial of service / tampering | Paste a large string, repeatedly submit one word, or exceed repeated-letter supply. | lib/word-snack.ts:53 bounds retained draft to six characters; :56–58 bounds tile input; :64–72 requires rack supply and catalogue membership and rejects duplicates. Found-list growth is bounded by the finite current puzzle vocabulary. Catalogue tests assert record/answer shape and the 64 KiB budget at tests/recipe-word-snack-catalogue.test.ts:5–26. These local rules are game behavior, not a server security boundary. |
| Game → recipe request; disclosure / cost abuse | Press Enter on the word form or click tiles repeatedly to submit game words to the provider or multiply paid requests. | Word form is a sibling with preventDefault at app/word-snack.tsx:14–16,48; its dispatch carries only a local action. Other game controls explicitly use type=button (:26,38,56–57). RecipeSearch has one fetch with only query at :78–79 and a pending guard at :61. Browser harness asserts one recipe request and exact query-only body at tests/auth/browser.ts:269–270. No game networking, analytics, storage or external asset path exists. |
| Response → active round; tampering | Let an older response mark a new round ready or carry typed words into another request. | app/recipe-search.tsx:57 aborts on unmount and advances generation; :73–81 assigns and verifies request generation/abort. lib/word-snack.ts:44–46 separately rejects stale ready/discard IDs. New start resets draft/found at :36–40. Unit assertions cover stale IDs and reset at tests/recipe-word-snack.test.ts:91–100. |
| Client game → auth; spoofing / elevation | Alter local progress or dispatch actions to bypass Google membership checks. | No game action reaches authorization or a backend. Existing page/API session checks above remain the authoritative boundary; changing browser state cannot grant recipe API access. No allowed-email list is imported into the new client modules or exposed through props. |
| Test fixtures → production; spoofing / disclosure | Reach a fake-user/malformed-response production endpoint or activate a fixture through game input. | New fixtures live in tests/auth/browser.ts. CDP intercepts the isolated server's exact search URL at :343 and supplies held/malformed replies at :106–111; no production fixture route or import was added. Existing test-process Google transport preload remains in tests/auth/server.ts:24–25. Production modules import no test helper. |

## Review passes

- Bugs: checked bounded transitions, duplicate/supply controls, generation and
  abort association, sibling forms and focus target construction. Focus IDs use
  local numeric request IDs and fixed strings (app/recipe-search.tsx:32–47),
  never arbitrary user selectors. No security-relevant defect found.
- Security: no injection sink, exfiltration/storage path, new privilege,
  credential exposure, server fetch, fixture bypass or dependency change found.
  Existing SSRF, session, provider usage and source-evidence safeguards are
  unchanged; this assessment does not re-certify those subsystems.
- Compliance: implementation preserves the approved local/transient game
  boundary and continued play after successful completion. No paid provider
  calls, new infrastructure or merge/release action is required by this change.

## Evidence and limitations

Direct checks in this review: read all changed application modules, the browser
fixture diff, rule/catalogue tests, approved artifacts and recorded progress;
searched new modules for network/storage/raw-output/logging sinks. A scoped
git diff --exit-code a678691..47a5878 over package.json, pnpm-lock.yaml, app/api,
session/auth/access files and provider/photo paths exited 0 with no output.

The implementer's progress.md reports 74 application tests, 12 authentication
tests, 12 deployment smoke tests, 7 workflow tests, lint, strict types, production
build and Chrome at five widths passing. This reviewer inspected the relevant
test source and evidence but did not independently rerun builds, servers or
browser flows while orchestrator acceptance was active. Browser recipe/Google
responses are fixtures, not live provider evidence. No external audit service
or paid call was used. No release was requested, so a native dependency advisory
audit was not run; unchanged dependencies are not claimed vulnerability-free.

The skill's linked shared security-checklist.md was absent from the installed
skill/reference locations. Applied the available skill's explicit checklist,
threat model and hardening-patterns.md XSS/access-control guidance instead.
Static review does not prove absence of every vulnerability or independently
verify screen-reader audio, deployment headers or existing auth-rate-limit
configuration. None of these limits represents a newly introduced feature
finding. Human merge/release gates remain intact.
