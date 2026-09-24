/** Home season stats stay hidden until the club has played more than this many matches. */
export const MIN_MATCHES_FOR_HOME_STATS = 2

export function shouldShowHomeStats(matchesPlayed: number): boolean {
  return matchesPlayed > MIN_MATCHES_FOR_HOME_STATS
}
