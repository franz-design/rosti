import { type SolarIcon } from '@rosti/ui/icons'
import { CalendarIcon } from '@solar-icons/react/bold/calendar'
import { HomeSmileIcon } from '@solar-icons/react/bold/home-smile'
import { SettingsIcon } from '@solar-icons/react/bold/settings'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'

export interface AppNavItem {
  label: string
  to: string
  icon: SolarIcon
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
      icon: HomeSmileIcon,
    },
    {
      label: t('nav.matches'),
      to: '/matches',
      icon: CalendarIcon,
    },
    {
      label: t('nav.settings'),
      to: isClubAdmin ? '/club-settings' : '/dashboard/profile',
      icon: SettingsIcon,
    },
  ]
}
