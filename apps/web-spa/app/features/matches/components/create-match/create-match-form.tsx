import { Button } from '@rosti/ui/components/primitives/button'
import { DatePicker } from '@rosti/ui/components/primitives/date-picker'
import { Input } from '@rosti/ui/components/primitives/input'
import { Label } from '@rosti/ui/components/primitives/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rosti/ui/components/primitives/select'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  TIME_OPTIONS,
  type RecurrenceChoice,
} from '@/features/matches/utils/match-schedule-utils'
import { RecurrencePicker } from './recurrence-picker'

interface CreateMatchFormValues {
  title: string
  location: string
  maxPlayers: number
  matchDate: Date | undefined
  matchTime: string
  recurrence: RecurrenceChoice
}

interface CreateMatchFormProps {
  values: CreateMatchFormValues
  weekdayName: string
  dayOfMonth: number
  isPending: boolean
  onTitleChange: (value: string) => void
  onLocationChange: (value: string) => void
  onMaxPlayersChange: (value: number) => void
  onDateChange: (value: Date | undefined) => void
  onTimeChange: (value: string) => void
  onRecurrenceChange: (value: RecurrenceChoice) => void
  onSubmit: () => void
}

export function CreateMatchForm({
  values,
  weekdayName,
  dayOfMonth,
  isPending,
  onTitleChange,
  onLocationChange,
  onMaxPlayersChange,
  onDateChange,
  onTimeChange,
  onRecurrenceChange,
  onSubmit,
}: CreateMatchFormProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="matchTitle">{t('createMatch.matchTitle')}</Label>
        <Input
          id="matchTitle"
          value={values.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('createMatch.matchTitlePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">{t('createMatch.location')}</Label>
        <Input
          id="location"
          value={values.location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder={t('createMatch.locationPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPlayers">{t('createMatch.maxPlayers')}</Label>
        <Input
          id="maxPlayers"
          type="number"
          min={2}
          max={40}
          value={values.maxPlayers}
          onChange={(e) => onMaxPlayersChange(Number(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('createMatch.date')}</Label>
        <DatePicker
          value={values.matchDate}
          onDateChange={onDateChange}
          localeCode="fr-FR"
          placeholder={t('createMatch.datePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('createMatch.time')}</Label>
        <Select value={values.matchTime} onValueChange={(v) => v && onTimeChange(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('createMatch.recurrence')}</Label>
        <RecurrencePicker
          value={values.recurrence}
          onChange={onRecurrenceChange}
          matchDate={values.matchDate}
          weekdayName={weekdayName}
          dayOfMonth={dayOfMonth}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" render={<Link to="/matches" />}>
          {t('createMatch.back')}
        </Button>
        <Button
          className="flex-1"
          disabled={isPending || !values.matchDate || !values.title.trim() || values.maxPlayers < 2}
          onClick={onSubmit}
        >
          {isPending ? t('createMatch.submitting') : t('createMatch.submit')}
        </Button>
      </div>
    </div>
  )
}
