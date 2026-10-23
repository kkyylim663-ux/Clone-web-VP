// 手机「bare 整屏页」路径表（对应 Nuxt 各页 definePageMeta({ shell: 'bare' })，共 39 个页面）。
// 来源：vp-web/app/pages 中含 shell: 'bare' 的页面（Nuxt 路径 → Next 路径）：
//  - 精确匹配：下表全部路径。jackpot 系列按参考站真实路径写连字符（/jackpot-detail 而非 /jackpot/detail）。
//  - 前缀匹配：动态路由 /casino/games/[slug]、/group/[slugType]/[slug]。
const BARE_EXACT = new Set<string>([
  '/bets', '/blacklist', '/bonus/details', '/casino/search', '/casino/search2', '/chat', '/chip-currency', '/edit-avater',
  '/forgot', '/freeSpin', '/jackpot', '/jackpot-detail', '/jackpot-share', '/jackpot-mybouns',
  '/jackpot-attached', '/jackpot-invited', '/kyc', '/language', '/login', '/notifications', '/preferences',
  '/privacy-policy', '/promotion', '/providers', '/refer-earn-calc', '/refer-earn-lock-bonus', '/refer-earn',
  '/register', '/sessions', '/site-map', '/sports-betting', '/sports-betting/record', '/terms-and-conditions',
  '/update-password', '/security', '/user', '/verify', '/vip', '/wallet-deposit-submit',
  // 参考站 router.getRoutes() 补充（docs/audit/opus-review.md §1，手机整屏页）
  '/game-list', '/bonus/detail', '/chat/subpage', '/jackpot-game-share',
])
const BARE_PREFIX = ['/casino/games/', '/group/']

/** 当前路径是否为 bare 页（手机隐藏顶栏/下载条/底部 tab/客服按钮，无内边距，隐藏页脚） */
export function isBare(pathname: string): boolean {
  // 去掉末尾斜杠（/login/ 与 /login 视为同一页），根路径 / 保持不变
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return BARE_EXACT.has(p) || BARE_PREFIX.some((x) => p.startsWith(x))
}
