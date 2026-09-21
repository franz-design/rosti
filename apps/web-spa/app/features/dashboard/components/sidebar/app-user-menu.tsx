import type { SupportedLocale } from '@rosti/i18n/config'
import { SUPPORTED_LOCALES } from '@rosti/i18n/config'
import { Avatar, AvatarFallback } from '@rosti/ui/components/primitives/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@rosti/ui/components/primitives/dropdown-menu'
import { ChevronUp, Globe, LogOut, Moon, Sun, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import useTheme from '@/hooks/useTheme'
import { authClient } from '@/lib/auth-client'
import { useI18nStore } from '@/lib/i18n/i18n-client'

export function AppUserMenu() {
  const { t, i18n } = useTranslation()
  const { data: sessionData } = authClient.useSession()
  const navigate = useNavigate()
  const { setLanguage } = useI18nStore()
  const [theme, setTheme] = useTheme()

  const handleLogout = async () => {
    await authClient.signOut()
    navigate('/login')
  }

  const userName = sessionData?.user?.name ?? sessionData?.user?.email ?? t('common.user')
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors outline-none">
        <Avatar size="sm">
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col items-start leading-none overflow-hidden">
          <span className="truncate text-xs font-semibold text-sidebar-foreground">{userName}</span>
          <span className="truncate text-[10px] text-muted-foreground">
            {sessionData?.user?.email}
          </span>
        </div>
        <ChevronUp className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem render={<Link to="/dashboard/profile" />}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('dashboard.profile')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          <span>{theme === 'dark' ? t('dashboard.lightMode') : t('dashboard.darkMode')}</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="mr-2 h-4 w-4" />
            <span>{t('dashboard.language')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.keys(SUPPORTED_LOCALES) as SupportedLocale[]).map((key) => {
              const config = SUPPORTED_LOCALES[key]
              return (
                <DropdownMenuItem key={key} onClick={() => setLanguage(key)}>
                  <span>
                    {config.flag} {config.name}
                  </span>
                  {i18n.language === key && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {t('common.active')}
                    </span>
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('dashboard.logOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
