# Owner-requested classified plan regeneration

- Owner request: “lets delete the current plan and trigger a new one that will use the classifications”.
- New one-operation data authority, separate from the consumed release scope.
- Only Production target: Neon `plain-pond-82425009`, branch `br-wild-dust-bbr2mvzw`,
  database `meal_planner`, direct endpoint `ep-lively-tooth-bbi1n111.c-15.us-east-1.aws.neon.tech`.
- Only family: `43d6ebb2-8115-4c38-ad63-65b153cb128e`.
- Only current plan: `d8ad41c1-e840-401e-998f-88d5101c7781`, week `2026-11-29`
  (November29–December5), draft revision1, seven recipes, no approvals/suggestions.
- Fresh read-only inspection found exactly one plan and enough ready categorized
  menu recipes:17main,3side,3veggie. No user emails, subjects or recipe contents
  were exposed in inspection output.
- Execution authority expires: `2026-11-27T19:21:44Z`.

The owner authorizes deleting this exact current draft and creating its replacement
for the SAME family and week using the deployed fixed source
`f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5` generation function. Use the actual
current timestamp; no fake Wednesday, runtime date override, global cron invocation
or schedule change. The existing `generateFamilyPlan` selection supplies4main,
2side and2veggie distinct ready recipes. Do not recreate or edit menu recipes.

Privately preserve a mode0600 snapshot of the old plan and its dependent approvals/
suggestions before effects. A single READ COMMITTED connection must take the common
family advisory lock before decision reads, recheck exact target/latest draft,
revision/family/week, current eligibility and sufficient categorized menu, then
remove only its dependent rows and old draft and invoke the existing generation
function. Validate exactly one new draft with eight unique source URLs and4/2/2
categories before COMMIT. Any failure rolls back the whole transaction, retaining
the old plan; no externally visible empty-plan interval is intended. Stop on
unexplained drift or ambiguous targets; never overwrite a different/newly finalized
plan. Existing app admission and family checks remain unchanged.

Review the exact temporary operator helper and rollback-only rehearsal before
persistent execution, without another human permission request for this authorized
scope. Verify afterward through independent read-only SQL, exact replacement ID,
category counts and unchanged unrelated tables, schema/history/grants. Retain only
sanitized audit output. No schema/grant changes, application code/deployment,
other-family/week deletion, invitation/identity effect, provider call, synthetic
principal or backup restore is authorized. Cleanup only this operation's private
credential copies. The narrow backup is retained privately, not committed or used
as automatic restoration authority. This request grants no standing deletion or
regeneration permission for future plans.
