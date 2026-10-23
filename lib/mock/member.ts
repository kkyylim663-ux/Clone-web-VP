// 会员中心规则与 mock 数据（接口在 app/api/web/member/**）。前端表单与接口共用这里的校验，前后端规则一致。
// 金额一律字符串；比较金额用整数「分」，不用浮点。校验函数返回错误码，界面用 t('member.err.<码>') 显示。
import { isEmail, isPhone } from './auth'
import type { Translations } from '@/lib/pickLang'

export const MEMBER_BALANCE = '0.00'
export const MEMBER_PROFILE = { nickname: 'Member', uid: '100001', level: 1, exp: 0, nextExp: 50, stats: { wins: '0.00', bets: '0.00', turnover: '0.00' } }

export const CHIP_CURRENCIES = ['MYR', 'USDT', 'USD', 'THB'] as const
export const DEFAULT_CHIP = 'MYR'
export const RESET_CHIP = 'USDT'

export const WALLET_CURRENCIES = ['MYR', 'USDT'] as const
export const WALLET_NETWORKS: Record<string, string[]> = { MYR: ['DuitNow', 'Bank Transfer'], USDT: ['TRC20', 'ERC20'] }
export const WALLET_LIMITS = { deposit: { min: 10, max: 50000 }, withdraw: { min: 30, max: 20000 } } as const
export const QUICK_AMOUNTS = ['10', '30', '50', '100', '300', '500', '1000', '3000']
export const AVATAR_COUNT = 8
export const ID_TYPES = ['nric', 'passport', 'driver'] as const
export const MEMBER_PW_MIN = 8
export const UPLOAD_MAX = 5 * 1024 * 1024
export const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'application/pdf']

const AMOUNT_RE = /^\d+(\.\d{1,2})?$/
const toCents = (v: string) => { const [i, f = ''] = v.split('.'); return Number(i) * 100 + Number((f + '00').slice(0, 2)) }

/** 金额校验：格式（最多两位小数）→ 下限 → 上限；返回错误码或 null */
export function checkAmount(v: string, min: number, max: number): string | null {
  if (!AMOUNT_RE.test(v)) return 'amountFormat'
  const c = toCents(v)
  if (c < min * 100) return 'amountMin'
  if (c > max * 100) return 'amountMax'
  return null
}

/** 新密码规则：至少 8 位，同时含字母与数字 */
export const checkPassword = (v: string) => v.length >= MEMBER_PW_MIN && /[A-Za-z]/.test(v) && /\d/.test(v)

/** 上传框校验：类型（png/jpg/pdf）与大小（≤5MB） */
export function checkUpload(type: string, size: number): string | null {
  if (!UPLOAD_TYPES.includes(type)) return 'fileType'
  if (size > UPLOAD_MAX) return 'fileSize'
  return null
}

const age = (d: string) => (Date.now() - Date.parse(d)) / 31557600000

/** KYC Level 1 校验：返回 字段 → 错误码 */
export function checkKyc1(f: Record<string, string>): Record<string, string> {
  const e: Record<string, string> = {}
  for (const k of ['firstName', 'lastName', 'dob', 'country', 'city', 'postal', 'address', 'phone', 'email', 'idNumber', 'idValid']) if (!f[k]?.trim()) e[k] = 'required'
  if (f.phone && !e.phone && !isPhone(f.phone)) e.phone = 'phone'
  if (f.email && !isEmail(f.email)) e.email = 'email'
  if (f.postal && !e.postal && !/^\d{4,10}$/.test(f.postal)) e.postal = 'postal'
  if (f.idNumber && !/^[A-Za-z0-9-]{6,20}$/.test(f.idNumber)) e.idNumber = 'idNumber'
  if (f.dob && !e.dob && (Number.isNaN(Date.parse(f.dob)) || age(f.dob) < 18)) e.dob = 'dob'
  return e
}

/** 提现 / 存款 / 存款凭证校验：kind = deposit | withdraw | proof */
export function checkWallet(kind: string, f: { currency?: string, network?: string, amount?: string, address?: string, txid?: string, name?: string }): Record<string, string> {
  const e: Record<string, string> = {}
  if (!WALLET_CURRENCIES.includes((f.currency ?? '') as never)) e.currency = 'required'
  if (f.network !== undefined && !(WALLET_NETWORKS[f.currency ?? ''] ?? []).includes(f.network)) e.network = 'required'
  const lim = kind === 'withdraw' ? WALLET_LIMITS.withdraw : WALLET_LIMITS.deposit
  const amountErr = checkAmount(f.amount ?? '', lim.min, lim.max)
  if (amountErr) e.amount = amountErr
  if (kind === 'withdraw') {
    const a = (f.address ?? '').trim()
    if (a.length < 10 || a.length > 100) e.address = 'address'
  }
  if (kind === 'proof') {
    if ((f.txid ?? '').trim().length < 10) e.txid = 'txid'
    if ((f.name ?? '').trim().length < 2) e.name = 'name'
  }
  return e
}

// ---- mock 列表数据（默认空态；?state=data 时接口返回样例）----
export const MOCK_SESSIONS = [
  { id: 's1', browser: 'Chrome · Windows', minutesAgo: 0, location: '—', ip: '***.***.***.***', status: 'current' },
  { id: 's2', browser: 'Safari · iOS', minutesAgo: 420, location: '—', ip: '***.***.***.***', status: 'removed' },
]
export const MOCK_BLACKLIST = [{ id: 'b1', name: 'user_***7' }, { id: 'b2', name: 'user_***2' }]
export const MOCK_BETS = [
  { id: 'r1', tab: 'casino', game: 'Sample Slot', amount: '10.00', result: '12.50', currency: 'MYR', minutesAgo: 90 },
  { id: 'r2', tab: 'casino', game: 'Sample Table', amount: '5.00', result: '0.00', currency: 'MYR', minutesAgo: 1500 },
]
export const MOCK_NOTIFICATIONS: { id: string, time: string, unread: boolean, translations: Translations<{ title: string, body: string }> }[] = [
  { id: 'n1', time: '2026-10-20', unread: true, translations: { zh: { title: '欢迎加入', body: '完成实名认证可解锁更多权益。' }, en: { title: 'Welcome', body: 'Complete KYC to unlock more benefits.' } } },
  { id: 'n2', time: '2026-10-18', unread: false, translations: { zh: { title: '登录提醒', body: '您的账号在新设备上登录。' }, en: { title: 'Login notice', body: 'Your account was signed in on a new device.' } } },
]
export const MOCK_RECORDS = [
  { id: 'w1', kind: 'deposit', currency: 'USDT', amount: '50.00', status: 'success', minutesAgo: 60 },
  { id: 'w2', kind: 'withdraw', currency: 'MYR', amount: '30.00', status: 'pending', minutesAgo: 300 },
  { id: 'w3', kind: 'deposit', currency: 'MYR', amount: '100.00', status: 'failed', minutesAgo: 2880 },
]
