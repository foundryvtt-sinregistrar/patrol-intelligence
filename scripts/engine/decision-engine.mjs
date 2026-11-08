import { ACTIONS, normalizeProfile, reactionsFor } from "./behavior-profiles.mjs";
import { BEHAVIOR_STATES } from "./state-machine.mjs";

export const CONTROL_MODES = Object.freeze({ AUTO: "AUTO", DM: "DM" });
export const APPROVAL_POLICIES = Object.freeze({ ALWAYS: "ALWAYS", RISKY_ONLY: "RISKY_ONLY", NONE: "NONE" });

const STAGE_TO_SEVERITY = Object.freeze({
  suspicious: "SUSPICIOUS",
  alerted: "ALERTED",
  spotted: "ALERTED"
});

const RISKY_ACTIONS = new Set([ACTIONS.PURSUE]);

/**
 * Produce a proposal only. This function has no Foundry dependency and never performs an action.
 * `context` must be a previously normalized, permission-safe detection snapshot.
 */
export function proposeDecision(context) {
  const blocked = blockedReason(context);
  if (blocked) return Object.freeze({ kind: "NO_ACTION", reason: blocked, generation: context.generation });

  const severity = STAGE_TO_SEVERITY[context.stage];
  if (!severity) return Object.freeze({ kind: "NO_ACTION", reason: "UNKNOWN_STAGE", generation: context.generation });

  const profile = normalizeProfile(context.profile);
  const permitted = new Set(context.allowedActions ?? Object.values(ACTIONS));
  const action = reactionsFor(profile, severity).find(candidate => permitted.has(candidate)) ?? ACTIONS.NOTIFY_DM;

  return Object.freeze({
    kind: "DECISION",
    action,
    targetUuid: context.spottedUuid,
    profile,
    nextState: nextStateFor(action, severity),
    requiresApproval: requiresApproval(action, context.approvalPolicy),
    reason: `${profile}:${context.stage}`,
    generation: context.generation
  });
}

export function isCurrentGeneration(decision, currentGeneration) {
  return decision?.generation === currentGeneration;
}

function blockedReason(context) {
  if (!context.enabled) return "DISABLED";
  if (context.mode !== CONTROL_MODES.AUTO) return "DM_CONTROL";
  if (context.paused) return "PAUSED";
  if (context.inCombat) return "COMBAT";
  if (!context.isPlayerCharacterTarget) return "INVALID_TARGET";
  if (!context.sceneUuid || !context.spotterUuid || !context.spottedUuid) return "INCOMPLETE_CONTEXT";
  return null;
}

function nextStateFor(action, severity) {
  if (action === ACTIONS.INVESTIGATE) return BEHAVIOR_STATES.INVESTIGATING;
  if (action === ACTIONS.WARN) return BEHAVIOR_STATES.INTERACTING;
  if (action === ACTIONS.PURSUE) return BEHAVIOR_STATES.PURSUING;
  if (action === ACTIONS.FLEE) return BEHAVIOR_STATES.FLEEING;
  return severity === "SUSPICIOUS" ? BEHAVIOR_STATES.SUSPICIOUS : BEHAVIOR_STATES.ALERTED;
}

function requiresApproval(action, policy = APPROVAL_POLICIES.RISKY_ONLY) {
  if (policy === APPROVAL_POLICIES.ALWAYS) return true;
  if (RISKY_ACTIONS.has(action)) return true;
  return false;
}
