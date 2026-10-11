import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { Label } from '@rosti/ui/components/primitives/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rosti/ui/components/primitives/select'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MatchCost, SessionFee } from '@/lib/rosti-api'
import { QuantityStepper } from '../quantity-stepper'
import { centsToEuroInput, eurosToCents, formatEuro } from '@/features/matches/utils/euros'

interface FeeAdminPanelProps {
  cost: MatchCost | undefined
  fees: SessionFee[]
  locale: string
  currentUserId?: string
  isSavingCost: boolean
  isReminding: boolean
  onSaveCost: (pitchCostCents: number, extrasCostCents: number) => void
  onSharesChange: (feeId: string, shares: number) => void
  onStatusChange: (feeId: string, status: SessionFee['status']) => void
  onRemind: () => void
}

export function FeeAdminPanel({
  cost,
  fees,
  locale,
  currentUserId,
  isSavingCost,
  isReminding,
  onSaveCost,
  onSharesChange,
  onStatusChange,
  onRemind,
}: FeeAdminPanelProps) {
  const { t } = useTranslation()
  const [pitch, setPitch] = useState('')
  const [extras, setExtras] = useState('')
  const [amountError, setAmountError] = useState(false)

  useEffect(() => {
    if (!cost) return
    setPitch(centsToEuroInput(cost.pitchCostCents))
    setExtras(centsToEuroInput(cost.extrasCostCents))
  }, [cost])

  const expected = fees
    .filter((fee) => fee.status !== 'waived')
    .reduce((sum, fee) => sum + fee.amountCents, 0)
  const collected = fees
    .filter((fee) => fee.status === 'paid')
    .reduce((sum, fee) => sum + fee.amountCents, 0)
  const hasUnpaid = fees.some((fee) => fee.status === 'owed' && fee.amountCents > 0)

  function handleSave() {
    const pitchCents = eurosToCents(pitch)
    const extrasCents = eurosToCents(extras)
    if (pitchCents == null || extrasCents == null) {
      setAmountError(true)
      return
    }
    setAmountError(false)
    onSaveCost(pitchCents, extrasCents)
  }

  return (
    <div className="flex flex-col justify-start items-start gap-6">
      <div className="flex gap-6 items-end bg-sidebar p-4 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="pitchCost">{t('matches.detail.payments.pitch')}</Label>
          <Input
            id="pitchCost"
            inputMode="decimal"
            value={pitch}
            onChange={(event) => setPitch(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="extrasCost">{t('matches.detail.payments.extras')}</Label>
          <Input
            id="extrasCost"
            inputMode="decimal"
            value={extras}
            onChange={(event) => setExtras(event.target.value)}
          />
        </div>
        {amountError ? (
          <p className="text-sm text-destructive">{t('matches.detail.payments.invalidAmount')}</p>
        ) : null}
        <Button onClick={handleSave} disabled={isSavingCost} loading={isSavingCost}>
          {t('matches.detail.payments.saveCost')}
        </Button>
      </div>

      {fees.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('matches.detail.payments.empty')}</p>
      ) : (
        <section className="flex flex-col gap-3 flex-1 w-full">
          <p className="text-sm text-muted-foreground">
            {t('matches.detail.payments.collected', {
              paid: formatEuro(collected, locale),
              total: formatEuro(expected, locale),
            })}
          </p>
          <ul className="flex flex-col gap-3">
            {fees.map((fee) => (
              <li key={fee.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-4">
                    <QuantityStepper
                      value={fee.shares}
                      size="sm"
                      decreaseLabel={t('matches.detail.payments.decreaseShares')}
                      increaseLabel={t('matches.detail.payments.increaseShares')}
                      onChange={(shares) => {
                        if (shares < 1 || shares === fee.shares) return
                        onSharesChange(fee.id, shares)
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{fee.userName}</p>
                      <p className="text-sm tabular-nums text-muted-foreground">
                        {formatEuro(fee.amountCents, locale)}
                      </p>
                    </div>
                  </div>
                  <Select
                    value={fee.status}
                    onValueChange={(status) => {
                      if (!status || status === fee.status) return
                      onStatusChange(fee.id, status as SessionFee['status'])
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        {(value) => (value ? t(`matches.detail.payments.status.${value}`) : null)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owed">
                        {t('matches.detail.payments.status.owed')}
                      </SelectItem>
                      <SelectItem value="paid">
                        {t('matches.detail.payments.status.paid')}
                      </SelectItem>
                      <SelectItem value="waived">
                        {t('matches.detail.payments.status.waived')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {fee.status === 'owed' && fee.reminderCount > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('matches.detail.payments.reminders', { count: fee.reminderCount })}
                    {fee.lastRemindedAt
                      ? ` · ${t('matches.detail.payments.lastReminder', {
                          date: new Date(fee.lastRemindedAt).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'long',
                          }),
                        })}`
                      : null}
                  </p>
                ) : null}
                {fee.userId === currentUserId && fee.status === 'owed' && fee.paymentUrl ? (
                  <Button
                    variant="outline"
                    render={
                      <a
                        href={fee.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('matches.detail.payments.pay')}
                      />
                    }
                  >
                    {t('matches.detail.payments.pay')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            disabled={!hasUnpaid || isReminding}
            loading={isReminding}
            onClick={onRemind}
          >
            {t('matches.detail.payments.remind')}
          </Button>
        </section>
      )}
    </div>
  )
}
