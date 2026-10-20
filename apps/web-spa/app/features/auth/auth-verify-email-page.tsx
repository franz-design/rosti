import { useMutation } from '@tanstack/react-query'
import { Loader2 } from '@rosti/ui/icons'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { enterApp } from '@/features/auth/utils/enter-app'
import { authClient } from '@/lib/auth-client'
import { AuthPageHeader } from './components/auth-page-header'

export default function AuthVerifyEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const {
    mutate: verifyEmailMutation,
    isError,
    status,
  } = useMutation({
    mutationFn: async (verificationToken: string) => {
      const response = await authClient.verifyEmail({
        query: {
          token: verificationToken,
        },
      })

      if (response.error) {
        throw new Error(response.error.message || t('auth.verifyEmail.failed'))
      }

      return response.data
    },
    onSuccess: () => {
      enterApp()
    },
  })

  useEffect(() => {
    if (token) {
      verifyEmailMutation(token)
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const isVerifying = status === 'idle' || status === 'pending'

  if (!token || isError) {
    return (
      <div>
        <AuthPageHeader
          title={t('auth.verifyEmail.title')}
          description={t('auth.verifyEmail.failed')}
        />
        <div className="text-sm text-center mt-4">
          <Link to="/login" className="font-medium transition-colors">
            {t('auth.verifyEmail.backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AuthPageHeader
        title={isVerifying ? t('auth.verifyEmail.verifying') : t('auth.verifyEmail.verified')}
        description={
          isVerifying ? t('auth.verifyEmail.pleaseWait') : t('auth.verifyEmail.redirecting')
        }
      />
      <div className="flex h-full">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    </div>
  )
}
