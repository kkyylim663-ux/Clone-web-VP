import { PRIMARY_LANG, type Lang } from '@/config/languages'

/** 后端返回的多语言字段：{ zh: {...}, en: {...} }。与 BOSS 的 pickBannerTranslation 等同一规则 */
export type Translations<T> = Partial<Record<Lang, T>>

/** 取当前语言；没有就回退主语言 zh；再没有取第一项（空对象返回 undefined） */
export function pickLang<T>(all: Translations<T> | undefined | null, lang: string): T | undefined {
  if (!all) return undefined
  return (all as Record<string, T | undefined>)[lang] ?? all[PRIMARY_LANG] ?? Object.values(all)[0]
}
