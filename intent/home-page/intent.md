# Meal Planner — initial home page

- Author: Rafael
- Source: `org/intake/forms/home-page-001.md`; CEO reply `org/messages/ceo-0001.md`
- Status: Accepted
- Accepted by: product-manager under the org intent gate
- Date: 2026-11-23

## Problem

Meal Planner has an agent-org workflow but no application home page. The owner needs the first runnable web application foundation before adding meal-planning features.

## Proposed outcome

Create a web application using the latest stable Next.js, Tailwind CSS v4, and Drizzle tooling for future database access and migrations. The initial home page is blank except for the title `Meal Planner`.

### Acceptance criteria

- Opening `/` in a browser succeeds and shows one visible page heading with the exact text `Meal Planner`.
- The page contains no other product content, navigation, controls, or images.
- The heading remains readable and the page has no horizontal overflow at mobile and desktop viewport sizes.
- The application runs locally and its production build succeeds.
- Dependencies record the selected stable Next.js release, Tailwind CSS major version 4, and Drizzle ORM/migration tooling.
- Viewing or building this initial page requires no database connection, credentials, or provisioning.

## Affected users and systems

Rafael owns the product decision. Initial visitors see the title-only home page. The repository gains the application foundation and local development setup; existing org workflow artifacts remain available.

## Constraints

- Use the latest stable Next.js, excluding canary/prerelease versions, verified during dependency selection.
- Use Tailwind CSS v4, superseding the original v3 request.
- Install Drizzle ORM and migration tooling now. Defer the database engine, schema, connection configuration, and generated/executed migrations until a feature needs stored data.
- Keep the visible page minimal and usable on mobile and desktop.
- Follow org spec, plan, independent review, merge, and release gates.

## Out of scope

Deployment, hosting selection, authentication, recipes, meal-plan generation, shopping lists, theme switching, database provisioning, schemas, migrations, and additional product interface or behavior.

## Open questions

Database engine and hosting are undecided and deferred; neither blocks this title-only page. Exact package versions and compatible local runtime requirements are technical design decisions to verify from official sources.
