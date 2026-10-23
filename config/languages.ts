// 语言契约（与 BOSS 一致，也与后端 ContentLanguages 一致）：
//  - 语言代码只有 zh / en，前后端同一套字符串，不做 zh-CN / en-US 之类的变体
//  - 后端内容按语言存翻译行，接口一次返回全部语言：translations: { zh: {...}, en: {...} }
//  - 前端自己挑：translations[lang] ?? translations.zh ?? 第一项（见 lib/pickLang.ts），切换语言不用重新请求
//  - 新增语言：这里 + 后端 ContentLanguages.SUPPORTED + 后台语言选项各加一个代码
export const SUPPORTED_LANGS = ['zh', 'en'] as const
export type Lang = (typeof SUPPORTED_LANGS)[number]
/** 默认语言，也是内容缺翻译时的回退（后端 ContentLanguages.PRIMARY） */
export const PRIMARY_LANG: Lang = 'zh'
/** 记住语言的 cookie 名（服务端读得到，首屏直接渲染对的语言，不闪） */
export const LANG_COOKIE = 'vp_lang'
export const SESSION_COOKIE = 'vp_session'
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(v)
