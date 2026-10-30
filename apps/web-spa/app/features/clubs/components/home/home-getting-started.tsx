import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { EmptyMatchArt } from '@/features/matches/components/empty-match-art'

interface HomeGettingStartedProps {
  isClubAdmin: boolean
}

export function HomeGettingStarted({ isClubAdmin }: HomeGettingStartedProps) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GettingStartedCard
        art={<EmptyMatchArt name="whistle" className="w-full" page="home" />}
        title={t('home.gettingStarted.matchesTitle')}
        description={t('home.gettingStarted.matchesDescription')}
        action={
          isClubAdmin
            ? { to: '/matches/new', label: t('home.gettingStarted.matchesAction') }
            : undefined
        }
      />
      <GettingStartedCard
        art={<EmptyMatchArt name="bibs" className="w-full" page="home" />}
        title={t('home.gettingStarted.invitesTitle')}
        description={t('home.gettingStarted.invitesDescription')}
        action={
          isClubAdmin
            ? { to: '/club-settings?tab=invite', label: t('home.gettingStarted.invitesAction') }
            : undefined
        }
      />
    </div>
  )
}

function GettingStartedCard({
  art,
  title,
  description,
  action,
}: {
  art: ReactNode
  title: string
  description: string
  action?: { to: string; label: string }
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-dashed p-6 text-center">
        {art}
        <div className="space-y-2">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action ? <Button render={<Link to={action.to} />}>{action.label}</Button> : null}
      </div>
    </section>
  )
}
