// 体育图标（自绘线条图标，28×28 显示，24×24 视图框）。顺序与参考站工具栏一致：
// 首页 / 直播 / 收藏 / 我的投注 | 足球 / 电子足球 / 篮球 / 羽毛球 / 网球 / 乒乓球 / 冰球 / 综合格斗 / 电竞(英雄) / 板球 / 射击 / 瓦 / Dota / 拳击 / 赛车 / 电竞棋牌 / 排球
import type { ReactNode } from 'react'

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export interface SportIcon { key: string, path: string, node: ReactNode }

const ball = (extra: ReactNode) => (<><circle cx="12" cy="12" r="9" {...S} />{extra}</>)

export const SPORT_ICONS: SportIcon[] = [
  { key: 'home', path: '', node: <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h5v-5h3v5h5V10" {...S} /> },
  { key: 'live', path: '/live', node: <><rect x="2" y="7" width="20" height="10" rx="2.5" {...S} /><text x="12" y="14.6" textAnchor="middle" fontSize="6" fontWeight="700" fill="currentColor" stroke="none">LIVE</text></> },
  { key: 'star', path: '/favorites', node: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8Z" {...S} /> },
  { key: 'bets', path: '/bets', node: <><rect x="5" y="3.5" width="14" height="17" rx="2" {...S} /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" {...S} /></> },
  // 以下路径为参考站实测（点击工具栏各图标后的 bt-path）
  { key: 'soccer', path: '/soccer-1', node: ball(<><path d="m12 8 3.2 2.3-1.2 3.7h-4l-1.2-3.7Z" {...S} /><path d="M12 8V3.2M15.2 10.3l4.4-1.4M14 14l2.8 3.6M10 14l-2.8 3.6M8.8 10.3 4.4 8.9" {...S} /></>) },
  { key: 'esoccer', path: '/esoccer-300', node: ball(<><path d="m12 8 3.2 2.3-1.2 3.7h-4l-1.2-3.7Z" {...S} /><circle cx="18.5" cy="18.5" r="3" {...S} fill="#2b3447" /></>) },
  { key: 'basketball', path: '/basketball-2', node: ball(<><path d="M3 12h18M12 3v18M5.6 5.6c3.5 3 3.5 9.8 0 12.8M18.4 5.6c-3.5 3-3.5 9.8 0 12.8" {...S} /></>) },
  { key: 'cricket', path: '/cricket-21', node: <><path d="m6 19 9-9" {...S} /><path d="m13.5 4.5 6 6-3 3-6-6Z" {...S} /><circle cx="6" cy="6.5" r="1.8" {...S} /></> },
  { key: 'tennis', path: '/tennis-5', node: <><ellipse cx="14.5" cy="9.5" rx="6" ry="7" transform="rotate(40 14.5 9.5)" {...S} /><path d="m9.5 14.5-6 6M11 8l5 5M13 6l5 5" {...S} /></> },
  { key: 'baseball', path: '/baseball-3', node: ball(<><path d="M6 6c2.5 3 2.5 9 0 12M18 6c-2.5 3-2.5 9 0 12M7.5 9l-1.8.5M7.8 12H6M7.5 15l-1.8-.5M16.5 9l1.8.5M16.2 12H18M16.5 15l1.8-.5" {...S} /></>) },
  { key: 'boxing', path: '/boxing-10', node: <path d="M7 4.5h8a4 4 0 0 1 4 4V12a3 3 0 0 1-3 3h-1v5H8v-5H7a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3Z" {...S} /> },
  { key: 'mma', path: '/mixed-martial-arts-117', node: <text x="12" y="16" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="currentColor" stroke="none">MMA</text> },
  { key: 'football', path: '/american-football-16', node: <><ellipse cx="12" cy="12" rx="9.5" ry="6" transform="rotate(-35 12 12)" {...S} /><path d="m9.5 14.5 5-5M10.5 11.5l1.5 1.5M12.5 9.5 14 11" {...S} /></> },
  { key: 'icehockey', path: '/ice-hockey-4', node: <><path d="M5 3.5 13 18h6" {...S} /><ellipse cx="17" cy="20" rx="3.5" ry="1.5" {...S} /></> },
  { key: 'counterstrike', path: '/counter-strike-109', node: <path d="M9 3.5 11 8l-2 3 4 3.5-1.5 6.5M11 8h5.5" {...S} /> },
  { key: 'valorant', path: '/valorant-194', node: <path d="M3 5.5 11 18.5l1.5-3L8 5.5ZM13.5 5.5 21 5.5 12 18.5Z" {...S} /> },
  { key: 'dota', path: '/dota-2-111', node: <path d="M4 4.5 19 19.5M8.5 4.5 19.5 15.5M4 9 15 20" {...S} /> },
  { key: 'chess', path: '/chess-33', node: <><path d="M9 20h6M10 20c0-3 .5-4.5 2-6-2-1-3-2.600-3-4.500 0-2.200 1.500-3.500 3-3.500s3 1.300 3 3.500c0 1.900-1 3.500-3 4.500 1.500 1.500 2 3 2 6" {...S} /><path d="M10.500 4h3" {...S} /></> },
  { key: 'f1', path: '/formula-1-40', node: <><path d="M5 4v16" {...S} /><path d="M5 5h14v9H5M9.5 5v9M14.5 5v9M5 9.5h14" {...S} /></> },
  { key: 'ehorse', path: '/ehorse-racing-315', node: <><path d="M6 20V9l5-5 3 3-2 2 4 2v9M11 4 9 2" {...S} /><path d="M12 11l-2 3" {...S} /></> },
  { key: 'volleyball', path: '/volleyball-23', node: ball(<><path d="M3.5 9c5-1 9 1.5 11 6M20.5 9.5c-4-2-8-1.5-11.5 2M8 20c0-5 3-8.5 8-9.5" {...S} /></>) }
]

export default function SportSvg({ icon, size = 28 }: { icon: SportIcon, size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{icon.node}</svg>
}
