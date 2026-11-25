# T-Rex refinement specification

The latest user request amends the earlier constant-speed T-Rex contract.

- Keep the responsive full-width canvas and the complete 600×150 logical world, but display it at a 5:1 aspect ratio instead of 4:1 (20% shorter). Remove the surrounding minimum height so mobile also shrinks. Rendering maps the complete world to that shorter canvas; vertical sprite proportions compress slightly, with no clipped jumps.
- Start at 240 logical pixels/second, accelerating by 2 pixels/second per active second to a cap of 330 after 45 seconds. Use integrated distance for obstacles, horizon and score. Pause freezes active time and restart resets progression.
- Preserve three initial obstacle-free seconds. Keep existing 300–420 pixel empty gaps, proving jump/recovery safety at the cap. Preserve jump arc, collision rules, lifecycle, accessibility and request ownership.
- No dependencies, provider calls, database changes or hosted actions.
