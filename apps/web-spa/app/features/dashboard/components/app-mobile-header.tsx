import { Link } from 'react-router'
import RostiLogo from '@/assets/images/rosti-logo.svg'
import { AppUserMenu } from './sidebar/app-user-menu'

export function AppMobileHeader() {
  return (
    <header className="z-40 flex h-(--header-height) shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
      <Link to="/dashboard" className="flex items-center gap-2">
        <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
        <span className="font-logo text-xl font-medium tracking-tight text-primary">Rösti</span>
      </Link>
      <AppUserMenu variant="compact" />
    </header>
  )
}
