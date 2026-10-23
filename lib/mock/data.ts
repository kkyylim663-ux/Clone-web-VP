// 假数据（对应 BOSS 的 lib/mock）。多语言内容一律 translations: { zh, en }；金额字符串。
export const ok = <T,>(data: T) => ({ code: 0, data })
export const fail = (code: number, message: string) => ({ code, message, data: null })

export const MOCK_USER = {
  id: '100000001', nickname: 'Player001', avatar: 'default', level: 0, exp: '0', nextExp: '50', currency: 'MYR',
  emailVerified: true, phoneVerified: false, kycLevel: 0
}

export const MOCK_BANNERS = [
  { id: 1, link: '/login', translations: { zh: { title: '新会员礼遇' }, en: { title: 'Welcome Offer' } } },
  { id: 2, link: '/bonus', translations: { zh: { title: '每日返水' }, en: { title: 'Daily Rebate' } } },
  { id: 3, link: '/jackpot', translations: { zh: { title: '奖池大奖' }, en: { title: 'Jackpot' } } },
  { id: 4, link: '/vip', translations: { zh: { title: 'VIP 俱乐部' }, en: { title: 'VIP Club' } } },
  { id: 5, link: '/refer-earn', translations: { zh: { title: '推荐赚佣金' }, en: { title: 'Refer & Earn' } } }
]

export const MOCK_PROMOTIONS = [
  { id: 1, category: 'daily', translations: { zh: { name: '每日返水', desc: '每天投注，次月 1 号领取更多返水' }, en: { name: 'Daily Rebate', desc: 'Wager every day, collect more on the 1st' } } },
  { id: 2, category: 'welcome', translations: { zh: { name: '新会员礼遇', desc: '首存即享礼金' }, en: { name: 'Welcome Offer', desc: 'Bonus on your first deposit' } } },
  { id: 3, category: 'spin', translations: { zh: { name: '免费旋转', desc: '轻松旋转赢大奖' }, en: { name: 'Free Spin', desc: 'Easy spin, easy win' } } },
  { id: 4, category: 'rescue', translations: { zh: { name: '亏损救援', desc: '投注亏损可申请救援金' }, en: { name: 'Loss Rescue', desc: 'Get rescue funds when you lose' } } }
]

const VIP_NEED = [0, 50, 500, 3000, 10000]
export const MOCK_VIP_LEVELS = VIP_NEED.map((n, i) => ({
  level: i, needExp: String(n),
  translations: { zh: { name: `VIP ${i}`, perks: ['每日提款额度', '流水返水'] }, en: { name: `VIP ${i}`, perks: ['Daily withdraw limit', 'Turnover rebate'] } }
}))

import { GAME_COVERS } from './gameCovers'
import { GAME_GROUPS } from './gameGroups'
import { GAME_NAMES } from './gameNames'
const CATS = ['slots', 'live', 'crash', 'sports']
// 游戏按供应商轮流排列（热门页混排）；封面见 gameCovers.ts，slug = <folder>-<序号>
const COVER_ROWS = Math.max(...GAME_COVERS.map((g) => g.files.length))
const gname = (g: { folder: string, provider: string, files: string[] }, r: number) => GAME_NAMES[`${g.folder}/${g.files[r]!.replace(/\.[a-z0-9]+$/, '')}`] ?? `${g.provider} ${r + 1}`
const BASE_GAMES = Array.from({ length: COVER_ROWS }, (_, r) => GAME_COVERS.filter((g) => g.files[r]).map((g) => ({ g, r }))).flat().map(({ g, r }, i) => ({
  id: i + 1, slug: `${g.folder}-${r + 1}`, provider: g.provider, category: CATS[i % 4]!,
  translations: { zh: { name: gname(g, r) }, en: { name: gname(g, r) } }
}))
// 分组游戏接在后面（捕鱼/迷你/桌面/精选/购买特色），category 即分组 key；热门页不含这些
export const MOCK_GAMES = [...BASE_GAMES, ...GAME_GROUPS.map((x, k) => ({
  id: BASE_GAMES.length + k + 1, slug: `${x.group}-${x.n}`, provider: x.provider, category: x.group,
  translations: { zh: { name: x.name }, en: { name: x.name } }
}))]

export const MOCK_WINS = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, nickname: `User${100 + i}`, amount: String((200 + i * 37) % 900), currency: 'MYR', gameId: (i % 60) + 1 }))
