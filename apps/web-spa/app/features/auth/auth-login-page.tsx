import type { AuthLoginFormData } from './components/forms/auth-login-form'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { authPath } from '@/features/auth/utils/auth-continue-path'
import { enterApp } from '@/features/auth/utils/enter-app'
import { storePendingInvitationId } from '@/features/auth/utils/pending-invitation'
import { authClient } from '@/lib/auth-client'
import { AuthInvitePill } from './components/auth-invite-pill'
import { AuthPageHeader } from './components/auth-page-header'
import { AuthLoginForm } from './components/forms/auth-login-form'

export default function Login() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const invitationId = searchParams.get('invitationId') ?? searchParams.get('invite')
  const clubName = searchParams.get('club')
  const isInvite = Boolean(invitationId || clubName)

  useEffect(() => {
    if (invitationId) storePendingInvitationId(invitationId)
  }, [invitationId])

  const {
    mutate: loginMutate,
    isPending: isLoginPending,
    error,
  } = useMutation({
    mutationFn: async (data: AuthLoginFormData) => {
      // No callbackURL. Better Auth would treat it as its own redirect, and
      // that redirect runs before we can replace the page ourselves.
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: true,
      })

      if (response.error) {
        throw new Error(response.error.code)
      }

      toast.success(t('auth.login.loggedInSuccess'))
      return response.data
    },
    onSuccess: () => {
      enterApp()
    },
  })

  const handleLogin = (data: AuthLoginFormData) => {
    loginMutate(data)
  }

  const registerTo = authPath('/register', searchParams)
  const description = isInvite
    ? clubName
      ? t('auth.login.inviteDescription', { club: clubName })
      : t('auth.login.inviteDescriptionFallback')
    : t('auth.login.description')

  return (
    <div>
      {isInvite ? <AuthInvitePill club={clubName} /> : null}
      <AuthPageHeader title={t('auth.login.title')} description={description} />
      <AuthLoginForm onSubmit={handleLogin} isPending={isLoginPending} />
      {error ? (
        <p className="mt-4 text-sm font-medium text-destructive">
          {error.message === 'BANNED_USER'
            ? t('auth.login.bannedUser')
            : t('auth.login.badCredentials')}
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted-foreground">
        {isInvite ? t('auth.login.noAccount') : t('auth.login.noClub')}{' '}
        <Link
          to={registerTo}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {isInvite ? t('auth.login.signUp') : t('auth.login.createClub')}
        </Link>
      </p>
    </div>
  )
}
