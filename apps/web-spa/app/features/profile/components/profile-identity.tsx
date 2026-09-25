import { Avatar, AvatarFallback, AvatarImage } from '@rosti/ui/components/primitives/avatar'
import { Button } from '@rosti/ui/components/primitives/button'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface ProfileIdentityProps {
  displayName: string
  initials: string
  email?: string | null
  imageUrl?: string | null
  isUploading: boolean
  onSelectFile: (file: File) => void
  onRemove: () => void
}

export function ProfileIdentity({
  displayName,
  initials,
  email,
  imageUrl,
  isUploading,
  onSelectFile,
  onRemove,
}: ProfileIdentityProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg" className="size-16">
        {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
        <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-2">
        <div>
          <p className="truncate text-lg font-bold text-foreground">{displayName}</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) onSelectFile(file)
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {t('profile.changeAvatar')}
          </Button>
          {imageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={onRemove}
            >
              {t('profile.removeAvatar')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
