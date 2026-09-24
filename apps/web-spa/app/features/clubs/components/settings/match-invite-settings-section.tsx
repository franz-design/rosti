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

const LEAD_DAY_OPTIONS = [1, 2, 3, 5, 7, 14] as const
const NO_REMINDER = 'none'

function formatLeadDays(days: number, t: TFunction): string {
  if (days === 1) return t('clubSettings.matchInvite.dayBefore')
  return t('clubSettings.matchInvite.daysBefore', { count: days })
}

export function MatchInviteSettingsSection() {
  const { t } = useTranslation()
  const { activeClub, refetchClubs } = useClub()
  const [leadDays, setLeadDays] = useState(5)
  const [reminderDays, setReminderDays] = useState<number | null>(null)

  useEffect(() => {
    if (!activeClub) return
    const nextLead = activeClub.matchInviteLeadDays ?? 5
    const nextReminder = activeClub.matchInviteReminderLeadDays ?? null
    setLeadDays(nextLead)
    setReminderDays(nextReminder != null && nextReminder < nextLead ? nextReminder : null)
  }, [activeClub])

  const save = useMutation({
    mutationFn: async () => {
      if (!activeClub) throw new Error(t('clubSettings.noClub'))
      return rostiApi.updateClub(activeClub.id, {
        matchInviteLeadDays: leadDays,
        matchInviteReminderLeadDays: reminderDays,
      })
    },
    onSuccess: () => {
      toast.success(t('clubSettings.matchInvite.saved'))
      refetchClubs()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const reminderOptions = LEAD_DAY_OPTIONS.filter((days) => days < leadDays)

  const handleLeadChange = (value: string | null) => {
    if (!value) return
    const nextLead = Number(value)
    setLeadDays(nextLead)
    if (reminderDays != null && reminderDays >= nextLead) setReminderDays(null)
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">{t('clubSettings.matchInvite.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('clubSettings.matchInvite.hint')}</p>
      </div>

      <div className="space-y-2">
        <Label>{t('clubSettings.matchInvite.leadLabel')}</Label>
        <Select value={String(leadDays)} onValueChange={handleLeadChange}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value) => formatLeadDays(Number(value), t)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LEAD_DAY_OPTIONS.map((days) => (
              <SelectItem key={days} value={String(days)}>
                {formatLeadDays(days, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('clubSettings.matchInvite.reminderLabel')}</Label>
        <p className="text-sm text-muted-foreground">
          {t('clubSettings.matchInvite.reminderHint')}
        </p>
        <Select
          value={reminderDays == null ? NO_REMINDER : String(reminderDays)}
          onValueChange={(value) => {
            if (!value || value === NO_REMINDER) {
              setReminderDays(null)
              return
            }
            setReminderDays(Number(value))
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value) =>
                value == null || value === NO_REMINDER
                  ? t('clubSettings.matchInvite.noReminder')
                  : formatLeadDays(Number(value), t)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_REMINDER}>{t('clubSettings.matchInvite.noReminder')}</SelectItem>
            {reminderOptions.map((days) => (
              <SelectItem key={days} value={String(days)}>
                {formatLeadDays(days, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => save.mutate()} disabled={save.isPending} loading={save.isPending}>
        {t('clubSettings.matchInvite.save')}
      </Button>
    </section>
  )
}
