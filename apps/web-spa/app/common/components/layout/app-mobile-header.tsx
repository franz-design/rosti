import { Link } from 'react-router'
import RostiLogo from '@/assets/images/rosti-logo.svg'
import { ClubSwitcher } from '@/features/clubs/components/club-switcher'
import { AppUserMenu } from './sidebar/app-user-menu'

export function AppMobileHeader() {
  return (
    <header className="z-40 flex h-[calc(var(--header-height)+var(--safe-area-top))] shrink-0 items-center justify-between gap-3 border-b bg-background px-4 pt-(--safe-area-top) md:hidden">
      <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
        <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
        <span className="font-logo text-xl font-medium tracking-tight text-primary">Rösti</span>
      </Link>
      <div className="flex min-w-0 items-center gap-1">
        <ClubSwitcher variant="header" />
        <AppUserMenu variant="compact" />
      </div>
    </header>
  )
}
