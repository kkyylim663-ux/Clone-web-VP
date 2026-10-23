export interface CurrencyRatio { currency: string; currencyRealname: string; value: string }

/** 后端以 USDT 为基准，按汇率换算成显示币种；金额保持字符串，只在显示时截到 2 位 */
export function toDisplay(usdt: string | number, ratio: string | number, digits = 2): string {
  const n = Number(usdt) * Number(ratio)
  if (!Number.isFinite(n)) return (0).toFixed(digits)
  const f = 10 ** digits
  return (Math.trunc(n * f) / f).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
