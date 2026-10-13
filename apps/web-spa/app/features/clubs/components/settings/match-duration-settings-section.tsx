import { Button } from '@rosti/ui/components/primitives/button'
import { Label } from '@rosti/ui/components/primitives/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rosti/ui/components/primitives/select'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
import { rostiApi } from '@/lib/rosti-api'

const DURATION_OPTIONS = [45, 60, 75, 90, 105, 120] as const
const DEFAULT_DURATION = 90

function isDurationOption(value: number): value is (typeof DURATION_OPTIONS)[number] {
  return (DURATION_OPTIONS as readonly number[]).includes(value)
}

function formatDuration(minutes: number, t: TFunction): string {
  return t('clubSettings.matchDuration.minutes', { count: minutes })
}

export function MatchDurationSettingsSection() {
  const { t } = useTranslation()
  const { activeClub, refetchClubs } = useClub()
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION)

  useEffect(() => {
    if (!activeClub) return
    const next = activeClub.matchDurationMinutes
    setDuration(next != null && isDurationOption(next) ? next : DEFAULT_DURATION)
  }, [activeClub])

  const save = useMutation({
    mutationFn: async () => {
      if (!activeClub) throw new Error(t('clubSettings.noClub'))
      return rostiApi.updateClub(activeClub.id, { matchDurationMinutes: duration })
    },
    onSuccess: () => {
      toast.success(t('clubSettings.matchDuration.saved'))
      refetchClubs()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">{t('clubSettings.matchDuration.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('clubSettings.matchDuration.hint')}</p>
      </div>

      <div className="space-y-2">
        <Label>{t('clubSettings.matchDuration.label')}</Label>
        <Select
          value={String(duration)}
          onValueChange={(value) => {
            if (!value) return
            const next = Number(value)
            if (isDurationOption(next)) setDuration(next)
          }}
        >
          <SelectTrigger className="w-full lg:w-auto lg:min-w-64">
            <SelectValue>{(value) => formatDuration(Number(value), t)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((minutes) => (
              <SelectItem key={minutes} value={String(minutes)}>
                {formatDuration(minutes, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => save.mutate()} disabled={save.isPending} loading={save.isPending}>
        {t('clubSettings.matchDuration.save')}
      </Button>
    </section>
  )
}
