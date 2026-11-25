# Brave parallel recipe search — formal security review

- Reviewer: security-researcher, independent of implementation author.
- Application source: `2989467`; workflow handoff: `e1c2a27`.
- Later audit/amendment commits inspected through `985cea9`; application source
  under app/lib/tests and configuration/documentation was unchanged at review.
- Inputs: accepted intent, independently approved spec/plan, principal-H1
  amendment `53609f3` and independent amendment review, `threat-model.md`,
  `verification.md`, retained `live-verification.md` and source/test diffs.
- Verdict: **Approved for this local implementation security gate. No open
  blocking security findings identified.** This is not merge/release approval,
  deployment authority or a claim that broad-query live quality has passed.

## Findings and resolution

Earlier medium cleanup checkpoint `security-researcher-0032` is closed with
code/test evidence in `e25c2eb`. Current `lib/recipes/brave.ts:12–39` cancels
non-success bodies and retains an in-flight cancellation promise before leaving
its operation. The independent reader/pool regression proves a cancelled caller
cannot release the body lease before an abort-ignoring cancellation settles.
No additional blocking finding resulted from this review.

## Security boundaries assessed

- **Admission/configuration:** `lib/recipes/search.ts:88–98` fails unavailable
  before effects when keys/selector are absent or unsupported; no old provider
  fallback. `lib/recipes/server.ts` owns private environment reads behind its
  existing server-only boundary. Auth policy, session/family guard, search route,
  proxy, Vercel duration/cancellation and menu endpoint validators/guards have
  no diff from the baseline. Test servers force both Brave aliases and OpenAI
  keys empty after configuration overrides (`tests/auth/server.ts:26`).
- **Bounded external effects:** `brave.ts:41–63` uses one fixed Brave endpoint,
  bounded body/20hit parsing, safe normalized URLs and no redirects. The
  coordinator reserves24source attempts before scheduling, expands at most two
  parent collections without recursion, selects at most12curations and reserves
  aggregate prepared input before paid work (`parallel-search.ts:23–77`).
  Prepared JSON input and instruction/schema byte bounds are checked before
  model calls (`curation.ts:11–15`); each tool-free request uses store:false,
  low reasoning and1200output tokens. No retries or model-generated URLs.
- **Shared capacity and cancellation:** `concurrency.ts:5–49` has shared
  source2/model12 pools and finite FIFO queues. Queued abort removes the job;
  active abort stops caller waiting while retaining its underlying lease until
  work settles. Source DNS/HTML and model response consumption are inside the
  lease. Parent/deadline signals are checked again after source/model work;
  valid sibling cards do not override parent abort. Per-process controls are
  explicitly not distributed account-spending enforcement.
- **SSRF/source association:** `photo-transport.ts` is unchanged, preserving
  all-address public DNS validation, pinned native HTTPS/hostname validation,
  no redirects/proxy/credentials and strict byte/time/encoding bounds. Every
  expanded child goes through this transport. Source parsing ignores HTML base,
  navigation/header links and unsafe follow-ups; bounds HTML/scripts/nodes/depth;
  checks singular heading, canonical/declared recipe identities and title
  consistency before curation (`source.ts:58–143`). Collection classification
  overrides an embedded Recipe. The header correction admits only principal
  content heading identity without enabling suppressed links/body evidence.
- **Untrusted model/output:** `curation.ts:29–50` requires completed non-refused
  exact schema, bounded valid text, a supplied observed title, and nonempty
  normalized exact method/ingredient excerpts from that source. The public URL
  is server-owned. Optional time/photos are deterministic from source metadata,
  not model output. Recipe cards render text and safe links; no source/model
  HTML execution or server image download was introduced. No runtime logging or
  persistence of raw source/query/model/error/credential data was added.
- **Twelve-card menu flow:** `notebook.ts:74–84` validates up to12sources and
  chunks into at most two existing six-URL requests. `search-notebook.tsx:32–76`
  validates each response against its own chunk, preserves unknown status on
  partial failure, cancels old selection jobs, checks generations and reconciles
  save versions so a delayed lookup cannot overwrite a newer successful save.
  No endpoint bound, family scope or save authorization was expanded.

## Independent verification and limits

Independently ran `pnpm test` on the assessed source: exit0,106passed,0failed/
skipped/cancelled (`/private/tmp/brave-security-independent-tests.log`). This
strictly compiles and runs recipe/photo, URL/DNS/TLS/SSRF, queue/body lifetime,
source identity/collection/header, curation/encoded-input, handler and notebook
helper regressions. Also checked `git diff --check`, org message consistency,
and the unchanged protected boundary file set. No app/test source was edited
by this reviewer and no paid or hosted call was made.

The developer reports lint/typecheck/build,34family,69menu,16auth,33deployment,
7Python and isolated Chrome390/1440 checks passing; these were inspected in
`verification.md`, not independently rerun here. They use isolated databases/
servers/profiles and empty paid keys. Browser evidence covers saved cards7/12,
partial chunk errors/retry, out-of-chunk rejection, save reconciliation,
selection abort, filters/focus and responsive layout.

The original named live smoke returned8cards; the original broad smoke failed
502 with no curation calls. Those remain actual observations. Offline parser
replay and fixtures do not establish corrected live quality. One corrective
broad smoke has separate independent amendment approval; its result and final
code/quality review remain distinct from this security verdict. Exact excerpts
are structural grounding, not proof of every dietary preference or source fact.
No production-scale throughput, uncached latency or distributed-spend assurance
is granted. Human merge/release and hosted configuration gates remain intact.
