# Hosted synthetic browser helper — independent preparation review 001

- Reviewer: reviewer; date: 2026-11-25
- Scope: excluded `hosted-browser.ts`, pure tests and bounded helper plan
- Fixed application source remains `19774c7cd8ae301682003838f083b9d825d5e56d`
- Verdict: **No blocking findings; suitable for root's separately authorized
  bounded execution after preparation typecheck succeeds.**

The helper validates canonical owner-only private files and bounded exact input
shapes before starting Chrome. One invocation accepts exactly one capability/
member and one declared390 or1440 width. It uses a new owned profile, standard TLS,
normal network resolution and native keyboard/form submission; no real profile,
app-cookie injection, custom identity headers, insecure-certificate bypass or
local server/database fixture enters the hosted path.

Request interception permits canonical HTTPS navigation and the supplied share
origin only during bootstrap. Non-GET effects are restricted to one native
exchange and normal logout; Google/auth sign-in and recipe-provider requests are
blocked before dispatch. `vercel.live` assets are blocked and counted as a platform
proof gap rather than silently declared functional platform coverage. A challenge
or failed canonical entry cannot produce successful authenticated app evidence.
The exact scoped link and deployment binding still need root's independent
inspection; the hardcoded report SHA is explicitly expected attribution, not a
browser-derived deployment proof.

The helper types the private credential only into the password input and captures
entry before typing. Later screenshots follow authenticated navigation and show
synthetic data only. CDP request bodies, input arguments, URLs, console contents
and arbitrary errors are neither logged nor included in reports. Raw credentials
and the share link remain in private process memory, which is necessary for use;
this code does not claim resistance to an observer of that private process.

Status tracking correctly reads native303 from redirectResponse as well as normal
responseReceived events. Session200, app landmarks/overflow, logout200, session401
and protected-page redirect are checked separately. Reports retain only bounded
statuses/booleans/counts/version/stage and explicit browser/OAuth/provider/platform
gaps; releaseAccepted stays false. Per-command/run bounds, rejection of pending
commands, owned process termination and profile deletion cover success and failure.
Root retains responsibility for the run/link revocation, hosted owned-data cleanup,
private input files and approved screenshot/report destinations.

Independently ran pure helper tests: **2 passed, exit0**, without opening Chrome or
making network/database requests. Targeted ESLint and `git diff --check`: **exit0**.
Typecheck completion is implementer/root evidence pending at review dispatch.
This review performed no live browser, hosted request, Git, database, credential
issuance or org-state change; only this review artifact was created. Operational
success and exact release acceptance must come from the actual bounded execution.
