import { MODULE_ID, PATROL_HOOKS } from "../constants.mjs";
import { isActiveGMExecutor } from "../control/authority-manager.mjs";
import { getTokenConfig } from "../control/token-config.mjs";
import { CooldownTracker, detectionKey } from "../engine/cooldown-tracker.mjs";
import { proposeDecision } from "../engine/decision-engine.mjs";
import { isDebugEnabled } from "../settings.mjs";
import { createDetectionContext } from "./detection-context.mjs";

const STAGES = Object.freeze({
  prePatrolSuspicious: "suspicious",
  patrolSuspicious: "suspicious",
  prePatrolAlerted: "alerted",
  patrolAlerted: "alerted",
  prePatrolSpotted: "spotted",
  patrolSpotted: "spotted"
});

/**
 * Observe Patrol's documented hook contract without changing its result.
 * In particular, pre-hooks deliberately return undefined instead of false.
 */
export function registerPatrolObservers({ controlManager }) {
  const cooldowns = new CooldownTracker();
  for (const hookName of PATROL_HOOKS) {
    Hooks.on(hookName, (spotter, spotted) => {
      observeDetection({ hookName, spotter, spotted, controlManager, cooldowns });
      return undefined;
    });
  }
}

function observeDetection({ hookName, spotter, spotted, controlManager, cooldowns }) {
  if (!isActiveGMExecutor()) return;

  const config = getTokenConfig(spotter?.document);
  const context = createDetectionContext({
    spotter,
    spotted,
    stage: STAGES[hookName],
    config,
    generation: controlManager.getGeneration(spotter.document),
    paused: game.paused,
    inCombat: game.combat?.started
  });
  const key = detectionKey(context);
  const now = Date.now();
  if (cooldowns.isCoolingDown(key, now)) return;

  const decision = proposeDecision(context);
  if (decision.kind === "NO_ACTION") {
    debug(hookName, context, decision);
    return;
  }

  cooldowns.record(key, context.cooldownMs, now);
  debug(hookName, context, decision);
  notifyGM(spotter, decision);
}

function notifyGM(spotter, decision) {
  const action = game.i18n.localize(`PATROL_INTELLIGENCE.Actions.${decision.action}`);
  const name = spotter?.name ?? spotter?.document?.name ?? "NPC";
  const approval = decision.requiresApproval
    ? ` ${game.i18n.localize("PATROL_INTELLIGENCE.Notifications.ApprovalRequired")}` : "";
  ui.notifications.info(game.i18n.format("PATROL_INTELLIGENCE.Notifications.Proposal", { name, action }) + approval);
}

function debug(hookName, context, decision) {
  if (!isDebugEnabled()) return;
  console.debug(`${MODULE_ID} | observed ${hookName}`, { context, decision });
}

function describeToken(token) {
  return {
    id: token?.id ?? null,
    uuid: token?.document?.uuid ?? null,
    actorType: token?.actor?.type ?? null
  };
}
