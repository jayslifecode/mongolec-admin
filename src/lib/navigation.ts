import { type NavGroup } from '@/components/layout/types'
import { RALLY_TENANT_SLUG, SUPER_ADMIN_ROLE } from './tenants'

export { RALLY_TENANT_SLUG }

/** The parts of the signed-in user that decide what they see. */
export interface NavViewer {
  tenant?: { slug: string } | null
  roles?: { role: { name: string } }[]
}

function isSuperAdmin(viewer: NavViewer): boolean {
  return viewer.roles?.some((r) => r.role.name === SUPER_ADMIN_ROLE) ?? false
}

function groupUrls(group: NavGroup): string[] {
  return group.items.flatMap((item) => (item.items ? item.items.map((sub) => sub.url) : [item.url]))
}

/** True when `pathname` is `base` or a page under it (`/team` matches `/team/1`, not `/teams`). */
function isUnder(pathname: string, base: string): boolean {
  if (base === '/') return false
  return pathname === base || pathname.startsWith(`${base}/`)
}

/**
 * Sections the viewer may see:
 * - super admins see everything;
 * - users of an organisation that owns a section (e.g. the Rally for Rangers team) see the
 *   'everyone' sections plus their own organisation's;
 * - other users see every section no organisation owns, except super-admin ones.
 */
export function visibleNavGroups(groups: NavGroup[], viewer: NavViewer | null): NavGroup[] {
  const forEveryone = (g: NavGroup) => g.audience === 'everyone'
  if (!viewer) return groups.filter(forEveryone)
  if (isSuperAdmin(viewer)) return groups

  const tenant = viewer.tenant?.slug
  const ownsASection = groups.some((g) => g.tenantSlug !== undefined && g.tenantSlug === tenant)
  if (ownsASection) return groups.filter((g) => forEveryone(g) || g.tenantSlug === tenant)

  return groups.filter((g) => !g.tenantSlug && g.audience !== 'super_admin')
}

/**
 * True when `pathname` sits in a menu section the viewer may see. Pages use it to leave out
 * panels from other sections, e.g. the dashboard's shop figures for a rally manager.
 */
export function canSeePage(pathname: string, groups: NavGroup[], viewer: NavViewer | null): boolean {
  return visibleNavGroups(groups, viewer)
    .flatMap(groupUrls)
    .some((url) => pathname === url || isUnder(pathname, url))
}

/**
 * Organisation a page works in: the owner of the section the page belongs to, or null for
 * pages that use the signed-in user's own organisation.
 */
export function tenantForPath(pathname: string, groups: NavGroup[]): string | null {
  const owner = groups.find(
    (g) => g.tenantSlug && groupUrls(g).some((url) => isUnder(pathname, url))
  )
  return owner?.tenantSlug ?? null
}
