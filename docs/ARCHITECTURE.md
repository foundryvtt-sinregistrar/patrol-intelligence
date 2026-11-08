# Architecture — Phase 1

`scripts/main.mjs` only registers a world-level debug setting and passive observers for Patrol's six documented detection hooks. `patrol-adapter` never returns `false`, changes documents, schedules work, or calls Patrol APIs. `dnd5e-adapter` reads prepared D&D5e 6.0.6 values only.

The pure Phase 2 engine adds a validated behavioral state machine, default behavior profiles, deterministic decision proposals, in-memory cooldown tracking, and generation checks. It is not yet wired to hooks and cannot perform actions.

No authority election, token flags, movement, HUD controls, socket messages, or action execution exists in this phase.
