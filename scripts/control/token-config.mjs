import { ACTIONS, PROFILES } from "../engine/behavior-profiles.mjs";
import { APPROVAL_POLICIES, CONTROL_MODES } from "../engine/decision-engine.mjs";
import { MODULE_ID } from "../constants.mjs";

export const CONFIG_FLAG = "config";
export const CONFIG_VERSION = 1;

export const DEFAULT_TOKEN_CONFIG = Object.freeze({
  version: CONFIG_VERSION,
  enabled: false,
  mode: CONTROL_MODES.DM,
  profile: PROFILES.GUARD,
  approvalPolicy: APPROVAL_POLICIES.RISKY_ONLY,
  detectionPolicy: "STEALTH_WHEN_APPLICABLE",
  faction: "",
  attitude: "UNKNOWN",
  cooldownMs: 5000,
  actions: Object.freeze([ACTIONS.OBSERVE, ACTIONS.INVESTIGATE, ACTIONS.WARN, ACTIONS.NOTIFY_DM])
});

const ACTION_SET = new Set(Object.values(ACTIONS));

export function normalizeTokenConfig(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const actions = Array.isArray(source.actions) ? source.actions.filter(action => ACTION_SET.has(action)) : null;
  return Object.freeze({
    version: CONFIG_VERSION,
    enabled: source.enabled === true,
    mode: Object.values(CONTROL_MODES).includes(source.mode) ? source.mode : DEFAULT_TOKEN_CONFIG.mode,
    profile: Object.values(PROFILES).includes(source.profile) ? source.profile : DEFAULT_TOKEN_CONFIG.profile,
    approvalPolicy: Object.values(APPROVAL_POLICIES).includes(source.approvalPolicy)
      ? source.approvalPolicy : DEFAULT_TOKEN_CONFIG.approvalPolicy,
    detectionPolicy: ["PATROL_DEFAULT", "STEALTH_WHEN_APPLICABLE"].includes(source.detectionPolicy)
      ? source.detectionPolicy : DEFAULT_TOKEN_CONFIG.detectionPolicy,
    faction: typeof source.faction === "string" ? source.faction : "",
    attitude: ["ALLY", "NEUTRAL", "UNKNOWN", "HOSTILE"].includes(source.attitude)
      ? source.attitude : DEFAULT_TOKEN_CONFIG.attitude,
    cooldownMs: Number.isFinite(source.cooldownMs) ? Math.max(0, Math.min(source.cooldownMs, 600000))
      : DEFAULT_TOKEN_CONFIG.cooldownMs,
    actions: Object.freeze(actions?.length ? actions : [...DEFAULT_TOKEN_CONFIG.actions])
  });
}

export function getTokenConfig(tokenDocument) {
  return normalizeTokenConfig(tokenDocument?.getFlag(MODULE_ID, CONFIG_FLAG));
}

/** Writes only this module's configuration flag and only from a GM client. */
export async function setTokenConfig(tokenDocument, patch) {
  if (!game.user?.isGM) throw new Error("Patrol Intelligence: only a GM can change token configuration.");
  if (!tokenDocument?.setFlag) throw new TypeError("Patrol Intelligence: a TokenDocument is required.");
  const next = normalizeTokenConfig({ ...getTokenConfig(tokenDocument), ...patch });
  await tokenDocument.setFlag(MODULE_ID, CONFIG_FLAG, next);
  return next;
}
