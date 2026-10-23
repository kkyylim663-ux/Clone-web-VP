'use client'
// 会员中心共用件：?state 解析、外壳 MemberFrame（对应 Nuxt MemberFrame.vue）、mock 接口查询、表单字段与按钮。
import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { navReplace } from '@/lib/navProgress'
import MemberIcon from '@/components/layout/MemberIcons'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { fetchCached, peek } from '@/lib/queryCache'

/** ?state= 演示参数（guest | member | loading | empty | error | invalid | submitting | data）+ 登录态 */
export function useMemberState() {
  const sp = useSearchParams()
  const { loggedIn } = useAuth()
  const st = sp.get('state') ?? ''
  // 与 Nuxt MemberFrame 同规则：state=member 视为登录；state=guest 视为未登录；其余跟随登录态
  const member = st === 'member' || (st !== 'guest' && loggedIn)
  return { st, member }
}

/** 列表型接口：挂载时取一次；demo 参数把 ?state=data 传给 mock，决定返回样例还是空列表 */
export function useMemberQuery<T>(path: string, body: Record<string, unknown>, enabled: boolean) {
  // 有缓存先显示上次结果，后台再取新的（缓存在退出登录时清空）
  const [data, setData] = useState<T | null>(() => (enabled ? peek<T>(path, body) ?? null : null))
  const [failed, setFailed] = useState(false)
  const [rev, setRev] = useState(0)
  const key = JSON.stringify(body)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchCached<T>(path, JSON.parse(key) as Record<string, unknown>)
      .then((d) => { if (alive) { setData(d); setFailed(false) } })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [path, key, enabled, rev])
  return { data, failed, reload: () => setRev((n) => n + 1) }
}

/** 接口错误码 → 文案（前端错误与接口错误统一走这里） */
export function useErrText() {
  const { t } = useLanguage()
  return (code: number | string) => {
    const map: Record<string, string> = { '1001': 'member.err.wrongPassword', '1002': 'member.err.invalid', '1011': 'member.err.insufficient' }
    return t(map[String(code)] ?? 'member.err.generic')
  }
}

/** 错误码（checkXxx 的返回值）→ 文案 */
export function useFieldText() {
  const { t } = useLanguage()
  return (code: string | undefined, vars?: Record<string, string | number>) => (code ? t(`member.err.${code}`, vars) : undefined)
}

const PERSONAL = [
  { k: 'account', to: '/verify' }, { k: 'security', to: '/security' }, { k: 'kyc', to: '/kyc' }, { k: 'bets', to: '/bets' },
  { k: 'sessions', to: '/sessions' }, { k: 'ignored', to: '/blacklist' }, { k: 'preferences', to: '/preferences' }
]

export function MemberFrame({ title, children }: { title: string, children: ReactNode }) {
  const { t } = useLanguage()
  const { back, enterLogin } = useGate()
  const router = useRouter()
  const { member } = useMemberState()
  const pathname = usePathname()
  const personal = member && PERSONAL.some((p) => p.to === pathname)
  return (
    <div className={`mf${personal ? ' pe' : ''}`}>
      {personal ? <h2 className="pe-t">{t('member.personal.title')}</h2> : null}
      {personal ? (
        <nav className="pe-nav">
          {PERSONAL.map((p) => (
            <Link key={p.k} href={p.to} className={p.to === pathname ? 'on' : ''}><MemberIcon k={p.k} />{t(`base.userMenu.${p.k}`)}</Link>
          ))}
        </nav>
      ) : null}
      <section className="mf-sheet">
        <header className="mf-bar">
          <span className="mf-back" role="button" tabIndex={0} aria-label={t('member.frame.back')} onClick={() => back()}>‹</span>
          <h1>{title}</h1>
          {/* 关闭（×，仅网页端）→ 首页 replace（来源：文档 handlers-static §3，navBar customizeClose 默认 replace HOME） */}
          <span className="mf-close" role="button" tabIndex={0} aria-label={t('member.frame.close')} onClick={() => navReplace(router, '/')}>×</span>
        </header>
        <div className="mf-body">
          {!member ? (
            <div className="mf-gate">
              <p>{t('member.frame.gate')}</p>
              <button type="button" className="mf-login" onClick={() => enterLogin('sidebar')}>{t('member.frame.login')}</button>
            </div>
          ) : children}
        </div>
      </section>

      <style jsx>{`
        .mf { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; }
        .mf-bar { position: relative; display: flex; align-items: center; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .mf-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .mf-bar h1 { margin: 0 0 0 14px; font-size: 16px; font-weight: 500; line-height: 22px; white-space: nowrap; }
        .mf-close { display: none; margin-left: auto; font-size: 24px; line-height: 1; color: #8d8d92; cursor: pointer; }
        .mf-body { box-sizing: border-box; }
        .mf-gate { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 16px; color: #8d8d92; text-align: center; }
        .mf-gate p { margin: 0; }
        .mf-login { padding: 8px 20px; border: 0; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); cursor: pointer; }
        /* 网页 1280：居中 375 宽弹窗（外层遮罩为暗色） */
        @media (min-width: 768px) {
          .mf { min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding-top: 16px; box-sizing: border-box; background: rgba(0, 0, 0, 0.5); }
          .mf-sheet { width: 375px; max-height: 768px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; border-radius: 20px; background: #1a1a21; box-sizing: border-box; }
          .mf-sheet::-webkit-scrollbar { display: none; }
          .mf-bar { height: 57px; }
          .mf-bar h1 { position: absolute; left: 50%; transform: translateX(-50%); margin: 0; font-size: 20px; font-weight: 500; }
          .mf-back { display: none; }
          .mf-close { display: block; }
          .mf-bar .mf-close { position: absolute; right: 16px; }
        }
        .pe-nav, .pe-t { display: none; }
        @media (min-width: 768px) {
          .mf.pe { display: grid; grid-template-columns: 300px minmax(0, 1fr); grid-template-areas: 't t' 'n c'; column-gap: 20px; min-height: 0; padding: 20px 20px 40px; background: transparent; align-items: start; }
          .pe .pe-t { display: block; grid-area: t; margin: 0 0 24px; font-size: 28px; }
          .pe .pe-nav { grid-area: n; display: flex; flex-direction: column; gap: 10px; padding: 20px 10px; border-radius: 28px; background: #262932; border: 1px solid #3a3d4a; }
          .pe .pe-nav :global(a) { display: flex; align-items: center; gap: 14px; height: 50px; padding: 0 12px; border-radius: 10px; color: #c9cdd8; font-size: 16px; font-weight: 600; text-decoration: none; }
          .pe .pe-nav :global(a.on) { background: #353846; color: #fff; box-shadow: inset 3px 0 0 var(--vp-primary, #05f26a); }
          .pe .mf-sheet { grid-area: c; width: auto; max-height: none; overflow: visible; background: transparent; }
          .pe .mf-bar { display: none; }
        }
      `}</style>
      {/* 个人页内的输入框：更深的底色 + 清晰描边，和卡片底色分开（子组件里的元素，用全局样式） */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .pe .m-inp, .pe select, .pe input[type='date'] { background: #14151b; border: 1px solid #3f4351; color: #fff; }
          .pe .m-inp:focus { border-color: var(--vp-primary, #05f26a); box-shadow: none; }
          .pe .m-inp.err { border-color: #f87171; box-shadow: none; }
          .pe .m-inp:disabled { background: #1c1e26; }
        }
      `}</style>
    </div>
  )
}

/** 带标签的字段：标签 + 控件 + 错误文字（错误为空则不占位） */
export function Field({ label, error, children, className }: { label: string, error?: string, children: ReactNode, className?: string }) {
  return (
    <label className={`fd ${className ?? ''}`}>
      <span className="fd-l">{label}</span>
      {children}
      {error ? <span className="fd-e" role="alert">{error}</span> : null}
      <style jsx>{`
        .fd { position: relative; display: flex; flex-direction: column; gap: 6px; min-width: 0; color: #c4c8d0; font-size: 12px; }
        .fd-l { color: #8d8d92; }
        .fd-e { color: #f87171; font-size: 12px; }
      `}</style>
    </label>
  )
}

/** 会员页通用输入框样式（全局类，表单共用） */
export const inputClass = (err?: string) => `m-inp${err ? ' err' : ''}`

export function MemberInputStyles() {
  return (
    <style jsx global>{`
      .m-inp { width: 100%; height: 44px; box-sizing: border-box; padding: 0 12px; border: 0; border-radius: 8px; background: #2a2d33; color: #fff; font-size: 14px; outline: none; }
      .m-inp:focus { box-shadow: inset 0 0 0 1px var(--vp-primary, var(--vp-primary)); }
      .m-inp.err { box-shadow: inset 0 0 0 1px #f87171; }
      .m-inp:disabled { opacity: .5; }
      .m-btn { display: flex; align-items: center; justify-content: center; width: 100%; height: 44px; border: 0; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); font-size: 16px; font-weight: 500; cursor: pointer; }
      .m-btn:disabled { opacity: .6; cursor: default; }
    `}</style>
  )
}

/** 空态 / 错误 / 加载 三态的统一出口：返回 null 表示按正常内容渲染 */
export function useDemoState(st: string, failed: boolean, loading: boolean): 'loading' | 'error' | 'empty' | null {
  if (st === 'loading' || (loading && !failed && st === '')) return 'loading'
  if (st === 'error' || failed) return 'error'
  if (st === 'empty') return 'empty'
  return null
}

/** 相对时间（分钟 → 文案）：刚刚 / N 分钟前 / N 小时前 / N 天前 */
export function useAgo() {
  const { t } = useLanguage()
  return (m: number) => (m < 1 ? t('member.time.now') : m < 60 ? t('member.time.minutes', { n: Math.floor(m) }) : m < 1440 ? t('member.time.hours', { n: Math.floor(m / 60) }) : t('member.time.days', { n: Math.floor(m / 1440) }))
}
