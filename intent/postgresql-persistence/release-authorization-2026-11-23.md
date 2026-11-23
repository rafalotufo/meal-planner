# PostgreSQL Production release authorization

Owner Rafael explicitly authorized: "Merge to main, run searches and deploy to prod" after reviewing candidate7c651c2 and the at-most-two paid verification searches. This grants the distinct human source merge and fresh release/live-check authority; no prior release approval is reused.

- Reviewed source:7c651c24c2a85a303137be88c8315a4cae6a1197, now fast-forward merged to local main.
- Vercel project:prj_ntxXnJAVA977jHjLNDR7xJuwSx4V, scope rafalotufos-projects, team_2c0O29FMb91g7L6sUChc9v6J, Hobby.
- Production origin:https://meal-planner-delta-six-55.vercel.app.
- Production database:Neon plain-pond-82425009 / br-wild-dust-bbr2mvzw / meal_planner; existing migrated schema and restricted runtime role.
- Authorized actions:Production-target staging with --prod --skip-domain, candidate/readiness/config inspection, promotion of that exact artifact and15-minute first-live verification; one normal paid recipe search, at most one disconnect paid search, maximum21anonymous WAF requests from a quiet window. No paid retries, extra infrastructure, migrations, billing changes or Preview changes.
- Expiry:2026-11-24T01:00:00Z. Stop if authority expires before action.
- Recovery:before promotion leave current live revision intact on any failed staging check. After promotion preserve current PostgreSQL data and fail closed/pause only this project on failed/incomplete mandatory checks. Do not revert to pre-family code or restore the empty snapshot over new memberships/grants. Existing interactive pause confirmation remains owner-operated if required.
- Source checkout for upload:clean export of the reviewed merged SHA, with committed release/audit records excluded by .vercelignore; no local env/private state/user development next-env change enters upload. No application code changes after review.

The runbook's real Google/live provider/cancellation/WAF checks remain required; fixture-only results are not live evidence. Record actual results and inconclusive limits precisely.
