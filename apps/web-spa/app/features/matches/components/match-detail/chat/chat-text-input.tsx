import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ChatTextInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isPending: boolean
}

export function ChatTextInput({ value, onChange, onSubmit, isPending }: ChatTextInputProps) {
  const { t } = useTranslation()

  return (
    <form
      className="flex shrink-0 items-stretch gap-2 border-t bg-background p-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!value.trim() || isPending) return
        onSubmit()
      }}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('matches.detail.chat.placeholder')}
        className="flex-1"
        autoComplete="off"
      />
      <Button
        type="submit"
        disabled={!value.trim() || isPending}
        size="icon"
        className="aspect-square size-auto self-stretch"
      >
        <Send className="size-4" />
        <span className="sr-only">{t('matches.detail.chat.send')}</span>
      </Button>
    </form>
  )
}
