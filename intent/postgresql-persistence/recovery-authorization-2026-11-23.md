# PostgreSQL corrected-source release and resume authorization

Rafael answered "yes" to: "Approve merging this correction and redeploying/resuming Production, using the already-approved two-search allowance?" The reviewed correction is a38740c6331413f653aec075681f33eea949210a. This is fresh source-specific merge/release/resume authority, not reuse of the failed7c651c2 release record.

- Source:a38740c6331413f653aec075681f33eea949210a, independently code/security reviewed and127Node+7Python/strict/production+cold-development browser checks passed; now fast-forward merged to local main.
- Target:Vercel meal-planner / prj_ntxXnJAVA977jHjLNDR7xJuwSx4V / team_2c0O29FMb91g7L6sUChc9v6J / rafalotufos-projects, Hobby, stable origin https://meal-planner-delta-six-55.vercel.app.
- Database:existing Neon Production plain-pond-82425009 / br-wild-dust-bbr2mvzw / meal_planner, already migrated; runtime restricted role only. No migration/import/reset is authorized or needed.
- Actions:stage this reviewed clean source as Production with --skip-domain, inspect candidate/readiness/config, promote that exact artifact and resume only this paused project, then15-minute first-live checks. Preserve Preview, auth/protection, credentials and billing settings.
- Paid budget:the original allowance is entirely unused; one normal real recipe search and at most one disconnect search, no paid retries. One maximum21request anonymous WAF burst from a quiet window, no provider effects. UI navigation may exercise the disconnect only with actual in-flight abort and correlated hosted cancellation metadata; navigation alone is inconclusive.
- Existing platform authentication may satisfy response-level candidate checks using the already-existing automation credential held only in memory for the exact candidate origin; no secret creation/settings change, app-cookie reuse, Host override, URL/argv/credential logging.
- Expiry:2026-11-24T01:00:00Z.
- Recovery:keep paused until the staged artifact is verified where platform permits; on failed/incomplete mandatory live checks pause only meal-planner, preserve current PostgreSQL data, no rollback to pre-family code or restoration of the empty pre-release snapshot over later writes. Owner performs interactive pause confirmation if required by the existing runbook. No blanket team action, key revocation or extra deployment authority.

The first failed artifact and all correction/review/test evidence remain preserved. Upload is a clean export of the reviewed merged source; operator env/private data and the user's next-env.d.ts development edit are excluded.
