import { describe, expect, it } from 'vitest'
import { filterPlayersByName } from './filter-players'

const inputPlayers = [
  { id: '1', name: 'Jean Dupont' },
  { id: '2', name: 'Éloïse Martin' },
  { id: '3', name: 'Marie Curie' },
]

describe('filterPlayersByName', () => {
  it('keeps every player when the query is blank', () => {
    expect(filterPlayersByName(inputPlayers, '   ')).toEqual(inputPlayers)
  })

  it('matches a first name', () => {
    expect(filterPlayersByName(inputPlayers, 'jean').map((player) => player.id)).toEqual(['1'])
  })

  it('matches a last name', () => {
    expect(filterPlayersByName(inputPlayers, 'martin').map((player) => player.id)).toEqual(['2'])
  })

  it('ignores case and accents', () => {
    expect(filterPlayersByName(inputPlayers, 'eloise').map((player) => player.id)).toEqual(['2'])
  })

  it('requires every word of the query', () => {
    expect(filterPlayersByName(inputPlayers, 'marie curie').map((player) => player.id)).toEqual(['3'])
    expect(filterPlayersByName(inputPlayers, 'jean martin')).toEqual([])
  })
})
