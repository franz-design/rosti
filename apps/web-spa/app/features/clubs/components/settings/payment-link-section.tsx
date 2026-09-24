import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { useTranslation } from 'react-i18next'

interface PaymentLinkSectionProps {
  value: string
  placeholder?: string
  isPending: boolean
  onChange: (value: string) => void
  onSave: () => void
}

export function PaymentLinkSection({
  value,
  placeholder,
  isPending,
  onChange,
  onSave,
}: PaymentLinkSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-medium">{t('clubSettings.paymentLink.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('clubSettings.paymentLink.hint')}</p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'https://…'}
      />
      <Button onClick={onSave} loading={isPending}>
        {t('clubSettings.paymentLink.save')}
      </Button>
    </section>
  )
}
