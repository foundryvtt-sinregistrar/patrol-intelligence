# Integration research

## Evidence recorded on 2026-11-08

| Area | Result | Evidence |
| --- | --- | --- |
| Patrol version | Confirmed | Installed `module.json`: 5.0.10 |
| D&D5e version | Confirmed | Installed `system.json`: 6.0.6 |
| Detection hooks | Confirmed | Patrol calls each `prePatrol…` and matching `patrol…` hook with `(spotter, spotted)` Token objects |
| Hook cancellation | Confirmed | Patrol checks the return value of each `prePatrol…` hook; this module deliberately returns `undefined` |
| Per-token Patrol suspension | Blocked | Public API exposes global stepping and lookup, but no documented per-token stop/resume method |
| Prepared D&D5e paths | Confirmed | `system.abilities.int`, `system.skills.prc`, `ins`, `inv`, and `ste` are prepared by 6.0.6 actor data models |

## Decision

**GO conditioned** for passive detection, deterministic proposals, and GM-only notification. **NO-GO** for claiming exclusive manual DM control until Patrol supplies a stable public per-token suspension/resume API or an upstream integration is validated.

## Evidence recorded on 2026-11-27

Live Foundry 14.370, D&D5e 6.1.1 and Patrol 5.0.12 passed the outstanding detection and two-GM checks. Patrol's exported `game.modules.get("patrol").API.patrol.stepToken` drove real visibility detection; no synthetic detection hooks were injected. Both clients observed all six hooks with `Token5e` arguments. Only `game.users.activeGM` queued proposals, one per stage; a repeated cycle within the cooldown added none. Approval, rejection, stale generations and GM handoff also passed. [Procedure, results and limits](DND5E-6.1.1-VALIDATION.md)

The installed Patrol API exposes token lookup and stepping plus global stepping controls. This session does not establish a documented per-token suspension/resume contract or implement exclusive manual control. The decision remains **GO conditioned** for the existing passive scope.

## Reproducible manual checks

1. Enable debug logging and trigger each Patrol detection stage with a player-owned character token.
2. Confirm hook records list the expected spotter and spotted token UUIDs without changing Patrol movement.
3. Connect two GMs and verify notifications originate only on `game.users.activeGM`.
4. During Patrol movement, attempt to locate a documented public per-token suspension method. Do not use private fields, selection state, or method patches as a substitute.
