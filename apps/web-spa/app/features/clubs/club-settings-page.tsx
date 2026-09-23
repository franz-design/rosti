import { AppLoader } from '@rosti/ui/components/app'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { Tabs, TabsContent } from '@rosti/ui/components/primitives/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { ClubPlayersSection } from './components/players/club-players-section'
import { ClubSettingsTabsList } from './components/settings/club-settings-tabs'
import { InviteMembersSection } from './components/settings/invite-members-section'
import { MatchInviteSettingsSection } from './components/settings/match-invite-settings-section'
import { PaymentLinkSection } from './components/settings/payment-link-section'
import { SeasonsSettingsSection } from './components/settings/seasons-settings-section'
import { useClub } from './hooks/club-context'
import { authClient } from '@/lib/auth-client'
import { rostiApi } from '@/lib/rosti-api'

export default function ClubSettingsPage() {
  const { t } = useTranslation()
  const { activeClub, refetchClubs, isClubAdmin, isMembershipLoading, isLoading } = useClub()
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const [link, setLink] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [settingsTab, setSettingsTab] = useState('players')

  const { data } = useQuery({
    queryKey: ['payment-link', activeClub?.id],
    queryFn: async () => {
      const res = await rostiApi.getPaymentLink(activeClub!.id)
      setLink(res.paymentLink ?? '')
      return res
    },
    enabled: !!activeClub && isClubAdmin,
  })

  const save = useMutation({
    mutationFn: () => rostiApi.setPaymentLink(activeClub!.id, link || null),
    onSuccess: () => {
      toast.success(t('clubSettings.paymentLink.saved'))
      refetchClubs()
      void queryClient.invalidateQueries({ queryKey: ['payment-link', activeClub?.id] })
    },
  })

  const invite = useMutation({
    mutationFn: async () => {
      if (!activeClub) throw new Error(t('clubSettings.noClub'))
      for (const email of emails) {
        const result = await authClient.organization.inviteMember({
          email,
          role: 'member',
          organizationId: activeClub.id,
        })
        if (result.error) throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      toast.success(t('clubSettings.invite.success'))
      setEmails([])
      void queryClient.invalidateQueries({ queryKey: ['club-players', activeClub?.id] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading || isMembershipLoading) return <AppLoader />
  if (!activeClub) return <div className="p-6">{t('clubSettings.noClub')}</div>
  if (!isClubAdmin) return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">{t('clubSettings.title')}</h1>
        <p className="text-muted-foreground">{activeClub.name}</p>
      </div>

      <Tabs value={settingsTab} onValueChange={(value) => setSettingsTab(value)} className="gap-4">
        <ClubSettingsTabsList />

        <TabsContent value="players" className="outline-none">
          <ClubPlayersSection organizationId={activeClub.id} currentUserId={session?.user?.id} />
        </TabsContent>

        <TabsContent value="invite" className="outline-none">
          <InviteMembersSection
            emails={emails}
            onEmailsChange={setEmails}
            onSubmit={() => invite.mutate()}
            isPending={invite.isPending}
          />
        </TabsContent>

        <TabsContent value="seasons" className="outline-none">
          <SeasonsSettingsSection />
        </TabsContent>

        <TabsContent value="notifications" className="outline-none">
          <MatchInviteSettingsSection />
        </TabsContent>

        <TabsContent value="payment" className="outline-none">
          <PaymentLinkSection
            value={link}
            placeholder={data?.paymentLink ?? undefined}
            onChange={setLink}
            onSave={() => save.mutate()}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
