import { describe, expect, it } from 'vitest'
import {
  findStaleInvitationIds,
  selectPendingInvitations,
  type ClubInvitation,
} from './player-invitations'

function invitation(
  overrides: Partial<ClubInvitation> & Pick<ClubInvitation, 'id' | 'email'>,
): ClubInvitation {
  return {
    role: 'member',
    status: 'pending',
    organizationId: 'club-1',
    expiresAt: '2026-11-11T12:00:00.000Z',
    createdAt: '2026-11-04T12:00:00.000Z',
    ...overrides,
  }
}

describe('selectPendingInvitations', () => {
  it('hides an invitation when that email is already a member', () => {
    const inputInvitations = [
      invitation({ id: 'invite-1', email: 'Player@Club.test' }),
      invitation({ id: 'invite-2', email: 'other@club.test' }),
    ]

    const actual = selectPendingInvitations({
      invitations: inputInvitations,
      memberEmails: ['player@club.test'],
    })

    expect(actual.map((item) => item.id)).toEqual(['invite-2'])
  })

  it('keeps the latest pending invitation for one email', () => {
    const inputInvitations = [
      invitation({
        id: 'invite-old',
        email: 'player@club.test',
        createdAt: '2026-10-01T12:00:00.000Z',
      }),
      invitation({
        id: 'invite-new',
        email: 'Player@Club.test',
        createdAt: '2026-11-04T12:00:00.000Z',
      }),
    ]

    const actual = selectPendingInvitations({
      invitations: inputInvitations,
      memberEmails: [],
    })

    expect(actual.map((item) => item.id)).toEqual(['invite-new'])
  })

  it('ignores invitations that are no longer pending', () => {
    const inputInvitations = [
      invitation({
        id: 'invite-canceled',
        email: 'player@club.test',
        status: 'canceled',
      }),
    ]

    const actual = selectPendingInvitations({
      invitations: inputInvitations,
      memberEmails: [],
    })

    expect(actual).toEqual([])
  })
})

describe('findStaleInvitationIds', () => {
  it('returns the other pending invitations for the same email', () => {
    const inputInvitations = [
      invitation({ id: 'invite-kept', email: 'player@club.test' }),
      invitation({ id: 'invite-old', email: 'Player@Club.test' }),
      invitation({ id: 'invite-other', email: 'other@club.test' }),
      invitation({
        id: 'invite-accepted',
        email: 'player@club.test',
        status: 'accepted',
      }),
    ]

    const actual = findStaleInvitationIds({
      invitations: inputInvitations,
      email: 'player@club.test',
      keptId: 'invite-kept',
    })

    expect(actual).toEqual(['invite-old'])
  })
})
