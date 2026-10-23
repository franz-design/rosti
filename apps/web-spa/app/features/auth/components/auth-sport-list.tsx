import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { SportType } from '@/lib/rosti-api'

const CLUB_SPORTS: SportType[] = [
  'football',
  'futsal',
  'basketball',
  'volleyball',
  'tennis',
  'padel',
  'badminton',
]

interface AuthSportListProps {
  tone?: 'onDark' | 'onLight'
  className?: string
}

export function AuthSportList({ tone = 'onLight', className }: AuthSportListProps) {
  const { t } = useTranslation()

  return (
    <ul
      aria-label={t('auth.sports.label')}
      className={cn(
        'flex flex-wrap items-center text-sm',
        tone === 'onDark' ? 'text-primary' : 'text-muted-foreground',
        className,
      )}
    >
      {CLUB_SPORTS.map((sport, index) => (
        <li key={sport} className="flex items-center">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className={cn(
                'px-1.5',
                tone === 'onDark' ? 'text-white/40' : 'text-muted-foreground/60',
              )}
            >
              ·
            </span>
          ) : null}
          {t(`onboarding.sports.${sport}`)}
        </li>
      ))}
    </ul>
  )
}
