import { MODULE_ID, PATROL_HOOKS } from "../constants.mjs";
import { isDebugEnabled } from "../settings.mjs";
import { getRelevantStatistics } from "./dnd5e-adapter.mjs";

/**
 * Observe Patrol's documented hook contract without changing its result.
 * In particular, pre-hooks deliberately return undefined instead of false.
 */
export function registerPatrolObservers() {
  for (const hookName of PATROL_HOOKS) {
    Hooks.on(hookName, (spotter, spotted) => {
      if (!isDebugEnabled() || !game.user?.isGM) return undefined;

      console.debug(`${MODULE_ID} | observed ${hookName}`, {
        spotter: describeToken(spotter),
        spotted: describeToken(spotted),
        spotterStatistics: getRelevantStatistics(spotter)
      });
      return undefined;
    });
  }
}

function describeToken(token) {
  return {
    id: token?.id ?? null,
    uuid: token?.document?.uuid ?? null,
    actorType: token?.actor?.type ?? null
  };
}
