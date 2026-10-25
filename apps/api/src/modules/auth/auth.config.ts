import type { MikroORM } from '@mikro-orm/core'
import type { BetterAuthOptions, User } from 'better-auth'
import type { BetterAuthType } from './auth.client-types'
import { Logger } from '@nestjs/common'
import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { openAPI, organization } from 'better-auth/plugins'
import { addMemberToUpcomingMatches } from '../matches/add-member-to-upcoming-matches'
import { legacyAuthCookieClears } from './auth-cookie-domain'
import { mikroOrmAdapter } from './auth-db.adapter'

type BetterAuthHooks = NonNullable<BetterAuthOptions['hooks']>

interface BetterAuthOptionsDynamic {
  orm: MikroORM
  secret: string
  trustedOrigins: string[]
  sendResetPassword?: (
    data: { user: User; url: string; token: string },
    request: Request | undefined,
  ) => Promise<void>
  sendVerificationEmail?: (
    data: { user: User; url: string; token: string },
    request: Request | undefined,
  ) => Promise<void>
  sendInvitationEmail?: (data: {
    email: string
    invitation: { id: string }
    organization: { name: string; id: string }
    inviter: { user: { name: string; email: string } }
  }) => Promise<void>
  beforeHook?: BetterAuthHooks['before']
  afterHook?: BetterAuthHooks['after']
  databaseHooks?: BetterAuthOptions['databaseHooks']
  baseUrl: string
  cookieDomain?: string
}

export type BetterAuthSession = Awaited<
  ReturnType<ReturnType<typeof createBetterAuth>['api']['getSession']>
>
export type LoggedInBetterAuthSession = NonNullable<BetterAuthSession>

export type { BetterAuthType }

export type BetterAuthContext = ReturnType<typeof createBetterAuth>['$context']

export function createBetterAuth(options: BetterAuthOptionsDynamic): BetterAuthType {
  const logger = new Logger('OrganizationHooks')
  const enrollMember = async (organizationId: string, userId: string): Promise<void> => {
    try {
      await addMemberToUpcomingMatches(options.orm.em.fork(), { organizationId, userId })
    } catch (error) {
      logger.error(
        `Failed to add member ${userId} to upcoming matches of club ${organizationId}`,
        error instanceof Error ? error.stack : undefined,
      )
    }
  }

  const authOptions = {
    baseURL: options.baseUrl,
    secret: options.secret,
    trustedOrigins: options.trustedOrigins,
    emailAndPassword: {
      enabled: true,
      // A normal signup stays signed out until the confirmation link.
      // An invitation signup is signed in by the app after the account is created.
      autoSignIn: false,
      sendResetPassword: async (data, request) => {
        if (!options?.sendResetPassword) return
        return options?.sendResetPassword?.(data, request)
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60 * 24 * 10,
      sendVerificationEmail: async (data, request) => {
        if (!options?.sendVerificationEmail) return
        return options?.sendVerificationEmail?.(data, request)
      },
    },
    user: {
      additionalFields: {
        firstName: {
          type: 'string',
          required: false,
          input: true,
        },
        lastName: {
          type: 'string',
          required: false,
          input: true,
        },
        phone: {
          type: 'string',
          required: false,
          input: true,
        },
      },
    },
    database: mikroOrmAdapter(options.orm),
    databaseHooks: options.databaseHooks,
    advanced: {
      database: {
        generateId: false,
      },
      ...(options.cookieDomain
        ? {
            // New name so a leftover better-auth cookie is not the one we read.
            cookiePrefix: 'rosti',
            crossSubDomainCookies: {
              enabled: true,
              domain: options.cookieDomain,
            },
          }
        : {}),
    },
    rateLimit: {
      window: 50,
      max: 100,
    },
    hooks: {
      before: options?.beforeHook,
      after: createAuthMiddleware(async (ctx) => {
        if (options.afterHook) await options.afterHook(ctx)
        const parentDomain = options.cookieDomain
        const responseHeaders = ctx.context.responseHeaders
        if (!parentDomain || !responseHeaders) return
        const sessionCookieName = ctx.context.authCookies.sessionToken.name
        const setCookies = responseHeaders.getSetCookie?.() ?? []
        const setsSession = setCookies.some((entry) => entry.startsWith(`${sessionCookieName}=`))
        if (!setsSession) return
        for (const header of legacyAuthCookieClears(parentDomain)) {
          responseHeaders.append('set-cookie', header)
        }
      }),
    },
    plugins: [
      openAPI(),
      organization({
        allowUserToCreateOrganization: true,
        creatorRole: 'owner',
        membershipLimit: 500,
        invitationExpiresIn: 60 * 60 * 24 * 7,
        requireEmailVerificationOnInvitation: true,
        organizationHooks: {
          afterAddMember: async ({ user, organization: club }) => {
            await enrollMember(club.id, user.id)
          },
          afterAcceptInvitation: async ({ user, organization: club }) => {
            await enrollMember(club.id, user.id)
          },
        },
        async sendInvitationEmail(data) {
          if (options.sendInvitationEmail) {
            await options.sendInvitationEmail(data)
          }
        },
      }),
    ],
  } satisfies BetterAuthOptions

  return betterAuth({
    ...authOptions,
    plugins: [...(authOptions.plugins ?? [])],
  })
}
