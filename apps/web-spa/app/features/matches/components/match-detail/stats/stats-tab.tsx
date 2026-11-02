import type { Attendance } from '@/lib/rosti-api'
import type { PlayerStatDraft } from '../player-stat-draft'
import { PlayerStatsList } from './player-stats-list'
import { ScoreEditor } from './score-editor'

interface ScoreDraft {
  blue: number
  red: number
}

interface StatsTabProps {
  score: ScoreDraft
  onScoreChange: (score: ScoreDraft) => void
  onSaveScore: (score: ScoreDraft) => void
  players: Attendance[]
  drafts: Record<string, PlayerStatDraft>
  onStatChange: (userId: string, draft: PlayerStatDraft) => void
  onSaveStats: (drafts: Record<string, PlayerStatDraft>, changedUserId: string) => void
  canEditScore: boolean
  canEditAllStats: boolean
  currentUserId?: string
}

export function StatsTab({
  score,
  onScoreChange,
  onSaveScore,
  players,
  drafts,
  onStatChange,
  onSaveStats,
  canEditScore,
  canEditAllStats,
  currentUserId,
}: StatsTabProps) {
  return (
    <>
      <ScoreEditor
        score={score}
        canEdit={canEditScore}
        onChange={onScoreChange}
        onSave={onSaveScore}
      />
      <PlayerStatsList
        players={players}
        drafts={drafts}
        canEditAll={canEditAllStats}
        currentUserId={currentUserId}
        onChange={onStatChange}
        onSave={onSaveStats}
      />
    </>
  )
}
