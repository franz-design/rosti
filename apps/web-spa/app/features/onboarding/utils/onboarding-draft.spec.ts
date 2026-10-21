import { describe, expect, it } from 'vitest'
import {
  clampOnboardingStep,
  clearOnboardingDraft,
  createDefaultOnboardingDraft,
  isOnboardingStepReachable,
  parseOnboardingDraft,
  readOnboardingDraft,
  writeOnboardingDraft,
} from './onboarding-draft'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

describe('isOnboardingStepReachable', () => {
  it('keeps later steps closed until the earlier ones are filled', () => {
    const draft = {
      ...createDefaultOnboardingDraft(new Date(2026, 9, 21)),
      seasonStartsAt: '2026-09-01',
      seasonEndsAt: '2027-06-30',
      matchDate: '2026-10-26',
    }

    expect(isOnboardingStepReachable(draft, 1)).toBe(true)
    expect(isOnboardingStepReachable(draft, 2)).toBe(false)

    const named = { ...draft, clubName: 'Les copains', venue: 'Futclub' }
    expect(isOnboardingStepReachable(named, 2)).toBe(true)
    expect(isOnboardingStepReachable(named, 4)).toBe(true)

    const withoutMatch = { ...named, matchDate: null }
    expect(isOnboardingStepReachable(withoutMatch, 3)).toBe(true)
    expect(isOnboardingStepReachable(withoutMatch, 4)).toBe(false)
  })

  it('rejects a club name that cannot become a slug', () => {
    const draft = {
      ...createDefaultOnboardingDraft(new Date(2026, 9, 21)),
      clubName: '!!!',
      venue: 'Futclub',
    }

    expect(isOnboardingStepReachable(draft, 2)).toBe(false)
  })
})

describe('parseOnboardingDraft', () => {
  it('restores a saved form and drops a confirmation that no longer matches the name', () => {
    const parsed = parseOnboardingDraft({
      step: 3,
      clubName: 'Les copains',
      venue: 'Futclub',
      sportType: 'padel',
      maxPlayers: 8,
      confirmedSlug: 'autre-club',
      createdClubId: 'club-1',
      emails: ['ami@email.com', 12],
    })

    expect(parsed?.step).toBe(3)
    expect(parsed?.sportType).toBe('padel')
    expect(parsed?.maxPlayers).toBe(8)
    expect(parsed?.confirmedSlug).toBeNull()
    expect(parsed?.createdClubId).toBe('club-1')
    expect(parsed?.emails).toEqual(['ami@email.com'])
  })

  it('falls back to step 1 when a later step is no longer valid', () => {
    const parsed = parseOnboardingDraft({
      step: 4,
      clubName: 'Les copains',
      venue: '',
    })

    expect(parsed?.step).toBe(1)
  })

  it('returns null for garbage', () => {
    expect(parseOnboardingDraft(null)).toBeNull()
    expect(parseOnboardingDraft('draft')).toBeNull()
  })
})

describe('onboarding draft storage', () => {
  it('round-trips until cleared', () => {
    const storage = memoryStorage()
    const draft = {
      ...createDefaultOnboardingDraft(new Date(2026, 9, 21)),
      clubName: 'Les copains',
      venue: 'Futclub',
      step: 2,
    }

    writeOnboardingDraft(draft, storage)
    expect(readOnboardingDraft(storage)?.clubName).toBe('Les copains')
    expect(clampOnboardingStep(draft, 2)).toBe(2)

    clearOnboardingDraft(storage)
    expect(readOnboardingDraft(storage)).toBeNull()
  })
})
