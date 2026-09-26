import { Camera, Loader2, XIcon } from '@rosti/ui/icons'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PlayerAvatar } from '@/common/components/player-avatar'

interface MemberAvatarControlProps {
  name: string
  imageUrl?: string | null
  isBusy: boolean
  isPending: boolean
  onSelectFile: (file: File) => void
  onRemove: () => void
}

export function MemberAvatarControl({
  name,
  imageUrl,
  isBusy,
  isPending,
  onSelectFile,
  onRemove,
}: MemberAvatarControlProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="absolute inset-0">
      <button
        type="button"
        className="absolute inset-0 overflow-hidden rounded-full disabled:cursor-not-allowed"
        disabled={isBusy}
        aria-label={t('clubSettings.players.changeAvatar', { name })}
        onClick={() => inputRef.current?.click()}
      >
        <PlayerAvatar
          name={name}
          imageUrl={imageUrl}
          className="absolute inset-0 size-full! rounded-full"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-1/3 items-center justify-center bg-black/50 text-white">
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Camera className="size-3.5" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={isBusy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onSelectFile(file)
        }}
      />
      {imageUrl ? (
        <button
          type="button"
          className="absolute top-0 right-0 z-10 flex size-5 items-center justify-center rounded-full bg-background text-foreground shadow-sm disabled:cursor-not-allowed"
          disabled={isBusy}
          aria-label={t('clubSettings.players.removeAvatar', { name })}
          onClick={onRemove}
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </div>
  )
}
