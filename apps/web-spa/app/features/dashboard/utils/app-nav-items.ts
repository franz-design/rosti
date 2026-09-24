import { CalendarDays, Home, Settings, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'

export interface AppNavItem {
  label: string
  to: string
  icon: LucideIcon
}

export function isAppNavItemActive(pathname: string, to: string): boolean {
  if (to === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname.startsWith(to)
}

export function useAppNavItems(): AppNavItem[] {
  const { t } = useTranslation()
  const { isClubAdmin } = useClub()

  return [
    {
      label: t('nav.home'),
      to: '/dashboard',
      icon: Home,
    },
    {
      label: t('nav.matches'),
      to: '/matches',
      icon: CalendarDays,
    },
    {
      label: t('nav.settings'),
      to: isClubAdmin ? '/club-settings' : '/dashboard/profile',
      icon: Settings,
    },
  ]
}
