# Architecture — Phase 1

`scripts/main.mjs` only registers a world-level debug setting and passive observers for Patrol's six documented detection hooks. `patrol-adapter` never returns `false`, changes documents, schedules work, or calls Patrol APIs. `dnd5e-adapter` reads prepared D&D5e 6.0.6 values only.

The pure Phase 2 engine adds a validated behavioral state machine, default behavior profiles, deterministic decision proposals, in-memory cooldown tracking, and generation checks. It is not yet wired to hooks and cannot perform actions.

Phase 3a persists an opt-in configuration under `flags.patrol-intelligence.config`. The default is disabled and `DM`. `ControlManager` invalidates its own future work through an in-memory generation before saving a mode change. It does **not** claim to stop Patrol or provide a manual-control UI.

Phase 4a normalizes a Patrol hook into a `DetectionContext`, proposes an action, and emits a local notification only on Foundry's `game.users.activeGM` client. It observes only configured, enabled tokens in `AUTO`; all proposals are cooldown-deduplicated in memory. It still performs no actions.

Phase 4b queues only approval-required decisions in the active GM's memory. Queue resolution validates the originating control generation and marks outdated work `STALE`; approval or rejection still has no action executor.

No movement, HUD controls, socket messages, persistent behavior state, or action execution exists in this phase.

The existing passive flow was verified on 2026-11-27 with Foundry 14.370, D&D5e 6.1.1 and Patrol 5.0.12, including genuine detection and two simultaneous GM clients. No runtime or schema changes were required. Queues, cooldowns and control generations remain local to each client; they are not transferred on GM handoff. [Validation](DND5E-6.1.1-VALIDATION.md)
