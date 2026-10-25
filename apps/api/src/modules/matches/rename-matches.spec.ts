import { describe, expect, it } from 'vitest'
import { MatchStatus } from './contracts/match.contract'
import { selectMatchesToRename, type RenameMatchCandidate } from './rename-matches'

const sourceStartsAt = new Date('2026-10-07T17:00:00.000Z')

function candidate(overrides: Partial<RenameMatchCandidate> = {}): RenameMatchCandidate {
  return {
    id: 'later-match',
    organizationId: 'club-1',
    seasonId: 'season-1',
    startsAt: new Date('2026-10-14T17:00:00.000Z'),
    status: MatchStatus.Scheduled,
    ...overrides,
  }
}

const source = candidate({
  id: 'source-match',
  startsAt: sourceStartsAt,
})

describe('selectMatchesToRename', () => {
  it('keeps only the chosen match when the scope is a single match', () => {
    const actual = selectMatchesToRename({
      scope: 'match',
      sourceId: source.id,
      sourceOrganizationId: source.organizationId,
      sourceSeasonId: source.seasonId,
      sourceStartsAt,
      candidates: [source, candidate()],
    })

    expect(actual.map((match) => match.id)).toEqual(['source-match'])
  })

  it('skips a cancelled match even when it is the one being edited', () => {
    const actual = selectMatchesToRename({
      scope: 'match',
      sourceId: source.id,
      sourceOrganizationId: source.organizationId,
      sourceSeasonId: source.seasonId,
      sourceStartsAt,
      candidates: [
        candidate({ id: source.id, startsAt: sourceStartsAt, status: MatchStatus.Cancelled }),
      ],
    })

    expect(actual).toEqual([])
  })

  it('renames the chosen match and later matches in the same season', () => {
    const playedLater = candidate({
      id: 'played-later',
      startsAt: new Date('2026-10-21T17:00:00.000Z'),
      status: MatchStatus.Played,
    })
    const actual = selectMatchesToRename({
      scope: 'following',
      sourceId: source.id,
      sourceOrganizationId: source.organizationId,
      sourceSeasonId: source.seasonId,
      sourceStartsAt,
      candidates: [
        candidate({ id: 'earlier', startsAt: new Date('2026-09-30T17:00:00.000Z') }),
        source,
        candidate(),
        playedLater,
      ],
    })

    expect(actual.map((match) => match.id)).toEqual(['source-match', 'later-match', 'played-later'])
  })

  it('leaves a match that starts at the same time unchanged', () => {
    const actual = selectMatchesToRename({
      scope: 'following',
      sourceId: source.id,
      sourceOrganizationId: source.organizationId,
      sourceSeasonId: source.seasonId,
      sourceStartsAt,
      candidates: [source, candidate({ id: 'same-time', startsAt: sourceStartsAt })],
    })

    expect(actual.map((match) => match.id)).toEqual(['source-match'])
  })

  it('leaves cancelled, other-season, and other-club matches unchanged', () => {
    const actual = selectMatchesToRename({
      scope: 'following',
      sourceId: source.id,
      sourceOrganizationId: source.organizationId,
      sourceSeasonId: source.seasonId,
      sourceStartsAt,
      candidates: [
        source,
        candidate({ id: 'cancelled', status: MatchStatus.Cancelled }),
        candidate({ id: 'other-season', seasonId: 'season-2' }),
        candidate({ id: 'other-club', organizationId: 'club-2' }),
      ],
    })

    expect(actual.map((match) => match.id)).toEqual(['source-match'])
  })
})
