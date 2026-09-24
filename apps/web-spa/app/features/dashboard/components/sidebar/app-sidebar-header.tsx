import RostiLogo from '@/assets/images/rosti-logo.svg'
import { SidebarHeader, SidebarMenu } from '@rosti/ui/components/primitives/sidebar'

export function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <div className="flex justify-center gap-2 md:justify-start p-2">
          <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
          <span className="font-logo font-medium tracking-tight text-2xl text-primary">Rösti</span>
        </div>
      </SidebarMenu>
    </SidebarHeader>
  )
}
