import type { BetterAuthOptions } from 'better-auth'
import type { MikroORM } from '@mikro-orm/core'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { Invitation, User } from './auth.entity'

const INVITATION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface InvitationProof {
  email: string
  status: string
  expiresAt: Date
}

export type InvitedSignupDecision = 'standard' | 'verified' | 'already-registered'

/**
 * The invitation email is the proof that this address belongs to the player.
 * A matching pending invitation can skip a second confirmation email.
 */
export function invitationProvesEmail(input: {
  invitation: InvitationProof | null
  email: string
  now?: Date
}): boolean {
  const invitation = input.invitation
  if (!invitation) return false
  if (invitation.status !== 'pending') return false
  const now = input.now ?? new Date()
  if (invitation.expiresAt.getTime() <= now.getTime()) return false
  return invitation.email.trim().toLowerCase() === input.email.trim().toLowerCase()
}

export function readInvitationId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const invitationId = value.trim()
  if (!INVITATION_ID.test(invitationId)) return null
  return invitationId
}

export function readSignUpEmail(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const email = (body as { email?: unknown }).email
  if (typeof email !== 'string') return ''
  return email.trim()
}

export function decideInvitedSignup(input: {
  email: string
  invitationId: string | null
  invitation: InvitationProof | null
  emailAlreadyRegistered: boolean
  now?: Date
}): InvitedSignupDecision {
  if (!input.invitationId) return 'standard'
  const proved = invitationProvesEmail({
    invitation: input.invitation,
    email: input.email,
    now: input.now,
  })
  if (!proved) return 'standard'
  if (input.emailAlreadyRegistered) return 'already-registered'
  return 'verified'
}

async function loadInvitation(
  orm: MikroORM,
  invitationId: string,
): Promise<InvitationProof | null> {
  const invitation = await orm.em.fork().findOne(Invitation, { id: invitationId })
  if (!invitation) return null
  return {
    email: invitation.email,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  }
}

async function emailAlreadyRegistered(orm: MikroORM, email: string): Promise<boolean> {
  const user = await orm.em.fork().findOne(User, { email: email.toLowerCase() })
  return user !== null
}

export function createInvitationSignupHooks(orm: MikroORM): {
  beforeHook: NonNullable<BetterAuthOptions['hooks']>['before']
  databaseHooks: NonNullable<BetterAuthOptions['databaseHooks']>
} {
  return {
    beforeHook: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return
      const invitationId = readInvitationId(
        (ctx.body as { invitationId?: unknown } | undefined)?.invitationId,
      )
      const email = readSignUpEmail(ctx.body)
      if (!invitationId || !email) return

      const invitation = await loadInvitation(orm, invitationId)
      if (!invitationProvesEmail({ invitation, email })) return

      const decision = await decideInvitedSignup({
        email,
        invitationId,
        invitation,
        emailAlreadyRegistered: await emailAlreadyRegistered(orm, email),
      })
      if (decision !== 'already-registered') return

      throw new APIError('UNPROCESSABLE_ENTITY', {
        message: 'User already exists.',
        code: 'USER_ALREADY_EXISTS',
      })
    }),
    databaseHooks: {
      user: {
        create: {
          before: async (user, context) => {
            const invitationId = readInvitationId(
              (context?.body as { invitationId?: unknown } | undefined)?.invitationId,
            )
            if (!invitationId || typeof user.email !== 'string') return

            const decision = await decideInvitedSignup({
              email: user.email,
              invitationId,
              invitation: await loadInvitation(orm, invitationId),
              emailAlreadyRegistered: false,
            })
            if (decision !== 'verified') return
            return { data: { emailVerified: true } }
          },
        },
      },
    },
  }
}
