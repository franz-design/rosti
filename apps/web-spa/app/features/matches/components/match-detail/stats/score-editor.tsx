import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ScoreSide } from '../score-side'

const SCORE_SAVE_DELAY_MS = 750

interface ScoreDraft {
  blue: number
  red: number
}

interface ScoreEditorProps {
  score: ScoreDraft
  canEdit: boolean
  onChange: (score: ScoreDraft) => void
  onSave: (score: ScoreDraft) => void
}

export function ScoreEditor({ score, canEdit, onChange, onSave }: ScoreEditorProps) {
  const { t } = useTranslation()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function handleChange(next: ScoreDraft) {
    onChange(next)
    if (!canEdit) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null
      onSaveRef.current(next)
    }, SCORE_SAVE_DELAY_MS)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-medium">{t('matches.detail.stats.score')}</h2>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ScoreSide
          className="w-full sm:w-1/2 rounded-lg bg-team-blue p-4 sm:p-8"
          label={t('matches.detail.stats.teamBlue')}
          labelClassName="text-team-blue"
          value={score.blue}
          canEdit={canEdit}
          tone="blue"
          onChange={(blue) => handleChange({ ...score, blue })}
        />
        <ScoreSide
          className="w-full sm:w-1/2 rounded-lg bg-primary p-4 sm:p-8"
          label={t('matches.detail.stats.teamRed')}
          labelClassName="text-primary"
          value={score.red}
          canEdit={canEdit}
          tone="red"
          onChange={(red) => handleChange({ ...score, red })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('matches.detail.stats.hint')}</p>
    </section>
  )
}
