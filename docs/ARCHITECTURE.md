# Architecture — Phase 1

`scripts/main.mjs` only registers a world-level debug setting and passive observers for Patrol's six documented detection hooks. `patrol-adapter` never returns `false`, changes documents, schedules work, or calls Patrol APIs. `dnd5e-adapter` reads prepared D&D5e 6.0.6 values only.

The pure Phase 2 engine adds a validated behavioral state machine, default behavior profiles, deterministic decision proposals, in-memory cooldown tracking, and generation checks. It is not yet wired to hooks and cannot perform actions.

Phase 3a persists an opt-in configuration under `flags.patrol-intelligence.config`. The default is disabled and `DM`. `ControlManager` invalidates its own future work through an in-memory generation before saving a mode change. It does **not** claim to stop Patrol or provide a manual-control UI.

Phase 4a normalizes a Patrol hook into a `DetectionContext`, proposes an action, and emits a local notification only on Foundry's `game.users.activeGM` client. It observes only configured, enabled tokens in `AUTO`; all proposals are cooldown-deduplicated in memory. It still performs no actions.

No movement, HUD controls, socket messages, persistent behavior state, or action execution exists in this phase.
