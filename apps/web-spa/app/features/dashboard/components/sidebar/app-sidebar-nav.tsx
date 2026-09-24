import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@rosti/ui/components/primitives/sidebar'
import { Link, useLocation } from 'react-router'
import { isAppNavItemActive, useAppNavItems } from '../../utils/app-nav-items'

export function AppSidebarNav() {
  const navItems = useAppNavItems()
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = isAppNavItemActive(location.pathname, item.to)
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  tooltip={item.label}
                  isActive={isActive}
                  render={<Link to={item.to} />}
                  className={
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                      : ''
                  }
                >
                  <item.icon size={20} strokeWidth={2} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
