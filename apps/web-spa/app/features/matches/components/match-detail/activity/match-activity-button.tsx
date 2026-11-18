import { Button } from '@rosti/ui/components/primitives/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@rosti/ui/components/primitives/sheet'
import { HistoryIcon } from '@solar-icons/react/linear/history'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { PlayerAvatar } from '@/common/components/player-avatar'
import { useClub } from '@/features/clubs/hooks/club-context'
import type { MatchActivity, MatchActivityArea } from '@/lib/rosti-api'
import { describeMatchActivity } from '@/features/matches/utils/describe-match-activity'
import { matchActivityQueryOptions } from '@/features/matches/utils/match-activity-queries'

interface MatchActivityButtonProps {
  area: MatchActivityArea
}

/**
 * Small history icon that opens the log of changes people made in one area of the match.
 * Renders nothing for players who are not club admins.
 */
export function MatchActivityButton({ area }: MatchActivityButtonProps) {
  const { t } = useTranslation()
  const { activeClub, isClubAdmin } = useClub()
  const { matchId } = useParams()
  const [isOpen, setIsOpen] = useState(false)

  if (!isClubAdmin || !activeClub || !matchId) return null

  const label = t(`matches.detail.activity.open.${area}`)

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label={label}
        title={label}
        onClick={() => setIsOpen(true)}
      >
        <HistoryIcon aria-hidden />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="gap-0 overflow-y-auto">
          <SheetHeader className="pr-10">
            <SheetTitle>{t(`matches.detail.activity.title.${area}`)}</SheetTitle>
            <SheetDescription>{t('matches.detail.activity.description')}</SheetDescription>
          </SheetHeader>
          {isOpen ? (
            <MatchActivityList orgId={activeClub.id} matchId={matchId} area={area} />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}

function MatchActivityList({
  orgId,
  matchId,
  area,
}: {
  orgId: string
  matchId: string
  area: MatchActivityArea
}) {
  const { t } = useTranslation()
  const { data: activities = [], isLoading } = useQuery(
    matchActivityQueryOptions({ orgId, matchId, area }),
  )

  if (isLoading) {
    return (
      <p className="px-4 text-sm text-muted-foreground">{t('matches.detail.activity.loading')}</p>
    )
  }
  if (activities.length === 0) {
    return (
      <p className="px-4 text-sm text-muted-foreground">{t('matches.detail.activity.empty')}</p>
    )
  }

  return (
    <ul className="divide-y px-4 pb-4">
      {activities.map((activity) => (
        <MatchActivityRow key={activity.id} activity={activity} />
      ))}
    </ul>
  )
}

function MatchActivityRow({ activity }: { activity: MatchActivity }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'
  const person = activity.subject ?? activity.actor
  const date = new Date(activity.createdAt).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <li className="flex items-start gap-3 py-3">
      {person ? <PlayerAvatar name={person.name} imageUrl={person.image} size="sm" /> : null}
      <div className="min-w-0 space-y-0.5">
        {activity.subject ? <p className="truncate font-medium">{activity.subject.name}</p> : null}
        <p>{describeMatchActivity({ activity, t, locale })}</p>
        <p className="text-xs text-muted-foreground">
          {describeAuthor(activity, t)} · {date}
        </p>
      </div>
    </li>
  )
}

function describeAuthor(
  activity: MatchActivity,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (!activity.actor) return t('matches.detail.activity.byFormerMember')
  if (activity.subject && activity.actor.id === activity.subject.id) {
    return t('matches.detail.activity.bySelf')
  }
  return t('matches.detail.activity.by', { name: activity.actor.name })
}
