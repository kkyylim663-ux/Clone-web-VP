import type { Translations } from '@/lib/pickLang'

// 接口形状（mock 与真后端一致）：多语言字段 translations，金额字符串
export interface ApiUser { id: string, nickname: string, avatar: string, level: number, exp: string, nextExp: string, currency: string, emailVerified: boolean, phoneVerified: boolean, kycLevel: number, account?: string }
// turnover：有流水要求时才返回（done 已完成 / required 需完成），没有就不带这个字段
export interface ApiBalance { currency: string, available: string, turnover?: { done: string, required: string } }
export interface ApiAuthResult { token: string, user: ApiUser, balance: ApiBalance }
export interface ApiBanner { id: number, link: string, translations: Translations<{ title: string }> }
export interface ApiGame { id: number, slug: string, provider: string, category: string, translations: Translations<{ name: string }> }
export interface ApiWin { id: number, nickname: string, amount: string, currency: string, gameId: number }
export interface ApiHome { banners: ApiBanner[], popular: ApiGame[], wins: ApiWin[], online: number, airdropAmount?: string }
export interface ApiPromotion { id: number, category: string, translations: Translations<{ name: string, desc: string }> }
export interface ApiVipLevel { level: number, needExp: string, translations: Translations<{ name: string, perks: string[] }> }
export interface ApiJackpotGameShare { rank: number, amount: string, currency: string }
