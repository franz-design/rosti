import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { isAppNavItemActive, useAppNavItems } from '@/common/utils/app-nav-items'

export function AppBottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const items = useAppNavItems()

  return (
    <nav
      aria-label={t('dashboard.navigation')}
      className="absolute inset-x-0 bottom-0 z-50 bg-white pb-(--safe-area-bottom) shadow-[0_-1px_15px_-3px_rgb(0_0_0/0.1),0_-2px_6px_-4px_rgb(0_0_0/0.1)] md:hidden"
    >
      <ul className="grid h-14 grid-cols-3">
        {items.map((item) => {
          const isActive = isAppNavItemActive(location.pathname, item.to)

          return (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium',
                  isActive ? 'text-primary' : 'text-gray-500',
                )}
              >
                <item.icon className="size-5 shrink-0" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
