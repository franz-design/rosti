import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Attendance } from '@/lib/rosti-api'
import { QuantityStepper } from '../quantity-stepper'
import type { PlayerStatDraft } from '../player-stat-draft'

const STATS_SAVE_DELAY_MS = 750

interface PlayerStatsListProps {
  players: Attendance[]
  drafts: Record<string, PlayerStatDraft>
  canEdit: boolean
  onChange: (userId: string, draft: PlayerStatDraft) => void
  onSave: (drafts: Record<string, PlayerStatDraft>) => void
}

export function PlayerStatsList({
  players,
  drafts,
  canEdit,
  onChange,
  onSave,
}: PlayerStatsListProps) {
  const { t } = useTranslation()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function handleChange(userId: string, draft: PlayerStatDraft) {
    const next = { ...drafts, [userId]: draft }
    onChange(userId, draft)
    if (!canEdit) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null
      onSaveRef.current(next)
    }, STATS_SAVE_DELAY_MS)
  }

  if (players.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('matches.detail.stats.noPlayers')}</p>
  }

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
        <span>{t('matches.detail.stats.player')}</span>
        <span className="w-[6.75rem] text-center">{t('matches.detail.stats.goals')}</span>
        <span className="w-[6.75rem] text-center">{t('matches.detail.stats.assists')}</span>
      </div>
      <ul className="space-y-2">
        {players.map((player) => {
          const draft = drafts[player.userId] ?? { goals: 0, assists: 0 }
          return (
            <li
              key={player.userId}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2"
            >
              <span className="truncate text-sm">{player.userName}</span>
              {canEdit ? (
                <>
                  <QuantityStepper
                    size="sm"
                    tone="neutral"
                    value={draft.goals}
                    decreaseLabel={t('matches.detail.stats.decreaseGoals', { player: player.userName })}
                    increaseLabel={t('matches.detail.stats.increaseGoals', { player: player.userName })}
                    onChange={(goals) => handleChange(player.userId, { ...draft, goals })}
                  />
                  <QuantityStepper
                    size="sm"
                    tone="neutral"
                    value={draft.assists}
                    decreaseLabel={t('matches.detail.stats.decreaseAssists', {
                      player: player.userName,
                    })}
                    increaseLabel={t('matches.detail.stats.increaseAssists', {
                      player: player.userName,
                    })}
                    onChange={(assists) => handleChange(player.userId, { ...draft, assists })}
                  />
                </>
              ) : (
                <>
                  <span className="w-[6.75rem] text-center text-sm tabular-nums">{draft.goals}</span>
                  <span className="w-[6.75rem] text-center text-sm tabular-nums">{draft.assists}</span>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
