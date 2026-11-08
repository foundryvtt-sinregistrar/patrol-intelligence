export const BEHAVIOR_STATES = Object.freeze({
  PATROLLING: "PATROLLING",
  SUSPICIOUS: "SUSPICIOUS",
  INVESTIGATING: "INVESTIGATING",
  ALERTED: "ALERTED",
  INTERACTING: "INTERACTING",
  PURSUING: "PURSUING",
  FLEEING: "FLEEING",
  COMBAT: "COMBAT"
});

const TRANSITIONS = Object.freeze({
  PATROLLING: new Set(["SUSPICIOUS", "COMBAT"]),
  SUSPICIOUS: new Set(["PATROLLING", "INVESTIGATING", "ALERTED", "COMBAT"]),
  INVESTIGATING: new Set(["PATROLLING", "ALERTED", "COMBAT"]),
  ALERTED: new Set(["PATROLLING", "INTERACTING", "PURSUING", "FLEEING", "COMBAT"]),
  INTERACTING: new Set(["PATROLLING", "ALERTED", "PURSUING", "COMBAT"]),
  PURSUING: new Set(["PATROLLING", "INVESTIGATING", "INTERACTING", "COMBAT"]),
  FLEEING: new Set(["PATROLLING", "COMBAT"]),
  COMBAT: new Set(["PATROLLING"])
});

export function isBehaviorState(value) {
  return Object.hasOwn(BEHAVIOR_STATES, value);
}

export function canTransition(from, to) {
  return isBehaviorState(from) && isBehaviorState(to) && (from === to || TRANSITIONS[from].has(to));
}

/** Returns an immutable transition record; it never persists or updates a document. */
export function transition({ from, to, reason, generation }) {
  if (!canTransition(from, to)) {
    throw new Error(`Patrol Intelligence: invalid state transition ${from} -> ${to}`);
  }
  return Object.freeze({ from, to, reason, generation });
}
