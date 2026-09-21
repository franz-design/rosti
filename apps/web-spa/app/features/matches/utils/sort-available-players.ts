interface AssignablePlayer {
  userId: string
}

/**
 * Puts players who are not on a team yet before players already assigned.
 * Order inside each group stays the same.
 */
export function sortUnassignedPlayersFirst<T extends AssignablePlayer>(
  players: readonly T[],
  draft: Readonly<Record<string, string>>,
): T[] {
  return players.toSorted((left, right) => {
    const leftIsAssigned = left.userId in draft
    const rightIsAssigned = right.userId in draft
    if (leftIsAssigned === rightIsAssigned) return 0
    return leftIsAssigned ? 1 : -1
  })
}
