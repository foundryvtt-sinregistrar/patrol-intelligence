/**
 * Read-only access to prepared D&D5e 6.0.6 actor data.
 * This adapter never rolls, updates, or exposes actor data to other clients.
 */
export function getRelevantStatistics(token) {
  const system = token?.actor?.system;
  if (!system) return null;

  return Object.freeze({
    intelligence: numberOrNull(system.abilities?.int?.value),
    intelligenceModifier: numberOrNull(system.abilities?.int?.mod),
    passivePerception: numberOrNull(system.skills?.prc?.passive),
    perception: numberOrNull(system.skills?.prc?.total),
    insight: numberOrNull(system.skills?.ins?.total),
    investigation: numberOrNull(system.skills?.inv?.total),
    stealth: numberOrNull(system.skills?.ste?.total)
  });
}

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}
