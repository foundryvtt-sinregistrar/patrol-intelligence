# Test plan — Phase 1

1. Enable Patrol Intelligence in a D&D5e 6.0.6 world with Patrol 5.0.10 active.
2. Confirm the module loads with no console errors.
3. Enable **Debug logging** as a GM.
4. Cause Patrol to reach each available detection stage and confirm each console record identifies the hook and both token UUIDs.
5. Confirm Patrol's original movement and state transitions are unchanged with debug both enabled and disabled.
6. Repeat with Patrol disabled: the module must warn once and register no observers.

## Phase 2 automated checks

Run `node --test tests/engine.test.mjs`. These tests cover state validation, mode blocking, default authorization, deterministic profiles, and cooldown expiry without requiring Foundry.
