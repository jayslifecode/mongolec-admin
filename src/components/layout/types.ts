type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: string
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
  /**
   * Organisation this section's data belongs to. Its pages send it as X-Tenant-ID so a
   * super admin (whose own organisation is Mongolec) works on that organisation's data,
   * and only that organisation's users (plus super admins) see the section.
   */
  tenantSlug?: string
  /**
   * Who sees the section regardless of organisation: 'everyone' signed in (the overview) or
   * only 'super_admin' (tenants and users). Unset: users of the owning organisation, or of
   * any organisation when the section has no owner.
   */
  audience?: 'everyone' | 'super_admin'
}

type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }