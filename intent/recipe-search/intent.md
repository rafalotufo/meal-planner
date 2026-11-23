# Meal Planner — recipe search

- Author: product-manager, from Rafael's request
- Source: `org/intake/forms/recipe-search-001.md`
- Status: Accepted for Design under the org PM intent gate
- Decision: `org/reviews/intent-recipe-search-001.md`
- Date: 2026-11-23

## Problem

Meal Planner currently displays only its heading. Users cannot describe a meal
they want to cook and discover recipes that match their needs, or compare the
information needed to decide which recipe to try.

## Proposed outcome

Users enter a free-text description of recipes they want to find, such as
"a quick vegetarian dinner with chickpeas." LLM agents search for existing
recipes and present relevant results in a clear, responsive interface. Each
result lets the user review the recipe and open its original source.

The CEO confirmed that search discovers existing web recipes and links to
their original sources. The LLM provider must be configurable: implement
OpenAI API first and preserve a small provider boundary so another provider,
such as Gemini, can be added later.

### Acceptance criteria

- A visitor can enter a nonempty textual description and submit a recipe
  search. Whitespace-only input is rejected with a useful inline message.
- A configured search uses LLM agents to find existing recipes relevant to the
  description. Displayed recipes are grounded in retrieved sources; invented
  recipes or fixture results do not count as a successful live search.
- Results display a recipe title, a picture when available, a concise summary
  of how to cook it, and a clearly identifiable link to its original recipe.
- Cooking time is shown only when supported by the source. Missing time is
  omitted or labeled unavailable; it is never guessed. If a source provides
  only total preparation-and-cooking time, the label distinguishes that from
  cooking time.
- A missing or failed picture has an intentional fallback that keeps the card
  readable; the application does not fabricate a recipe photo.
- Summaries faithfully condense the source's method rather than presenting
  unsupported instructions. A result without sufficient cooking information
  is not presented as a fully summarized recipe.
- The interface provides clear idle, searching, results, no-results, and
  recoverable failure states. Another search can be submitted after completion
  or failure, and a stale response cannot replace newer results.
- Search controls have visible labels, work with a keyboard, and results remain
  easy to scan without horizontal overflow at mobile and desktop sizes.
- Model/search credentials remain server-side. Missing configuration produces
  a useful failure rather than fabricated results or exposed provider details.
- Provider selection is configurable through server-side configuration. OpenAI
  API is the only provider implemented in this increment; unsupported selections
  fail clearly. The provider boundary permits future integrations without
  coupling the search interface to OpenAI-specific request or response shapes.
- The existing required lint, typecheck, build, workflow regression, secret,
  and real-browser checks pass; new behavior receives meaningful automated
  coverage and both successful and failed search flows are verified.

## Affected users and systems

Visitors gain recipe discovery on the existing Meal Planner web application.
The app gains a search interface and a server-side LLM/search integration.
The initial home-page title-only restriction applies to the previous increment;
this intent authorizes the recipe-search interface once spec and plan gates
approve it. The existing Next.js, TypeScript, and Tailwind foundation remains.

## Constraints

- Use `intent/recipe-search/` for feature specifications and design notes.
- Preserve org audit history, independent spec/plan/code/security reviews,
  bounded turns, and human merge/release approval.
- Use retrieved recipe sources and maintain attribution. Treat user text and
  retrieved content as untrusted input; provider usage, request bounds,
  timeouts, URL/image handling, and error handling require explicit design.
- Do not commit credentials, require a database, or persist visitor queries
  merely to support this search feature.
- Use OpenAI API for the initial implementation, with configurable provider
  selection and a small provider abstraction. Model, search tooling, and the
  minimum useful agent arrangement remain architecture decisions. Creating
  paid accounts or provisioning paid services is not authorized by this intent.

## Out of scope

Recipe generation, user accounts, saved recipes, search history, meal plans,
shopping lists, database provisioning or migrations, nutrition analysis,
medical or allergy guarantees, autonomous cooking actions, and production
deployment. Extra filters, pagination, and streaming are deferred unless the
approved design establishes that they are necessary for the initial search.
Implementing Gemini or other additional providers is deferred to a future
increment; do not add speculative provider adapters now.

## Open questions

- Architect must define retrieval/grounding, result limits, agent responsibilities,
  latency and cost bounds, trustworthy source extraction, picture delivery,
  safe link handling, the small configurable provider boundary, and test/live
  verification strategy before implementation.

These technical questions belong in Design. Live-provider verification requires
an authorized configured service; deterministic tests alone cannot establish
that live recipe discovery works.
