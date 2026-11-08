import { MODULE_ID } from "./constants.mjs";
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

  registerPatrolObservers();
  console.info(`${MODULE_ID} | passive Patrol observers registered.`);
});
