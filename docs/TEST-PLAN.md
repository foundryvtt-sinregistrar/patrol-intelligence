# Test plan — Phase 1

1. Enable Patrol Intelligence in a D&D5e 6.0.6 world with Patrol 5.0.10 active.
2. Confirm the module loads with no console errors.
3. Enable **Debug logging** as a GM.
4. Cause Patrol to reach each available detection stage and confirm each console record identifies the hook and both token UUIDs.
5. Confirm Patrol's original movement and state transitions are unchanged with debug both enabled and disabled.
6. Repeat with Patrol disabled: the module must warn once and register no observers.

## Phase 2 automated checks

Run `node --test tests/engine.test.mjs`. These tests cover state validation, mode blocking, default authorization, deterministic profiles, and cooldown expiry without requiring Foundry.

## Phase 3a manual checks

1. On an enabled module in a D&D5e world, confirm `game.modules.get("patrol-intelligence").api.getTokenConfig(token.document)` returns a disabled `DM` configuration for an unconfigured token.
2. From a GM client only, use the exposed control API to change a mode and verify that only the token's `flags.patrol-intelligence.config` changes.
3. Confirm that the mode change does not stop, start, or otherwise alter Patrol movement.

## Phase 4a manual checks

1. Configure one Patrol token with `enabled: true` and `mode: AUTO` using the module API; leave another token at defaults.
2. As the active GM, trigger a Patrol detection for the configured token and verify one GM-only proposal notification appears.
3. Repeat inside its configured cooldown: no second notification should appear.
4. Confirm no notification for the disabled token, a non-character target, a paused game, combat, or `DM` mode.
5. With two GMs connected, confirm only Foundry's active GM sees a proposal.

## Phase 4b manual checks

1. Trigger a proposal requiring approval, then inspect `game.modules.get("patrol-intelligence").api.proposals.list()` from the active GM.
2. Call `approve(id)` or `reject(id)` and verify its status changes. Neither call may move a token or update a document.
3. Change the token mode before resolving a pending proposal; resolution must return `STALE`.
