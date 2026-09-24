import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_OCCURRENCE_COUNT,
  MAX_OCCURRENCE_COUNT,
  type RecurrenceEndMode,
} from '@/features/matches/utils/match-schedule-utils'

interface OccurrencesPickerProps {
  endMode: RecurrenceEndMode
  onEndModeChange: (value: RecurrenceEndMode) => void
  occurrenceCount: number
  onOccurrenceCountChange: (value: number) => void
  canUntilSeason: boolean
}

export function OccurrencesPicker({
  endMode,
  onEndModeChange,
  occurrenceCount,
  onOccurrenceCountChange,
  canUntilSeason,
}: OccurrencesPickerProps) {
  const { t } = useTranslation()
  const isCountMode = !canUntilSeason || endMode === 'count'

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isCountMode ? 'default' : 'outline'}
            className="flex-1 justify-start h-auto py-3"
            onClick={() => onEndModeChange('count')}
          >
            {t('createMatch.occurrenceCount')}
          </Button>
          <Input
            id="occurrenceCount"
            type="number"
            min={1}
            max={MAX_OCCURRENCE_COUNT}
            className="w-20"
            value={occurrenceCount}
            disabled={!isCountMode}
            onChange={(e) => onOccurrenceCountChange(Number(e.target.value) || 0)}
          />
        </div>
        {canUntilSeason ? (
          <Button
            type="button"
            variant={endMode === 'season' ? 'default' : 'outline'}
            className="justify-start h-auto py-3"
            onClick={() => onEndModeChange('season')}
          >
            {t('createMatch.untilSeasonEnd')}
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {isCountMode
          ? t('createMatch.recurrenceHint', {
              count: occurrenceCount || DEFAULT_OCCURRENCE_COUNT,
            })
          : t('createMatch.recurrenceHintSeason')}
      </p>
    </div>
  )
}
