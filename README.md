# Meal Planner

A Next.js App Router application for finding existing web recipes from a
description, styled with Tailwind CSS v4. Results include source links,
short cooking summaries, available photos, and source-supported cooking times.

## Local development

Use Node.js 22 or newer. Verified with Node.js 24.15.0 and npm 11.12.1.

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. The page and production build work without a
database or API credentials; live recipe search requires server configuration.

## Local worktrees

The tracked `.worktreeinclude` copies the ignored root `.env.local` into future
local Codex-managed worktrees. The file must already exist at the source
checkout's root. Existing worktrees are not backfilled, and `.env.local` remains
ignored by Git. Create worktrees from a branch containing the committed rule;
merge this branch before relying on the rule from main. See the
[Codex worktree documentation](https://learn.chatgpt.com/docs/environments/git-worktrees#copy-ignored-local-files-into-managed-worktrees).

## Recipe-search configuration

Set `OPENAI_API_KEY` in a local, git-ignored `.env.local`. Restart the server
after changing configuration. Keep the key out of client code and Git.

Optional server variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `RECIPE_SEARCH_PROVIDER` | `openai` | Provider selection; only OpenAI is implemented. Unsupported values return a controlled unavailable state. |
| `OPENAI_RECIPE_MODEL` | `gpt-6.2-sol` | A Responses model supporting web search and structured outputs. |

The provider boundary permits a future Gemini adapter without changing the
search form or endpoint. This increment makes two bounded OpenAI calls: one
researches source recipes using hosted web search, then a tool-free curator
summarizes validated source-specific candidates. Missing images use a fallback;
missing cooking times are omitted. Source fidelity still requires live sampling.

Queries/results are not persisted or logged by the application. Both model
requests use `store: false`; the description is sent to the configured provider.
Recipe photos load directly from their source hosts, without a referrer. The
server does not fetch or proxy recipe pages or images.

Each search has a 60-second deadline, at most eight hosted research tool calls,
and 5,000/3,000 output-token ceilings. A process allows two concurrent searches
and twenty accepted searches per rolling minute. These are local usage bounds;
multi-instance traffic controls and provider spending settings require review
before public deployment. No accounts or paid service provisioning are included.

## Verification and production preview

```bash
python3 -m unittest discover -s tests
npm test
npm run lint
npm run typecheck
npm run build
npm run start
```

The production preview also runs at <http://localhost:3000>. Verify the search
form and recipe cards at mobile and desktop widths, including keyboard use,
loading, no-results, error/retry, and missing-photo states without overflow.

Application behavior tests and fixtures are TypeScript. `npm test` uses the
existing TypeScript compiler to compile services and tests into ignored
`build/recipe-tests/`, then runs Node's native test runner. Injected transport
fixtures test behavior without credentials; there is no production mock mode.
A live smoke test needs a configured key and must compare returned methods,
times, photos, and links against original pages. Simulated tests do not prove
live recipe discovery. Evidence is recorded under `org/reviews/`.

Python's standard-library tests cover workflow tooling, including the active
feature plan path used by the PR and staged-change checks. Select a plan via
`--plan intent/<feature-slug>/plan.md`, or let `workflow-graph.yaml` select it.
Repositories without a graph retain the legacy root `plan.md` fallback.

## Database

Drizzle ORM and Drizzle Kit are installed for future database access and
migrations. Database engine, schema, connection settings, and migrations are
intentionally deferred until the first feature that requires persistence.

## Agent workflow

The agent org contract is in `org/org-chart.yaml` and `org/protocol.md`.
Every feature keeps its intent and specifications in `intent/<feature-slug>/`:
`intent.md`, `spec.md`, `plan.md`, and related design notes. The current feature
is in `intent/recipe-search/`. See `intent/README.md` for the convention; review and
verification evidence lives in `org/reviews/`.
Human approval remains required for merges and releases.
