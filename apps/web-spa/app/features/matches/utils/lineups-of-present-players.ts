interface LineupPlayer {
  userId: string
}

interface AttendancePlayer {
  userId: string
  status: string
}

/**
 * Blue and red only show players who are still in the composition.
 * A saved team spot for someone who is absent or pending is not part of it.
 */
export function lineupsOfPresentPlayers<T extends LineupPlayer>(
  lineups: T[],
  attendances: AttendancePlayer[],
): T[] {
  const presentUserIds = new Set(
    attendances
      .filter((attendance) => attendance.status === 'present')
      .map((attendance) => attendance.userId),
  )
  return lineups.filter((lineup) => presentUserIds.has(lineup.userId))
}
