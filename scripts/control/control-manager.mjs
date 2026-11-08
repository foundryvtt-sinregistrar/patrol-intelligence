import { CONTROL_MODES } from "../engine/decision-engine.mjs";
import { getTokenConfig, setTokenConfig } from "./token-config.mjs";

/**
 * Cancels Patrol Intelligence work by generation. It intentionally does not
 * pause Patrol: Patrol 5.0.10 lacks a public per-token suspension API.
 */
export class ControlManager {
  #generations = new Map();

  getGeneration(tokenDocument) {
    return this.#generations.get(tokenDocument.uuid) ?? 0;
  }

  invalidate(tokenDocument) {
    const next = this.getGeneration(tokenDocument) + 1;
    this.#generations.set(tokenDocument.uuid, next);
    return next;
  }

  isCurrent(tokenDocument, generation) {
    return this.getGeneration(tokenDocument) === generation;
  }

  async setMode(tokenDocument, mode) {
    if (!Object.values(CONTROL_MODES).includes(mode)) throw new TypeError(`Invalid control mode: ${mode}`);
    const generation = this.invalidate(tokenDocument);
    const config = await setTokenConfig(tokenDocument, { mode });
    return Object.freeze({ config, generation });
  }

  getConfig(tokenDocument) {
    return getTokenConfig(tokenDocument);
  }
}
