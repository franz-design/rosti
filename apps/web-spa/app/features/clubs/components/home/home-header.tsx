import { MapPin } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import { EmptyMatchArt } from '@/features/matches/components/empty-match-art'
import type { SportType } from '@/lib/rosti-api'

interface HomeHeaderProps {
  clubName: string
  venue?: string | null
  sportType?: SportType | null
}

export function HomeHeader({ clubName, venue, sportType }: HomeHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="relative">
      <div className="relative z-10 max-w-[calc(100%-6.5rem)] sm:max-w-[calc(100%-9rem)]">
        <p className="text-sm text-muted-foreground">{t('home.eyebrow')}</p>
        <h1 className="text-3xl font-black tracking-tight">{clubName}</h1>
        {venue ? (
          <p className="mt-2 flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {venue}
          </p>
        ) : null}
      </div>
      <EmptyMatchArt
        name="ball"
        sportType={sportType}
        contained
        className="pointer-events-none absolute top-1/2 right-0 w-28 -translate-y-1/2 sm:w-36"
      />
    </div>
  )
}
