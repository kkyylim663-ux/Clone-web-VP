'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { LANG_COOKIE, PRIMARY_LANG, isLang, type Lang } from '@/config/languages'
import zhBase from '@/locales/zh/base.json'
import zhAuth from '@/locales/zh/auth.json'
import zhBrowse from '@/locales/zh/browse.json'
import zhPromo from '@/locales/zh/promo.json'
import zhMember from '@/locales/zh/member.json'
import enBase from '@/locales/en/base.json'
import enAuth from '@/locales/en/auth.json'
import enBrowse from '@/locales/en/browse.json'
import enPromo from '@/locales/en/promo.json'
import enMember from '@/locales/en/member.json'

// 与 BOSS 的 LanguageContext 同款：切换即时生效、网址不变、不刷新页面；记忆用 cookie（服务端首屏就能读到）。
type Dict = Record<string, unknown>
const DICTS: Record<Lang, Dict> = {
  zh: { ...zhBase, ...zhAuth, ...zhBrowse, ...zhPromo, ...zhMember },
  en: { ...enBase, ...enAuth, ...enBrowse, ...enPromo, ...enMember }
}

interface Ctx { lang: Lang, setLang: (l: Lang) => void, t: (key: string, vars?: Record<string, string | number>) => string }
const LanguageContext = createContext<Ctx | null>(null)

const lookup = (d: Dict, key: string): string | undefined => {
  let cur: unknown = d
  for (const k of key.split('.')) { if (cur && typeof cur === 'object' && k in (cur as Dict)) cur = (cur as Dict)[k]; else return undefined }
  return typeof cur === 'string' ? cur : undefined
}

export function LanguageProvider({ initial, children }: { initial: Lang, children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(isLang(initial) ? initial : PRIMARY_LANG)
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = l
  }, [])
  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    // 键缺失回退：当前语言 → 主语言 zh → 键名本身（开发时一眼看出缺哪条）
    let s = lookup(DICTS[lang], key) ?? lookup(DICTS[PRIMARY_LANG], key) ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }, [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const c = useContext(LanguageContext)
  if (!c) throw new Error('useLanguage must be used inside LanguageProvider')
  return c
}
/** 取文案：const t = useT(); t('nav.casino') */
export const useT = () => useLanguage().t
