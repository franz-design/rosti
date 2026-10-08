import { Input } from '@rosti/ui/components/primitives/input'
import { Eye, EyeClosed } from '@rosti/ui/icons'
import { cn } from '@rosti/ui/lib/utils'
import { useState, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>

export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  function handleToggleVisibility() {
    setIsVisible((current) => !current)
  }

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
        className={cn('pr-10', className)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
        aria-label={isVisible ? t('auth.passwordVisibility.hide') : t('auth.passwordVisibility.show')}
        aria-pressed={isVisible}
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleToggleVisibility}
      >
        {isVisible ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
