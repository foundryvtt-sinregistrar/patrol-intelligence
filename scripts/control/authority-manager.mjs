/**
 * Patrol hooks can run in more than one browser. Only Foundry's active GM is
 * allowed to present a proposal. If Foundry cannot identify one, do nothing.
 */
export function isActiveGMExecutor() {
  const executor = game.users?.activeGM;
  return Boolean(executor?.active && game.user?.id === executor.id);
}
