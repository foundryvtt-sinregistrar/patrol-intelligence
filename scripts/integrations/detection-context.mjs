import { getRelevantStatistics } from "./dnd5e-adapter.mjs";

/** Converts a Patrol hook payload into the engine's read-only input shape. */
export function createDetectionContext({ spotter, spotted, stage, config, generation, paused, inCombat }) {
  return Object.freeze({
    enabled: config.enabled,
    mode: config.mode,
    profile: config.profile,
    approvalPolicy: config.approvalPolicy,
    allowedActions: config.actions,
    cooldownMs: config.cooldownMs,
    sceneUuid: spotter?.document?.parent?.uuid ?? null,
    spotterUuid: spotter?.document?.uuid ?? null,
    spottedUuid: spotted?.document?.uuid ?? null,
    stage,
    paused: Boolean(paused),
    inCombat: Boolean(inCombat),
    isPlayerCharacterTarget: isPlayerCharacter(spotted),
    statistics: getRelevantStatistics(spotter),
    generation
  });
}

function isPlayerCharacter(token) {
  return token?.actor?.type === "character" && token.actor.hasPlayerOwner === true;
}
