import { describe, expect, it } from 'vitest'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import { RALLY_TENANT_SLUG, canSeePage, tenantForPath, visibleNavGroups } from './navigation'

const groups = sidebarData.navGroups
const titles = (list: { title: string }[]) => list.map((g) => g.title)
const urlsOf = (list: typeof groups) =>
  list.flatMap((g) => g.items.flatMap((i) => (i.items ? i.items.map((s) => s.url) : [i.url])))

const superAdmin = { tenant: { slug: 'mec' }, roles: [{ role: { name: 'super_admin' } }] }
const rallyManager = { tenant: { slug: RALLY_TENANT_SLUG }, roles: [{ role: { name: 'admin' } }] }
const mecAdmin = { tenant: { slug: 'mec' }, roles: [{ role: { name: 'admin' } }] }

describe('sidebar sections', () => {
  it('splits the menu into separate sections with no dropdown in the rally section', () => {
    expect(titles(groups)).toEqual(['Overview', 'Rally for Rangers', 'Merchandise', 'Content', 'Administration'])
    const rally = groups.find((g) => g.title === 'Rally for Rangers')!
    expect(rally.items.every((item) => !item.items)).toBe(true)
  })

  it('keeps every page reachable', () => {
    expect(urlsOf(groups)).toEqual(
      expect.arrayContaining([
        '/', '/rallies', '/applications', '/participant-profiles', '/ranger-profiles', '/team',
        '/stories', '/nominations', '/contact', '/newsletter', '/rangers', '/merch', '/merch/orders',
        '/merch/categories', '/merch/discounts', '/news', '/users', '/tenants',
      ])
    )
  })
})

describe('visibleNavGroups', () => {
  it('shows a super admin everything', () => {
    expect(titles(visibleNavGroups(groups, superAdmin))).toEqual(titles(groups))
  })

  it('shows a rally manager only the overview and the rally section', () => {
    expect(titles(visibleNavGroups(groups, rallyManager))).toEqual(['Overview', 'Rally for Rangers'])
  })

  it('hides the rally section from admins of other organisations', () => {
    expect(titles(visibleNavGroups(groups, mecAdmin))).not.toContain('Rally for Rangers')
    expect(titles(visibleNavGroups(groups, mecAdmin))).toContain('Merchandise')
  })

  it('shows only the overview while the user is still loading', () => {
    expect(titles(visibleNavGroups(groups, null))).toEqual(['Overview'])
  })
})

describe('tenantForPath', () => {
  it('works in Rally for Rangers on every rally page, including nested ones', () => {
    for (const path of [
      '/rallies', '/rallies/abc123/edit', '/rallies/create', '/applications/xyz', '/participant-profiles',
      '/ranger-profiles/1', '/team', '/stories/new', '/nominations', '/contact', '/newsletter', '/rangers',
    ]) {
      expect(tenantForPath(path, groups)).toBe(RALLY_TENANT_SLUG)
    }
  })

  it("leaves other pages in the user's own organisation", () => {
    for (const path of ['/', '/merch', '/merch/orders', '/news', '/users', '/tenants', '/sign-in']) {
      expect(tenantForPath(path, groups)).toBeNull()
    }
  })

  it('never matches on a shared prefix alone (/team-x is not /team)', () => {
    expect(tenantForPath('/teams', groups)).toBeNull()
    expect(tenantForPath('/rallies-archive', groups)).toBeNull()
  })
})

describe('canSeePage', () => {
  it('keeps shop pages and figures away from a rally manager', () => {
    expect(canSeePage('/merch/orders', groups, rallyManager)).toBe(false)
    expect(canSeePage('/merch', groups, rallyManager)).toBe(false)
    expect(canSeePage('/applications', groups, rallyManager)).toBe(true)
    expect(canSeePage('/applications/abc', groups, rallyManager)).toBe(true)
  })

  it('lets super admins and other organisations’ admins see the shop', () => {
    expect(canSeePage('/merch/orders', groups, superAdmin)).toBe(true)
    expect(canSeePage('/merch/orders', groups, mecAdmin)).toBe(true)
  })

  it('shows nothing beyond the overview until the user has loaded', () => {
    expect(canSeePage('/merch/orders', groups, null)).toBe(false)
    expect(canSeePage('/', groups, null)).toBe(true)
  })
})
