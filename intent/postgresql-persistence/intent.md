# PostgreSQL persistence and Mac development setup

Source: Rafael’s delegated request, 2026-11-23. Base: 17318251dbe671a0bdd2570100091f024673c158.
Status: Accepted — independent product-manager review under org/protocol.md; org/reviews/postgresql-design-001.md.

Replace family SQLite persistence with PostgreSQL in local development and Vercel-compatible code. PostgreSQL is selected. Preserve verified Google subjects, current admission and family checks, invitation-first onboarding, durable grants, uniqueness, atomic mutations, paid-provider guards, and all recipe/photo behavior.

Authorized: dedicated persistent loopback-only Mac database using native Homebrew PostgreSQL per Rafael’s subsequent preference, restricted credentials in ignored private files, isolated real-PostgreSQL tests, explicit local migrations, code/docs/browser verification and independent reviews. Preserve existing SQLite data. Investigate preservation needs before removing its runtime path. No hosted provisioning, production environment updates/migrations, deployment, paid calls, source-worktree changes, merges or reused release approvals.

Acceptance: reproducible local setup/start/stop, strict supported driver/Drizzle evaluation without suppressions, reviewed PostgreSQL SQL/history and rollback, multi-process race/authorization regressions on real PostgreSQL, lint/typecheck/build/recipe/auth/family/deployment/Python/secret checks, real browser mobile/desktop verification, setup and future Neon configuration instructions, independent design/code/security reviews. Existing audit history remains intact.
