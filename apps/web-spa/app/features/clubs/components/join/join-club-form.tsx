import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { useTranslation } from 'react-i18next'

interface JoinClubFormProps {
  value: string
  error: string | null
  onChange: (value: string) => void
  onSubmit: () => void
}

export function JoinClubForm({ value, error, onChange, onSubmit }: JoinClubFormProps) {
  const { t } = useTranslation()

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="space-y-2">
        <label htmlFor="invite" className="text-sm font-medium">
          {t('join.inviteLabel')}
        </label>
        <Input
          id="invite"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('join.invitePlaceholder')}
          autoComplete="off"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <Button type="submit" className="w-full">
        {t('join.continue')}
      </Button>
    </form>
  )
}
