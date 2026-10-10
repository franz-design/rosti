import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { getPlayerFirstName } from '@/features/matches/utils/lineup-positions'
import type { SeasonHomeStats } from '@/lib/rosti-api'
import {
  selectHomeAwardSlots,
  type HomeAwardSlot,
  type SeasonRecordVariant,
} from '../../utils/home-award-slots'
import { AwardCard } from './award-card'
import { VotePlaceholderCard } from './vote-placeholder-card'

interface ClubStatsGridProps {
  stats: SeasonHomeStats
}

export function ClubStatsGrid({ stats }: ClubStatsGridProps) {
  const { t } = useTranslation()
  const slots = selectHomeAwardSlots(stats.club)

  const recordCopy: Record<
    SeasonRecordVariant,
    { title: string; statLabel: string; emptyLabel: string }
  > = {
    scorer: {
      title: t('home.stats.card.title'),
      statLabel: t('home.stats.goals'),
      emptyLabel: t('home.stats.card.emptyScorer'),
    },
    wins: {
      title: t('home.stats.card.winsTitle'),
      statLabel: t('home.stats.wins'),
      emptyLabel: t('home.stats.card.emptyWins'),
    },
    losses: {
      title: t('home.stats.card.lossesTitle'),
      statLabel: t('home.stats.losses'),
      emptyLabel: t('home.stats.card.emptyLosses'),
    },
  }

  return (
    <div className="min-w-0 space-y-4">
      {slots.length > 0 ? (
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
          {slots.map((slot) => (
            <div key={slotKey(slot)} className="w-full min-w-0 max-w-72 sm:w-72 sm:shrink">
              <AwardSlot slot={slot} recordCopy={recordCopy} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function AwardSlot({
  slot,
  recordCopy,
}: {
  slot: HomeAwardSlot
  recordCopy: Record<SeasonRecordVariant, { title: string; statLabel: string; emptyLabel: string }>
}) {
  const { t } = useTranslation()

  if (slot.kind === 'vote') return <VotePlaceholderCard matchId={slot.matchId} />

  if (slot.kind === 'duo') {
    return (
      <AwardCard
        variant="duo"
        title={t('home.stats.card.duoTitle')}
        statLabel={t('home.stats.card.duoStat')}
        player={{
          userId: slot.playerA.userId,
          userName: slot.playerA.userName,
          image: slot.playerA.image,
          value: slot.matchesTogether,
        }}
        companion={{ userName: slot.playerB.userName, image: slot.playerB.image }}
        nameLabel={t('home.stats.duoNames', {
          playerA: getPlayerFirstName(slot.playerA.userName),
          playerB: getPlayerFirstName(slot.playerB.userName),
        })}
        emptyLabel={t('home.stats.duo')}
      />
    )
  }

  if (slot.kind === 'elected') {
    return (
      <PlayerCardLink userId={slot.player.userId}>
        <AwardCard
          variant="elected"
          title={t('home.stats.card.electedTitle')}
          player={slot.player}
          emptyLabel={t('home.stats.card.emptyElected')}
          showStat={false}
        />
      </PlayerCardLink>
    )
  }

  const copy = recordCopy[slot.variant]
  return (
    <PlayerCardLink userId={slot.player.userId}>
      <AwardCard
        variant={slot.variant}
        title={copy.title}
        statLabel={copy.statLabel}
        player={slot.player}
        emptyLabel={copy.emptyLabel}
      />
    </PlayerCardLink>
  )
}

function PlayerCardLink({ userId, children }: { userId: string; children: ReactNode }) {
  const location = useLocation()

  return (
    <Link
      to={`/players/${userId}`}
      state={{ from: `${location.pathname}${location.search}` }}
      className="block w-full rounded-[1.75rem] outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  )
}

function slotKey(slot: HomeAwardSlot): string {
  if (slot.kind === 'vote') return `vote-${slot.matchId}`
  if (slot.kind === 'elected') return `elected-${slot.player.userId}`
  if (slot.kind === 'duo') return `duo-${slot.playerA.userId}-${slot.playerB.userId}`
  return `record-${slot.variant}`
}
