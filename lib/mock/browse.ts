import { MOCK_PROVIDERS } from './providers'
// browse 组 mock：赌场分类、供应商（多语言一律 translations: { zh, en }）。游戏与横幅仍用 lib/mock/data.ts。

// 首页空投奖池金额（字符串，不用 number）
export const MOCK_AIRDROP_AMOUNT = '11448.96'
export const MOCK_CATEGORIES = [
  { key: 'slots', translations: { zh: { name: '老虎机' }, en: { name: 'Slots' } } },
  { key: 'live', translations: { zh: { name: '真人视讯' }, en: { name: 'Live Casino' } } },
  { key: 'crash', translations: { zh: { name: '爆倍游戏' }, en: { name: 'Crash' } } },
  { key: 'sports', translations: { zh: { name: '体育投注' }, en: { name: 'Sports' } } }
]

/** 供应商名（与参考站同一批，见 providers.ts） */
export const MOCK_PROVIDER_NAMES = MOCK_PROVIDERS.map((p) => p.name)
export const providerLogo = (name: string) => MOCK_PROVIDERS.find((p) => p.name === name)?.logo ?? ''

/** 供应商 slug（路由用）：小写，空格换连字符 */
export const providerSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
