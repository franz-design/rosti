import type { AuthRegisterFormData } from './components/forms/auth-register-form'
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
import { AuthRegisterForm } from './components/forms/auth-register-form'

function registerErrorMessage(code: string, translate: (key: string) => string): string {
  if (code === 'USER_ALREADY_EXISTS') return translate('auth.register.alreadyExists')
  if (code === 'SIGN_IN_FAILED') return translate('auth.register.signInFailed')
  return translate('auth.register.failedToRegister')
}

export default function Register() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const inviteEmail = searchParams.get('email') ?? undefined
  const invitationId = searchParams.get('invitationId') ?? searchParams.get('invite')
  const clubName = searchParams.get('club')
  const isInvite = Boolean(invitationId || clubName)

  useEffect(() => {
    if (invitationId) storePendingInvitationId(invitationId)
  }, [invitationId])

  const {
    mutate: register,
    isPending,
    isSuccess,
    data: registeredUser,
    error: errorRegister,
  } = useMutation({
    mutationFn: async (data: AuthRegisterFormData) => {
      const name = `${data.firstName} ${data.lastName}`.trim()
      const response = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name,
        // @ts-expect-error additional fields inferred at runtime
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        invitationId,
        callbackURL: '/',
      })

      if (response.error) {
        throw new Error(response.error.code)
      }

      const user = response.data?.user
      if (!user) {
        throw new Error('FAILED_TO_CREATE_USER')
      }

      if (user.emailVerified && invitationId) {
        const signIn = await authClient.signIn.email({
          email: data.email,
          password: data.password,
          rememberMe: true,
        })
        if (signIn.error) {
          throw new Error('SIGN_IN_FAILED')
        }
        enterApp()
      }

      return user
    },
    onSuccess: (user) => {
      if (user.emailVerified) return
      const nextParams: Record<string, string> = { email: user.email }
      if (invitationId) nextParams.invitationId = invitationId
      if (clubName) nextParams.club = clubName
      setSearchParams(nextParams)
      toast.success(t('auth.register.registrationSuccessful'))
    },
  })

  const description = isInvite
    ? t('auth.register.joinClub')
    : t('auth.register.createClubDescription')
  const title = isInvite
    ? clubName
      ? t('auth.register.joinTitle', { club: clubName })
      : t('auth.register.joinTitleFallback')
    : t('auth.register.createClubTitle')
  const submitLabel =
    isInvite && clubName ? t('auth.register.joinSubmit', { club: clubName }) : undefined

  const loginTo = authPath('/login', searchParams)

  if (isSuccess && registeredUser?.emailVerified) {
    return (
      <div>
        <AuthPageHeader
          title={t('auth.register.signingInTitle')}
          description={t('auth.register.signingInDescription')}
        />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div>
        <AuthPageHeader
          title={t('auth.register.success.title')}
          description={t('auth.register.success.description')}
        />
        <p className="mt-6 text-sm text-muted-foreground">
          <Link
            to={loginTo}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('auth.register.backToLogin')}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      {isInvite ? <AuthInvitePill club={clubName} /> : null}
      <AuthPageHeader title={title} description={description} />
      <AuthRegisterForm
        onSubmit={(data) => register(data)}
        isPending={isPending}
        defaultEmail={inviteEmail}
        emailReadOnly={Boolean(inviteEmail)}
        submitLabel={submitLabel}
      />
      {errorRegister ? (
        <p className="mt-4 text-sm font-medium text-destructive">
          {registerErrorMessage(errorRegister.message, t)}
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted-foreground">
        {t('auth.register.hasAccount')}{' '}
        <Link
          to={loginTo}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t('auth.register.login')}
        </Link>
      </p>
    </div>
  )
}
