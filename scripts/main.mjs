import { MODULE_ID } from "./constants.mjs";
import { ControlManager } from "./control/control-manager.mjs";
import { isActiveGMExecutor } from "./control/authority-manager.mjs";
import { ProposalQueue } from "./engine/proposal-queue.mjs";
import { getTokenConfig, setTokenConfig } from "./control/token-config.mjs";
import { registerPatrolObservers } from "./integrations/patrol-adapter.mjs";
import { registerSettings } from "./settings.mjs";

Hooks.once("init", () => {
  registerSettings();
});

Hooks.once("ready", () => {
  const patrol = game.modules.get("patrol");
  const systemId = game.system.id;

  if (!patrol?.active) {
    console.warn(`${MODULE_ID} | Patrol is not active; no observers were registered.`);
    return;
  }
  if (systemId !== "dnd5e") {
    console.warn(`${MODULE_ID} | D&D5e is required; found ${systemId}.`);
    return;
  }

  const control = new ControlManager();
  const proposals = new ProposalQueue();
  game.modules.get(MODULE_ID).api = Object.freeze({
    control,
    getTokenConfig,
    setTokenConfig,
    proposals: Object.freeze({
      list: options => proposals.list(options),
      approve: id => resolveProposal(proposals, control, id, "APPROVED"),
      reject: id => resolveProposal(proposals, control, id, "REJECTED")
    })
  });
  registerPatrolObservers({ controlManager: control, proposalQueue: proposals });
  console.info(`${MODULE_ID} | passive Patrol observers registered.`);
});

function resolveProposal(proposals, control, id, outcome) {
  if (!game.user?.isGM) throw new Error(`${MODULE_ID} | only a GM can resolve a proposal.`);
  if (!isActiveGMExecutor()) throw new Error(`${MODULE_ID} | only the active GM can resolve a proposal.`);
  return proposals.resolve(id, outcome, { isCurrentGeneration: control.isCurrentUuid.bind(control) });
}
