import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import type { SessionFee } from '@/lib/rosti-api'
import { formatEuro } from '@/features/matches/utils/euros'

interface MyFeeCardProps {
  fee: SessionFee | undefined
  locale: string
  isPending: boolean
  onMarkPaid: () => void
  onUndoPaid: () => void
}

export function MyFeeCard({ fee, locale, isPending, onMarkPaid, onUndoPaid }: MyFeeCardProps) {
  const { t } = useTranslation()

  if (!fee) {
    return (
      <p className="text-sm text-muted-foreground">{t('matches.detail.payments.nothingToPay')}</p>
    )
  }

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-medium">{t('matches.detail.payments.yourShare')}</h2>
        <p className="text-lg font-semibold tabular-nums">{formatEuro(fee.amountCents, locale)}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {t(`matches.detail.payments.status.${fee.status}`)}
      </p>
      <div className="flex flex-wrap gap-2">
        {fee.status === 'owed' && fee.paymentUrl ? (
          <Button
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
        {fee.status === 'owed' ? (
          <Button variant="outline" disabled={isPending} loading={isPending} onClick={onMarkPaid}>
            {t('matches.detail.payments.markPaid')}
          </Button>
        ) : null}
        {fee.status === 'paid' ? (
          <Button variant="outline" disabled={isPending} loading={isPending} onClick={onUndoPaid}>
            {t('matches.detail.payments.undoPaid')}
          </Button>
        ) : null}
      </div>
    </section>
  )
}
