interface NamedPlayer {
  name: string
}

function foldName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
}

/**
 * Keep players whose first or last name matches every word of the query.
 * Matching ignores case and accents. A blank query keeps the full list.
 */
export function filterPlayersByName<T extends NamedPlayer>(players: T[], query: string): T[] {
  const terms = foldName(query).trim().split(/\s+/).filter((term) => term.length > 0)
  if (terms.length === 0) return players

  return players.filter((player) => {
    const name = foldName(player.name)
    return terms.every((term) => name.includes(term))
  })
}
