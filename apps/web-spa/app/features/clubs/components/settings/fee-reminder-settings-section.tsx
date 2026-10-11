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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
import { rostiApi } from '@/lib/rosti-api'

const DELAY_OPTIONS = [1, 2, 3, 5, 7, 14, 21, 30] as const
const OFF = 'off'
const NO_SECOND = 'none'

function withCurrent(days: number | null): number[] {
  const values = new Set<number>(DELAY_OPTIONS)
  if (days != null) values.add(days)
  return [...values].sort((left, right) => left - right)
}

export function FeeReminderSettingsSection() {
  const { t } = useTranslation()
  const { activeClub, refetchClubs } = useClub()
  const [enabled, setEnabled] = useState(true)
  const [firstDelay, setFirstDelay] = useState(3)
  const [secondDelay, setSecondDelay] = useState<number | null>(7)

  useEffect(() => {
    if (!activeClub) return
    const delays = activeClub.feeReminderDelaysDays ?? [3, 7]
    if (delays.length === 0) {
      setEnabled(false)
      return
    }
    setEnabled(true)
    setFirstDelay(delays[0] ?? 3)
    setSecondDelay(delays[1] != null && delays[1] > (delays[0] ?? 3) ? delays[1] : null)
  }, [activeClub])

  const save = useMutation({
    mutationFn: async () => {
      if (!activeClub) throw new Error(t('clubSettings.noClub'))
      const feeReminderDelaysDays = enabled
        ? [firstDelay, ...(secondDelay != null ? [secondDelay] : [])]
        : []
      return rostiApi.updateClub(activeClub.id, { feeReminderDelaysDays })
    },
    onSuccess: () => {
      toast.success(t('clubSettings.feeReminders.saved'))
      refetchClubs()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const secondOptions = withCurrent(secondDelay).filter((days) => days > firstDelay)

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">{t('clubSettings.feeReminders.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('clubSettings.feeReminders.hint')}</p>
      </div>

      <div className="space-y-2">
        <Label>{t('clubSettings.feeReminders.enabled')}</Label>
        <Select
          value={enabled ? 'on' : OFF}
          onValueChange={(value) => {
            if (!value) return
            setEnabled(value !== OFF)
          }}
        >
          <SelectTrigger className="w-full lg:w-auto lg:min-w-64">
            <SelectValue>
              {(value) =>
                value === OFF
                  ? t('clubSettings.feeReminders.off')
                  : t('clubSettings.feeReminders.on')
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="on">{t('clubSettings.feeReminders.on')}</SelectItem>
            <SelectItem value={OFF}>{t('clubSettings.feeReminders.off')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {enabled ? (
        <>
          <div className="space-y-2">
            <Label>{t('clubSettings.feeReminders.first')}</Label>
            <Select
              value={String(firstDelay)}
              onValueChange={(value) => {
                if (!value) return
                const next = Number(value)
                setFirstDelay(next)
                if (secondDelay != null && secondDelay <= next) setSecondDelay(null)
              }}
            >
              <SelectTrigger className="w-full lg:w-auto lg:min-w-64">
                <SelectValue>
                  {(value) => t('clubSettings.feeReminders.daysAfter', { count: Number(value) })}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {withCurrent(firstDelay).map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {t('clubSettings.feeReminders.daysAfter', { count: days })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('clubSettings.feeReminders.second')}</Label>
            <Select
              value={secondDelay == null ? NO_SECOND : String(secondDelay)}
              onValueChange={(value) => {
                if (!value || value === NO_SECOND) {
                  setSecondDelay(null)
                  return
                }
                setSecondDelay(Number(value))
              }}
            >
              <SelectTrigger className="w-full lg:w-auto lg:min-w-64">
                <SelectValue>
                  {(value) =>
                    value == null || value === NO_SECOND
                      ? t('clubSettings.feeReminders.none')
                      : t('clubSettings.feeReminders.daysAfter', { count: Number(value) })
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SECOND}>{t('clubSettings.feeReminders.none')}</SelectItem>
                {secondOptions.map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {t('clubSettings.feeReminders.daysAfter', { count: days })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      <Button onClick={() => save.mutate()} disabled={save.isPending} loading={save.isPending}>
        {t('clubSettings.feeReminders.save')}
      </Button>
    </section>
  )
}
