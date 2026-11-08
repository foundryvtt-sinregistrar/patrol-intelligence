/** In-memory deduplication. Callers own lifecycle and may discard it on scene change. */
export class CooldownTracker {
  #entries = new Map();

  isCoolingDown(key, now) {
    const expiresAt = this.#entries.get(key);
    return Number.isFinite(expiresAt) && expiresAt > now;
  }

  record(key, cooldownMs, now) {
    this.#entries.set(key, now + Math.max(0, cooldownMs));
  }

  clear() {
    this.#entries.clear();
  }
}

export function detectionKey({ sceneUuid, spotterUuid, spottedUuid, stage }) {
  return [sceneUuid, spotterUuid, spottedUuid, stage].join("|");
}
