import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { isAppNavItemActive, useAppNavItems } from '../utils/app-nav-items'

export function AppBottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const items = useAppNavItems()

  return (
    <nav
      aria-label={t('dashboard.navigation')}
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="grid h-14 grid-cols-4">
        {items.map((item) => {
          const isActive = isAppNavItemActive(location.pathname, item.to)

          return (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground',
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

