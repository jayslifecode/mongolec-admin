'use client'

import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { useAuthStore } from '@/stores/auth-store'
import { visibleNavGroups } from '@/lib/navigation'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((s) => s.user)

  const navGroups = visibleNavGroups(sidebarData.navGroups, user)

  const navUser = {
    name: user
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
      : sidebarData.user.name,
    email: user?.email ?? sidebarData.user.email,
    avatar: sidebarData.user.avatar,
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                M
              </div>
              <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-sm text-sidebar-foreground">Mongolec</span>
                <span className="truncate text-xs text-sidebar-foreground/75">Admin Dashboard</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map(({ title, items }) => (
          <NavGroup key={title} title={title} items={items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
