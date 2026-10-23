import { describe, expect, it } from 'vitest'
import { decideClubDestination, resolveActiveClubId } from './decide-club-destination'

const clubA = 'club-a'
const clubB = 'club-b'

describe('decideClubDestination', () => {
  it('opens a club that was just joined, even when the player belongs to another', () => {
    expect(
      decideClubDestination({
        clubIds: [clubA, clubB],
        acceptedOrganizationId: clubB,
        justSignedIn: true,
        storedClubId: clubA,
      }),
    ).toBe('/dashboard')
  })

  it('ignores an accepted club id that is not in the list', () => {
    expect(
      decideClubDestination({
        clubIds: [clubA, clubB],
        acceptedOrganizationId: 'missing',
        justSignedIn: false,
        storedClubId: null,
      }),
    ).toBe('/choose-club')
  })

  it('sends a player with no club to onboarding', () => {
    expect(
      decideClubDestination({
        clubIds: [],
        acceptedOrganizationId: null,
        justSignedIn: true,
        storedClubId: null,
      }),
    ).toBe('/onboarding')
  })

  it('opens the only club without asking', () => {
    expect(
      decideClubDestination({
        clubIds: [clubA],
        acceptedOrganizationId: null,
        justSignedIn: true,
        storedClubId: null,
      }),
    ).toBe('/dashboard')
  })

  it('asks for a choice after sign-in when several clubs are remembered', () => {
    expect(
      decideClubDestination({
        clubIds: [clubA, clubB],
        acceptedOrganizationId: null,
        justSignedIn: true,
        storedClubId: clubA,
      }),
    ).toBe('/choose-club')
  })

  it('reopens the remembered club when the app is opened again', () => {
    expect(
      decideClubDestination({
        clubIds: [clubA, clubB],
        acceptedOrganizationId: null,
        justSignedIn: false,
        storedClubId: clubB,
      }),
    ).toBe('/dashboard')
  })

  it('asks for a choice when the remembered club is no longer a membership', () => {
    expect(
      decideClubDestination({
        clubIds: [clubA, clubB],
        acceptedOrganizationId: null,
        justSignedIn: false,
        storedClubId: 'left-club',
      }),
    ).toBe('/choose-club')
  })
})

describe('resolveActiveClubId', () => {
  it('prefers the club that was just joined', () => {
    expect(
      resolveActiveClubId({
        clubIds: [clubA, clubB],
        acceptedOrganizationId: clubB,
        storedClubId: clubA,
      }),
    ).toBe(clubB)
  })

  it('uses the only club', () => {
    expect(
      resolveActiveClubId({
        clubIds: [clubA],
        acceptedOrganizationId: null,
        storedClubId: null,
      }),
    ).toBe(clubA)
  })

  it('returns null when several clubs remain and none is remembered', () => {
    expect(
      resolveActiveClubId({
        clubIds: [clubA, clubB],
        acceptedOrganizationId: null,
        storedClubId: null,
      }),
    ).toBeNull()
  })
})
