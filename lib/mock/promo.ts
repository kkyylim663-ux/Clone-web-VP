// 活动 / 奖金 / VIP / 奖池 / 推荐 / 体育 的假数据（对应 BOSS 的 lib/mock）。新增数据都写在这里，不改 lib/mock/data.ts。
// 多语言一律 translations: { zh, en }；金额一律字符串（不用浮点做钱）。
import type { Translations } from '@/lib/pickLang'

// ---------- 奖池 ----------
// roundStart / finishAt：本轮起止时刻（ISO 字符串）。页面用 roundStart 算进度条，用 finishAt 显示「结束于」
export interface JackpotPool { key: 'A' | 'B' | 'C'; boxes: 3 | 4; lines: 1 | 2; share: boolean; amount: string; endAt: number; roundStart: string; finishAt: string; translations: Translations<{ title: string }> }

/** 倒计时按周期滚动：A 每整点（时:分:秒），B/C 每日 UTC 零点（日:时:分:秒）。到点后前端重新拉取。 */
export function buildJackpotPools(now: number = Date.now()): JackpotPool[] {
  const HOUR = 3_600_000
  const DAY = 86_400_000
  const nextHour = (Math.floor(now / HOUR) + 1) * HOUR
  const nextDay = (Math.floor(now / DAY) + 1) * DAY
  const iso = (ms: number) => new Date(ms).toISOString()
  // boxes 统一为 4（参考站 json：每张卡 DAYS/HOURS/MINS/SECS 四格）
  return [
    { key: 'A', boxes: 4, lines: 2, share: false, amount: '12850.37', endAt: nextHour, roundStart: iso(nextHour - HOUR), finishAt: iso(nextHour), translations: { zh: { title: '每小时奖池' }, en: { title: 'Hourly Jackpot' } } },
    { key: 'B', boxes: 4, lines: 2, share: false, amount: '58210.90', endAt: nextDay, roundStart: iso(nextDay - DAY), finishAt: iso(nextDay), translations: { zh: { title: '每日大奖池' }, en: { title: 'Daily Mega Pool' } } },
    { key: 'C', boxes: 4, lines: 1, share: true, amount: '204331.55', endAt: nextDay, roundStart: iso(nextDay - DAY), finishAt: iso(nextDay), translations: { zh: { title: '周末超级奖池' }, en: { title: 'Weekend Super Pool' } } }
  ]
}

export const JACKPOT_WINNERS = [
  { id: 1, nickname: 'User218', amount: '1520.00' },
  { id: 2, nickname: 'User431', amount: '880.50' },
  { id: 3, nickname: 'User077', amount: '356.20' }
]

/** 奖池「我的参与」：默认空（参考站实测无数据） */
export const JACKPOT_MINE: unknown[] = []
/** 分享页相关活动：默认空（参考站实测默认「暂无数据」） */
export const JACKPOT_SHARE: unknown[] = []
/** 邀请奖池：默认已结束（参考站实测） */
export const JACKPOT_INVITED = { active: false, todayIndex: 0, amount: '0.00' }
/** 已参与奖池 */
export const JACKPOT_ATTACHED = { index: 3, amount: '1280.00' }

// ---------- VIP ----------
/** 升级奖金（USDT，字符串），下标即等级。1–5 级取自实测（1 / 2.5 / 5 / 25 / 50），见 docs/logic-map.md §2；6 级及以上为占位，未验证 */
export const VIP_BONUS_USDT = ['0', '1', '2.5', '5', '25']
/** 每月福利（USDT，字符串，下标即等级）。占位数据，待产品确认；页面按汇率折算成 MYR */
export const VIP_MONTHLY_USDT = ['0', '0.5', '1', '2', '5']
/** 等级名（轮播下方文字，下标即等级）。自写占位名，不是原站文案 */
export const VIP_TIER_NAMES: Translations<{ name: string }>[] = [
  { zh: { name: '青铜' }, en: { name: 'Bronze' } }, { zh: { name: '白银' }, en: { name: 'Silver' } },
  { zh: { name: '黄金' }, en: { name: 'Gold' } }, { zh: { name: '铂金' }, en: { name: 'Platinum' } },
  { zh: { name: '钻石' }, en: { name: 'Diamond' } }
]
/** 换算 MYR 用的汇率，整数存放（40775 = 4.0775），与 /api/web/currencyRatio/list 同值 */
export const MYR_RATE_SCALED = 40775

// ---------- 奖金 ----------
export interface BonusItem {
  id: number
  section: 'A' | 'B'
  variant: 'deposit' | 'single' | 'vip' | 'row' | 'refer'
  status: 'claimable' | 'claimed' | 'expired'
  amount: string
  icon: string // /assets 下的图标路径；每种奖金一张，避免重复
  translations: Translations<{ title: string, desc: string }>
}
export const BONUS_ITEMS: BonusItem[] = [
  { id: 1, section: 'A', variant: 'deposit', status: 'claimable', amount: '50.00', icon: '/assets/bonus/ico-1.webp', translations: { zh: { title: '首存礼金', desc: '首次存款后领取，最高 +50%' }, en: { title: 'First Deposit', desc: 'Claim after your first deposit, up to +50%' } } },
  { id: 2, section: 'A', variant: 'single', status: 'claimable', amount: '8.00', icon: '/assets/bonus/ico-2.webp', translations: { zh: { title: '每日返水', desc: '按昨日有效投注计算，次日发放' }, en: { title: 'Daily Rebate', desc: "Based on yesterday's valid wagers, paid next day" } } },
  { id: 3, section: 'B', variant: 'vip', status: 'claimable', amount: '2.50', icon: '/assets/bonus/ico-4.webp', translations: { zh: { title: 'VIP 升级礼金', desc: '每升一级即可领取一次' }, en: { title: 'VIP Level-up', desc: 'Claim once for every level you reach' } } },
  { id: 4, section: 'B', variant: 'row', status: 'claimable', amount: '5.00', icon: '/assets/bonus/ico-6.webp', translations: { zh: { title: '免费旋转', desc: '每天一次免费转盘机会' }, en: { title: 'Free Spins', desc: 'One free wheel spin every day' } } },
  { id: 5, section: 'B', variant: 'row', status: 'claimable', amount: '5.00', icon: '/assets/bonus/ico-7.webp', translations: { zh: { title: '周亏损救援', desc: '按每周净亏损返还，周一发放' }, en: { title: 'Loss Rescue', desc: 'Refund on weekly net losses, paid Monday' } } },
  { id: 6, section: 'B', variant: 'row', status: 'claimed', amount: '5.00', icon: '/assets/bonus/ico-8.webp', translations: { zh: { title: '每周返水', desc: '每周投注累计，周一统一结算' }, en: { title: 'Weekly Rebate', desc: 'Accrues over the week, settled Monday' } } },
  { id: 7, section: 'B', variant: 'row', status: 'expired', amount: '5.00', icon: '/assets/bonus/ico-5.webp', translations: { zh: { title: '空投奖励', desc: '活动期间随机发放，过期作废' }, en: { title: 'Airdrop Reward', desc: 'Dropped at random during events, expires' } } },
  { id: 10, section: 'B', variant: 'vip', status: 'claimable', amount: '10.00', icon: '/assets/vip/medal-4.webp', translations: { zh: { title: 'VIP 周奖金', desc: '每周一按 VIP 等级发放' }, en: { title: 'VIP Weekly', desc: 'Paid every Monday by VIP level' } } },
  { id: 11, section: 'B', variant: 'refer', status: 'claimable', amount: '0.00', icon: '/assets/refer/earn-2.webp', translations: { zh: { title: '推荐奖励', desc: '好友投注后按比例累计' }, en: { title: 'Referral Reward', desc: "Accrues from your friends' wagers" } } }
]

export const BONUS_DETAIL = {
  id: 1,
  amount: '50.00',
  status: 'claimable' as BonusItem['status'],
  translations: {
    zh: { title: '首存礼金', rules: ['首次存款满 100 即可领取', '奖金需完成 5 倍流水后可提现', '每位会员仅限一次'] },
    en: { title: 'First Deposit', rules: ['Deposit 100 or more to claim', 'Wager 5x the bonus before withdrawal', 'One claim per member'] }
  }
}

// ---------- 推荐赚钱 ----------
export const REFER_SUMMARY = {
  code: 'VP8829',
  claimable: '36.50',
  downlines: [
    { id: 1, nickname: 'Friend01', amount: '12.00' },
    { id: 2, nickname: 'Friend02', amount: '18.50' },
    { id: 3, nickname: 'Friend03', amount: '6.00' }
  ]
}
export const LOCK_BONUS = {
  locked: '128.00',
  rules: ['锁定奖金在好友完成首存后释放', '释放前不可提现', '每月 1 号结算一次'],
  rows: [
    { id: 1, status: 'locked' as 'locked' | 'released', amount: '48.00', translations: { zh: { title: 'Friend01 首存' }, en: { title: 'Friend01 first deposit' } } },
    { id: 2, status: 'locked' as 'locked' | 'released', amount: '80.00', translations: { zh: { title: 'Friend02 首存' }, en: { title: 'Friend02 first deposit' } } },
    { id: 3, status: 'released' as 'locked' | 'released', amount: '20.00', translations: { zh: { title: 'Friend03 首存' }, en: { title: 'Friend03 first deposit' } } }
  ]
}

/** 佣金计算器配置（docs/logic-map.md §3）。金额一律整数分；比例为基点（500 = 5%）。
 *  实测只在等级 9 + Slot 上做过：5% 存款、1% 投注、里程碑累计值。其余等级 / 类别沿用同值，标记为「未验证」。 */
export const CALC_CONFIG = {
  /** USDT → MYR 的汇率，整数存放（40771 = 4.0771）。观测值（45 USDT → 183.47，20 USDT → 81.54）与 4.0771 半入吻合；4.0775 会多出 0.02，待精确。 */
  rateScaled: 40771,
  categories: ['Slot', 'Live Casino', 'Sport'],
  /** 里程碑：投注门槛（分，MYR）→ 累计 USDT 奖励。达到哪一档取该档的累计值（不叠加）。 */
  milestones: [
    { betCents: 10000, usdt: '0.5' },
    { betCents: 100000, usdt: '3' },
    { betCents: 200000, usdt: '8' },
    { betCents: 500000, usdt: '20' },
    { betCents: 1000000, usdt: '45' },
    { betCents: 5000000, usdt: '95' }
  ],
  levels: Array.from({ length: 9 }, (_, i) => i + 1),
  /** rates[类别][等级] → 存款基点、投注基点。仅 Slot + 等级 9 实测，其余为占位 */
  rates: Object.fromEntries(['Slot', 'Live Casino', 'Sport'].map((c) => [c, Object.fromEntries(Array.from({ length: 9 }, (_, i) => [String(i + 1), { depositBp: 500, betBp: 100 }]))])) as Record<string, Record<string, { depositBp: number, betBp: number }>>
}

// ---------- 免费旋转 ----------
export const FREE_SPIN = { count: 2, list: [{ id: 1, title: '免费旋转 1' }, { id: 2, title: '免费旋转 2' }] }

// ---------- 锁定 / 记录 ----------
export const BET_RECORDS: unknown[] = []
