import assert from "node:assert/strict";
import test from "node:test";
import { ACTIONS } from "../scripts/engine/behavior-profiles.mjs";
import { DEFAULT_TOKEN_CONFIG, normalizeTokenConfig } from "../scripts/control/token-config.mjs";
import { createDetectionContext } from "../scripts/integrations/detection-context.mjs";
import { CooldownTracker, detectionKey } from "../scripts/engine/cooldown-tracker.mjs";
import { CONTROL_MODES, proposeDecision } from "../scripts/engine/decision-engine.mjs";
import { BEHAVIOR_STATES, canTransition, transition } from "../scripts/engine/state-machine.mjs";

const context = Object.freeze({
  enabled: true, mode: CONTROL_MODES.AUTO, paused: false, inCombat: false,
  isPlayerCharacterTarget: true, sceneUuid: "Scene.a", spotterUuid: "Scene.a.Token.g",
  spottedUuid: "Scene.a.Token.p", stage: "suspicious", profile: "GUARD",
  approvalPolicy: "RISKY_ONLY", generation: 4
});

test("guard investigates a valid suspicious detection", () => {
  const decision = proposeDecision(context);
  assert.equal(decision.kind, "DECISION");
  assert.equal(decision.action, ACTIONS.INVESTIGATE);
  assert.equal(decision.nextState, BEHAVIOR_STATES.INVESTIGATING);
  assert.equal(decision.requiresApproval, false);
});

test("DM mode emits no autonomous proposal", () => {
  const decision = proposeDecision({ ...context, mode: CONTROL_MODES.DM });
  assert.deepEqual(decision, { kind: "NO_ACTION", reason: "DM_CONTROL", generation: 4 });
});

test("pursuit requires approval under the default policy", () => {
  const decision = proposeDecision({ ...context, stage: "alerted", profile: "HOSTILE" });
  assert.equal(decision.action, ACTIONS.PURSUE);
  assert.equal(decision.requiresApproval, true);
});

test("state transitions reject impossible jumps", () => {
  assert.equal(canTransition(BEHAVIOR_STATES.PATROLLING, BEHAVIOR_STATES.SUSPICIOUS), true);
  assert.throws(() => transition({ from: "PATROLLING", to: "FLEEING", reason: "test", generation: 1 }));
});

test("cooldown keys deduplicate the same observation", () => {
  const tracker = new CooldownTracker();
  const key = detectionKey({ ...context, stage: "suspicious" });
  tracker.record(key, 5000, 1000);
  assert.equal(tracker.isCoolingDown(key, 5999), true);
  assert.equal(tracker.isCoolingDown(key, 6000), false);
});

test("token configuration starts disabled and rejects invalid input", () => {
  assert.equal(normalizeTokenConfig().enabled, false);
  assert.equal(normalizeTokenConfig({ mode: "INVALID", cooldownMs: -5 }).mode, DEFAULT_TOKEN_CONFIG.mode);
  assert.equal(normalizeTokenConfig({ mode: "INVALID", cooldownMs: -5 }).cooldownMs, 0);
});

test("detection context admits only a player-owned character target", () => {
  const spotter = { document: { uuid: "Scene.a.Token.g", parent: { uuid: "Scene.a" } }, actor: { system: {} } };
  const spotted = { document: { uuid: "Scene.a.Token.p" }, actor: { type: "character", hasPlayerOwner: true } };
  const detection = createDetectionContext({
    spotter, spotted, stage: "suspicious", config: DEFAULT_TOKEN_CONFIG, generation: 3
  });
  assert.equal(detection.isPlayerCharacterTarget, true);
  assert.equal(detection.statistics.intelligence, null);
});
