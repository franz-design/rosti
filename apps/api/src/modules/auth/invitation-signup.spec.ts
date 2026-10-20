import { decideInvitedSignup, invitationProvesEmail, readInvitationId } from './invitation-signup'

const invitationId = '6f1b5c2e-9a3d-4c7b-8e1f-2a4b6c8d0e11'
const now = new Date('2026-10-19T12:00:00.000Z')

function pendingInvitation(overrides?: Partial<{ email: string; status: string; expiresAt: Date }>) {
  return {
    email: 'player@club.test',
    status: 'pending',
    expiresAt: new Date('2026-10-26T12:00:00.000Z'),
    ...overrides,
  }
}

describe('readInvitationId', () => {
  it('keeps a uuid', () => {
    expect(readInvitationId(`  ${invitationId}  `)).toBe(invitationId)
  })

  it('rejects anything that is not an invitation id', () => {
    expect(readInvitationId('not-an-id')).toBeNull()
    expect(readInvitationId(invitationId.replaceAll('-', ''))).toBeNull()
    expect(readInvitationId(null)).toBeNull()
  })
})

describe('invitationProvesEmail', () => {
  it('accepts a pending invitation for the same address', () => {
    expect(
      invitationProvesEmail({
        invitation: pendingInvitation({ email: 'Player@Club.test' }),
        email: 'player@club.test',
        now,
      }),
    ).toBe(true)
  })

  it('rejects a missing, expired, accepted, or mismatched invitation', () => {
    expect(invitationProvesEmail({ invitation: null, email: 'player@club.test', now })).toBe(false)
    expect(
      invitationProvesEmail({
        invitation: pendingInvitation({ expiresAt: now }),
        email: 'player@club.test',
        now,
      }),
    ).toBe(false)
    expect(
      invitationProvesEmail({
        invitation: pendingInvitation({ status: 'accepted' }),
        email: 'player@club.test',
        now,
      }),
    ).toBe(false)
    expect(
      invitationProvesEmail({
        invitation: pendingInvitation(),
        email: 'other@club.test',
        now,
      }),
    ).toBe(false)
  })
})

describe('decideInvitedSignup', () => {
  it('keeps a normal signup unverified', () => {
    expect(
      decideInvitedSignup({
        email: 'player@club.test',
        invitationId: null,
        invitation: pendingInvitation(),
        emailAlreadyRegistered: false,
        now,
      }),
    ).toBe('standard')
  })

  it('verifies a new player who arrived from their invitation', () => {
    expect(
      decideInvitedSignup({
        email: 'player@club.test',
        invitationId,
        invitation: pendingInvitation(),
        emailAlreadyRegistered: false,
        now,
      }),
    ).toBe('verified')
  })

  it('asks an existing player to sign in', () => {
    expect(
      decideInvitedSignup({
        email: 'player@club.test',
        invitationId,
        invitation: pendingInvitation(),
        emailAlreadyRegistered: true,
        now,
      }),
    ).toBe('already-registered')
  })

  it('does not treat a mismatched invitation as proof', () => {
    expect(
      decideInvitedSignup({
        email: 'other@club.test',
        invitationId,
        invitation: pendingInvitation(),
        emailAlreadyRegistered: false,
        now,
      }),
    ).toBe('standard')
  })
})
