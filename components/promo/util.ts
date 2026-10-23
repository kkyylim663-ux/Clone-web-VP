// 金额与通用小工具。金额一律字符串或整数分，不用浮点做累加；浮点只出现在「字符串 → 整数分」这一步（两位小数以内精确）。

/** 拼接 className，忽略假值 */
export const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(' ')

/** 金额字符串 → 整数分。输入为非负十进制数（最多 2 位小数，多出的四舍五入） */
export const toCents = (s: string): number => Math.round(Number(s) * 100)

/** 整数分 → 展示 "1,234.56" */
export function fmtCents(c: number): string {
  const sign = c < 0 ? '-' : ''
  const a = Math.abs(c)
  const int = Math.floor(a / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}${int}.${String(a % 100).padStart(2, '0')}`
}

/** 金额字符串直接展示（千分位 + 2 位小数），不做任何运算 */
export const fmtStr = (s: string): string => fmtCents(toCents(s))

/** 整数分 × 基点（万分比，500 = 5%）→ 整数分，四舍五入 */
export const mulBp = (cents: number, bp: number): number => Math.round((cents * bp) / 10000)

/** USDT 字符串 × 汇率（整数，4 位小数，40775 = 4.0775）→ MYR 整数分，四舍五入 */
export const usdtToMyrCents = (usdt: string, rateScaled: number): number => Math.round((toCents(usdt) * rateScaled) / 10000)
