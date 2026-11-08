import { MODULE_ID } from "./constants.mjs";

export function registerSettings() {
  game.settings.register(MODULE_ID, "debug", {
    name: "PATROL_INTELLIGENCE.Settings.Debug.Name",
    hint: "PATROL_INTELLIGENCE.Settings.Debug.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    restricted: true
  });
}

export function isDebugEnabled() {
  return game.settings.get(MODULE_ID, "debug");
}
