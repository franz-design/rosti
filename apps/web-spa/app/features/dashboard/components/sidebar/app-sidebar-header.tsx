import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@rosti/ui/components/primitives/sidebar'
import { Link } from 'react-router'
import RostiLogo from '@/assets/images/rosti-logo.svg'

export function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
            <div className="flex justify-center gap-2 md:justify-start">
              <a href="/" className="flex items-center gap-1">
                <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
                <span className="font-logo font-medium tracking-tight text-2xl text-primary">
                  Rösti
                </span>
              </a>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
