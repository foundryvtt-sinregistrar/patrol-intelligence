/**
 * In-memory approval queue. An entry never executes an action; consumers must
 * separately validate it and decide how an approved proposal is handled.
 */
export class ProposalQueue {
  #entries = new Map();
  #nextId = 1;

  enqueue({ decision, context }) {
    if (decision?.kind !== "DECISION" || !decision.requiresApproval) return null;
    const id = `proposal-${this.#nextId++}`;
    const entry = Object.freeze({
      id,
      status: "PENDING",
      createdAt: Date.now(),
      decision,
      spotterUuid: context.spotterUuid,
      generation: context.generation
    });
    this.#entries.set(id, entry);
    return entry;
  }

  list({ status } = {}) {
    return [...this.#entries.values()].filter(entry => !status || entry.status === status);
  }

  resolve(id, outcome, { isCurrentGeneration }) {
    if (!["APPROVED", "REJECTED"].includes(outcome)) throw new TypeError(`Invalid proposal outcome: ${outcome}`);
    const entry = this.#entries.get(id);
    if (!entry || entry.status !== "PENDING") return null;

    if (!isCurrentGeneration(entry.spotterUuid, entry.generation)) {
      return this.#replace(entry, "STALE");
    }
    return this.#replace(entry, outcome);
  }

  clear() {
    this.#entries.clear();
  }

  #replace(entry, status) {
    const next = Object.freeze({ ...entry, status, resolvedAt: Date.now() });
    this.#entries.set(entry.id, next);
    return next;
  }
}
