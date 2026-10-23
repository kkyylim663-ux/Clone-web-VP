// 导航数据：桌面侧栏、手机抽屉、底部 tab 共用一份（分组与参考站一致：3 组，组间分隔线）
// 来源：文档 docs/nav-map/clicks-public.md 1280 侧栏行（跳转 path）；参考站侧栏点击直接跳转、不展开（来源：文档 interactions.md 桌面 a），因此不再保留子菜单。
// 文案一律用 k（语言包键，如 base.nav.casino），组件里 t(k) 取值，不在数据里写中英文。
import type { IconName } from '@/components/ui/icon-paths'
export interface NavItem { k: string, to: string, icon: IconName, badge?: number }
export interface NavGroup { items: NavItem[] }

export const sideGroups: NavGroup[] = [
  {
    items: [
      { k: 'base.nav.casino', to: '/casino', icon: 'casino' },
      { k: 'base.nav.sports', to: '/sports', icon: 'sports' },
      { k: 'base.nav.bonus', to: '/bonus', icon: 'bonus', badge: 1 },
      { k: 'base.nav.jackpot', to: '/jackpot', icon: 'jackpot' }
    ]
  },
  {
    items: [
      { k: 'base.nav.vip', to: '/vip', icon: 'vip' },
      { k: 'base.nav.promotion', to: '/promotion', icon: 'promotion' },
      { k: 'base.nav.referEarn', to: '/refer-earn', icon: 'refer' },
      { k: 'base.nav.spin', to: '/freeSpin', icon: 'spin' }
    ]
  },
  {
    items: [
      { k: 'base.nav.privacy', to: '/privacy-policy', icon: 'privacy' },
      { k: 'base.nav.sitemap', to: '/site-map', icon: 'sitemap' }
    ]
  }
]

// 手机底部 tab（5 项，第 1 项是菜单，打开抽屉）
// 搜索：参考站为 /casino/search（来源：文档 handlers-static §2）；本站搜索页路由为 /casino/search2（用户指定映射，已在此注明）。
export const tabItems = [
  { key: 'menu', k: 'base.nav.menu', to: '', icon: 'menu' as IconName },
  { key: 'casino', k: 'base.nav.casino', to: '/casino', icon: 'casino' as IconName },
  { key: 'bonus', k: 'base.nav.bonus', to: '/bonus', icon: 'bonus' as IconName, badge: 1 },
  { key: 'sports', k: 'base.nav.sports', to: '/sports', icon: 'sports' as IconName },
  { key: 'search', k: 'base.nav.search', to: '/casino/search', icon: 'search' as IconName }
]

// 赌场子菜单（侧栏「赌场」展开项）。路径与参考站一致：大厅 → /casino，其余 → /group/slug/<slug>?sildebar=1
// cat = 本站分类 key（有数据的才有；没有的分类进入后显示空态）
export interface CasinoSub { k: string, slug: string, to: string, icon: IconName, cat?: string }
export const casinoSub: CasinoSub[] = [
  { k: 'base.nav.sub.lobby', slug: '', to: '/casino', icon: 'home' },
  { k: 'base.nav.sub.slot', slug: 'slot-round', to: '/group/slug/slot-round?sildebar=1', icon: 'slot', cat: 'slots' },
  { k: 'base.nav.sub.live', slug: 'live-casino-group', to: '/group/slug/live-casino-group?sildebar=1', icon: 'live', cat: 'live' },
  { k: 'base.nav.sub.fishing', slug: 'fishing-group', to: '/group/slug/fishing-group?sildebar=1', icon: 'fishing', cat: 'fishing' },
  { k: 'base.nav.sub.crash', slug: 'crash-group', to: '/group/slug/crash-group?sildebar=1', icon: 'crash', cat: 'crash' },
  { k: 'base.nav.sub.mini', slug: 'mini-game', to: '/group/slug/mini-game?sildebar=1', icon: 'mini', cat: 'mini' },
  { k: 'base.nav.sub.table', slug: 'table-games-group', to: '/group/slug/table-games-group?sildebar=1', icon: 'table', cat: 'table' },
  { k: 'base.nav.sub.buyin', slug: 'feature-buy-in-group', to: '/group/slug/feature-buy-in-group?sildebar=1', icon: 'buyin', cat: 'buyin' },
  { k: 'base.nav.sub.featured', slug: 'featured-slot-machine-group', to: '/group/slug/featured-slot-machine-group?sildebar=1', icon: 'star', cat: 'featured' }
]
