// 邀请奖励计算器（纯函数）。公式与实测见 docs/logic-map.md §3：
//   奖金 = 存款 × 存款比例 + 投注 × 投注比例 + 里程碑（取已达到的最高一档的累计值）
// 全部用整数分计算；比例为基点（500 = 5%）。配置来自 /api/web/promo/calcConfig。
import { mulBp, toCents, usdtToMyrCents } from './util'

export interface CalcConfig {
  rateScaled: number
  milestones: { betCents: number, usdt: string }[]
  rates: Record<string, Record<string, { depositBp: number, betBp: number }>>
}

export interface CalcInput { level: string, category: string, deposit: string, bet: string }

/** 每一项都是整数分 */
export interface CalcResult { deposit: number, bet: number, milestone: number, total: number }

const AMOUNT_RE = /^\d+(\.\d{1,2})?$/

/** 金额输入校验：非负数，最多两位小数 */
export const isAmount = (s: string): boolean => AMOUNT_RE.test(s.trim())

export function calcReferral(input: CalcInput, cfg: CalcConfig): CalcResult | null {
  if (!isAmount(input.deposit) || !isAmount(input.bet)) return null
  const rate = cfg.rates[input.category]?.[input.level]
  if (!rate) return null
  const depCents = toCents(input.deposit.trim())
  const betCents = toCents(input.bet.trim())
  const deposit = mulBp(depCents, rate.depositBp)
  const bet = mulBp(betCents, rate.betBp)
  // 里程碑：投注门槛已达到的各档中取最大值（累计值随门槛递增，等价于取最高一档）
  const milestone = cfg.milestones
    .filter((m) => betCents >= m.betCents)
    .reduce((max, m) => Math.max(max, usdtToMyrCents(m.usdt, cfg.rateScaled)), 0)
  return { deposit, bet, milestone, total: deposit + bet + milestone }
}
