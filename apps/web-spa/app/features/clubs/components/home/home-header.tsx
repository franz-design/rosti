import { MapPin } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'

interface HomeHeaderProps {
  clubName: string
  venue?: string | null
}

export function HomeHeader({ clubName, venue }: HomeHeaderProps) {
  const { t } = useTranslation()

  return (
    <div>
      <p className="text-sm text-muted-foreground">{t('home.eyebrow')}</p>
      <h1 className="text-3xl font-black tracking-tight">{clubName}</h1>
      {venue ? (
        <p className="mt-2 flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {venue}
        </p>
      ) : null}
    </div>
  )
}
