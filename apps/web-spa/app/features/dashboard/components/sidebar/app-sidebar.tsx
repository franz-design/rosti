import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from '@rosti/ui/components/primitives/sidebar'
import { AppSidebarHeader } from './app-sidebar-header'
import { AppSidebarNav } from './app-sidebar-nav'
import { AppUserMenu } from './app-user-menu'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <SidebarContent>
        <AppSidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AppUserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
