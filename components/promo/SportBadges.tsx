// 体育页的自绘小图标（占位图标，之后可换成真实的联赛 / 球队图标）：
// SportChip 项目图标（取自 SportIcons）、LeagueIcon 联赛盾牌（按序号换色）、TeamCrest 球队徽章（主客队、序号决定配色与图案）。
import SportSvg, { SPORT_ICONS } from '@/components/promo/SportIcons'

/** 项目图标：按路径 slug（如 soccer-1）取，找不到用足球 */
export function SportChip({ slug, size = 18 }: { slug: string, size?: number }) {
  const icon = SPORT_ICONS.find((i) => i.path === `/${slug}`) ?? SPORT_ICONS.find((i) => i.key === 'soccer')!
  return <span className="sbadge" style={{ display: 'inline-flex', width: size, height: size, flex: 'none' }}><SportSvg icon={icon} size={size} /></span>
}

const LEAGUE_COLORS = ['#2f9e6b', '#3b82d6', '#d6803b', '#8b5cd6', '#d6455d', '#2fa7b8']

/** 联赛图标：小盾牌 + 星 */
export function LeagueIcon({ n, size = 16 }: { n: number, size?: number }) {
  const c = LEAGUE_COLORS[(n - 1 + LEAGUE_COLORS.length) % LEAGUE_COLORS.length]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none', display: 'block' }}>
      <path d="M12 2.5 4.5 5.500v6c0 4.500 3 8 7.500 10 4.500-2 7.500-5.500 7.500-10v-6Z" fill={c} stroke="rgba(0,0,0,.3)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="m12 7.500 1.400 2.900 3.100.4-2.300 2.100.6 3.100-2.800-1.600-2.800 1.600.6-3.100-2.300-2.100 3.100-.4Z" fill="#fff" opacity=".92" />
    </svg>
  )
}

const TEAM_COLORS: Array<[string, string]> = [
  ['#c0392b', '#f4d03f'], ['#2471a3', '#ecf0f1'], ['#1e8449', '#f9e79f'], ['#7d3c98', '#f5b7b1'],
  ['#d35400', '#1b2631'], ['#117a8b', '#fdfefe'], ['#34495e', '#f1c40f'], ['#a93226', '#ecf0f1']
]

/** 球队徽章：盾形底 + 条纹图案，主队 / 客队配色不同 */
export function TeamCrest({ n, away, size = 24 }: { n: number, away?: boolean, size?: number }) {
  const k = (n * 2 + (away ? 1 : 0)) % TEAM_COLORS.length
  const [c1, c2] = TEAM_COLORS[k]
  const id = `tc${k}-${size}`
  const pattern = k % 3
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: 'none', display: 'block' }}>
      <defs><clipPath id={id}><path d="M16 2.500 5 6.500v8c0 6.500 4.500 11.500 11 15 6.500-3.500 11-8.500 11-15v-8Z" /></clipPath></defs>
      <path d="M16 2.500 5 6.500v8c0 6.500 4.500 11.500 11 15 6.500-3.500 11-8.500 11-15v-8Z" fill={c1} />
      <g clipPath={`url(#${id})`}>
        {pattern === 0 ? <><rect x="12" y="0" width="8" height="32" fill={c2} /></> : null}
        {pattern === 1 ? <rect x="0" y="12" width="32" height="7" fill={c2} /> : null}
        {pattern === 2 ? <path d="M0 22 22 0h10L0 32Z" fill={c2} /> : null}
      </g>
      <path d="M16 2.500 5 6.500v8c0 6.500 4.500 11.500 11 15 6.500-3.500 11-8.500 11-15v-8Z" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="1.600" strokeLinejoin="round" />
      <circle cx="16" cy="9" r="2" fill="#fff" opacity=".9" />
    </svg>
  )
}
