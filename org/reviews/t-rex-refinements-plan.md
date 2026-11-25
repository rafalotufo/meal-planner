# T-Rex refinement plan review

Reviewer: independent review agent, 2026-11-24.

Verdict: approve for local implementation and verification; no merge or release authority.

Reviewed the new intent/spec/plan against Rafael's request and intent/t-rex-runner/spec.md. The request authorizes changing the earlier fixed-speed and height contracts. A 5:1 full-width canvas reduces displayed height by 20% while preserving the complete logical jump area; the documented mild vertical compression is a reasonable bounded tradeoff. Keep the CSS, canvas backing size and DPR transform consistent, and visually inspect recognizability at narrow widths.

The 240→330px/s cap with 2px/s² acceleration preserves an approachable starting speed. At the cap, the minimum 300px empty gap provides about 909ms versus a 556ms jump plus 300ms recovery, so the mathematical margin is positive; simulation must still demonstrate collision-box safety. Distance must integrate acceleration, including a frame that crosses the cap. Preserve the full three-second obstacle-free opening using the accelerated opening distance (729px), rather than the old 720px threshold.

Planned tests cover acceleration, pause/restart, grace period, jumpability and responsive dimensions; existing lifecycle/accessibility tests remain applicable. Preserve historical screenshot evidence and record command failures honestly. No required plan changes.
