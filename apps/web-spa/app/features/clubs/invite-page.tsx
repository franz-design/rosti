import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router'
import { storePendingInvitationId } from '@/features/auth/utils/pending-invitation'
import { InviteStoreLinks } from './components/invite/invite-store-links'

export default function InvitePage() {
  const { t } = useTranslation()
  const { invitationId } = useParams()
  const [params] = useSearchParams()
  const email = params.get('email')
  const club = params.get('club')

  useEffect(() => {
    if (invitationId) storePendingInvitationId(invitationId)
  }, [invitationId])

  useEffect(() => {
    const ua = navigator.userAgent || ''
    const isMobile = /iPhone|iPad|Android/i.test(ua)
    if (!isMobile && invitationId) {
      const q = new URLSearchParams()
      if (email) q.set('email', email)
      if (club) q.set('club', club)
      q.set('invitationId', invitationId)
      window.location.href = `/register?${q.toString()}`
    }
  }, [invitationId, email, club])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-black">
          {t('invite.title', { club: club || t('invite.fallbackClub') })}
        </h1>
        <p className="text-muted-foreground">
          {email ? t('invite.descriptionWithEmail', { email }) : t('invite.description')}
        </p>
        <InviteStoreLinks invitationId={invitationId} email={email} club={club} />
      </div>
    </div>
  )
}
