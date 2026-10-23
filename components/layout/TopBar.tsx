'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import SearchModal from '@/components/layout/SearchModal'
import { brand } from '@/config/brand'
import { SUPPORTED_LANGS } from '@/config/languages'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useLayout } from '@/context/LayoutContext'
import UserMenu from '@/components/layout/UserMenu'
import { useGate } from '@/lib/useGate'
import Icon from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icon-paths'

// 网页胶囊导航：首页 / 赌场 / 体育（来源：文档 clicks-public 1280:2 跳转 /、1280:4 跳转 /sports；赌场 1280:3 参考为"无反应"，不采用，沿用链接，推断）
const caps: { to: string, k: string, icon: IconName }[] = [
  { to: '/', k: 'base.nav.home', icon: 'home' },
  { to: '/casino', k: 'base.nav.casino', icon: 'casino' },
  { to: '/sports', k: 'base.nav.sports', icon: 'sports' },
]

export default function TopBar() {
  const pathname = usePathname()
  const { lang, setLang, t } = useLanguage()
  const { loggedIn } = useAuth()
  const { setWalletOpen, sideCollapsed, setSideCollapsed } = useLayout()
  const { guard } = useGate()
  const [searchOpen, setSearchOpen] = useState(false)

  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/'))
  // 语言循环切换（推断：参考站语言下拉未观察到，保留现有循环切换）
  const cycleLocale = () => {
    const i = SUPPORTED_LANGS.indexOf(lang)
    setLang(SUPPORTED_LANGS[(i + 1) % SUPPORTED_LANGS.length])
  }

  return (
    <header className="top">
      <div className="l">
        {/* 菜单键：仅网页显示；参考站 1280:0 点击无反应（来源：文档 clicks-public），本站同为无动作 */}
        <button className="menu mo-hover" aria-label="menu" aria-expanded={!sideCollapsed} onClick={() => setSideCollapsed(!sideCollapsed)}><Icon name="menu" size={20} /></button>
        <Link href="/" className="layout_topbar__logo">{brand.name}</Link>
        <nav className="caps" aria-label="sections">
          {caps.map((c) => {
            const on = isActive(c.to)
            return (
              <Link key={c.to} href={c.to} className={`layout_topbar__cap${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
                <i><Icon name={c.icon} size={16} solid /></i>{t(c.k)}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="r">
        {/* 搜索：参考站 1280:5 打开 Providers 弹窗（未实现），本站先保留到搜索页（推断） */}
        <Link href="/casino/search2" className="layout_topbar__ico mo-hover" aria-label="search" onClick={(e) => { if (window.innerWidth >= 768) { e.preventDefault(); setSearchOpen(true) } }}><Icon name="search" size={20} /></Link>
        <button className="layout_topbar__ico mo-hover" aria-label="language" onClick={cycleLocale}><Icon name="language" size={20} /></button>
        {loggedIn ? (
          <>
            {/* 钱包「+」：已登录开钱包面板，未登录去登录（来源：文档 handlers-static §2 钱包守卫） */}
            <button className="chip" onClick={() => guard('wallet', () => setWalletOpen(true))}>0.00 <b aria-hidden="true"><svg viewBox="0 0 16 16" width="12" height="12"><path d="M8 3v10M3 8h10" /></svg></b></button>
            <Link href="/notifications" className="layout_topbar__ico mo-hover" aria-label="notifications"><Icon name="bell" size={20} /></Link>
            <UserMenu />
          </>
        ) : (
          /* 未登录：Sign In / Register 带 page=header（来源：文档 handlers-static §5） */
          <>
            <Link href="/login?page=header" className="layout_topbar__btn layout_topbar__ghost">{t('base.shell.signIn')}</Link>
            <Link href="/register?page=header" className="layout_topbar__btn layout_topbar__solid">{t('base.shell.register')}</Link>
          </>
        )}
      </div>

      <style jsx>{`
        /* 手机（<768）默认：顶栏 56px，左 Logo + 右按钮；不吸顶变化（文档：滚动后顶栏无变化） */
        .top { position: sticky; top: 0; z-index: 30; height: 56px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 0 8px 0 12px; background: #1a1a21; }
        .l, .r { display: flex; align-items: center; min-width: 0; }
        :global(.layout_topbar__logo) { display: inline-flex; align-items: center; justify-content: center; height: 28px; padding: 0 10px; box-sizing: border-box; border: 1px dashed var(--vp-primary); border-radius: 6px; color: var(--vp-primary); font-size: 13px; font-weight: 800; letter-spacing: .08em; text-decoration: none; }
        .menu, .caps, :global(.layout_topbar__ico), :global(.layout_topbar__avatar) { display: none; }
        .chip { height: 32px; padding: 0 10px; border: 0; border-radius: 8px; background: var(--vp-card); color: var(--vp-text); font-size: 13px; font-family: inherit; cursor: pointer; }
        /* 「+」立体按钮：上亮下暗的渐变球面 + 顶部高光 + 底部厚度 + 绿色外光；按下时下沉 */
        .chip b { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; margin-left: 4px; vertical-align: middle; border-radius: 50%; background: radial-gradient(circle at 50% 22%, #b6ffd6 0%, #5afa8c 38%, #14c45c 100%); color: #06311a; box-shadow: inset 0 1px 1px rgba(255, 255, 255, .85), inset 0 -2px 2px rgba(0, 90, 40, .55), 0 2px 0 #0a7a3a, 0 0 8px rgba(90, 250, 104, .55); transition: transform .12s ease, box-shadow .12s ease; }
        .chip b svg { display: block; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; filter: drop-shadow(0 1px 0 rgba(255, 255, 255, .55)); }
        .chip:hover b { box-shadow: inset 0 1px 1px rgba(255, 255, 255, .9), inset 0 -2px 2px rgba(0, 90, 40, .55), 0 2px 0 #0a7a3a, 0 0 12px rgba(90, 250, 104, .8); }
        .chip:active b { transform: translateY(2px); box-shadow: inset 0 1px 1px rgba(255, 255, 255, .7), inset 0 -1px 2px rgba(0, 90, 40, .55), 0 0 0 #0a7a3a, 0 0 6px rgba(90, 250, 104, .45); }
        :global(.layout_topbar__btn) { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; width: 76px; height: 32px; border: 1px solid var(--vp-primary); border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; }
        :global(.layout_topbar__btn.layout_topbar__ghost) { background: transparent; color: var(--vp-primary); }
        :global(.layout_topbar__btn.layout_topbar__solid) { margin-left: 8px; background: var(--vp-grad); color: var(--vp-on-primary); }
        /* 立体感：上缘高光、下缘暗边、外发光；悬停上浮，按下回落 */
        :global(.layout_topbar__btn) { transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
        :global(.layout_topbar__btn.layout_topbar__ghost) { background: linear-gradient(180deg, rgba(94, 255, 172, .16), rgba(94, 255, 172, .04)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .18), inset 0 -2px 0 rgba(0, 0, 0, .25), 0 2px 8px rgba(0, 0, 0, .35); }
        :global(.layout_topbar__btn.layout_topbar__solid) { border-color: rgba(255, 255, 255, .35); background: linear-gradient(180deg, #8dffc4 0%, #5afa68 55%, #2fd45a 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .6), inset 0 -3px 0 rgba(0, 90, 40, .35), 0 4px 12px rgba(90, 250, 104, .35); }
        :global(.layout_topbar__btn:hover) { transform: translateY(-1px); filter: brightness(1.08); }
        :global(.layout_topbar__btn:active) { transform: translateY(1px); filter: brightness(.95); }
        :global(.layout_topbar__cap):focus-visible, :global(.layout_topbar__ico):focus-visible, :global(.layout_topbar__btn):focus-visible, :global(.layout_topbar__logo):focus-visible, .chip:focus-visible { outline: 2px solid var(--vp-primary); outline-offset: 2px; }

        /* 网页（≥768）：顶栏 60px，左菜单键 + Logo + 胶囊导航，右搜索/语言/登录键 */
        @media (min-width: 768px) {
          .top { height: 60px; padding: 0 16px; background: rgba(26, 26, 27, .65); border-bottom: 1px solid rgba(255, 255, 255, .1); backdrop-filter: blur(12px); }
          .menu { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 0; border-radius: 8px; background: rgba(255, 255, 255, .08); color: var(--vp-text); font-size: 18px; cursor: pointer; }
          :global(.layout_topbar__logo) { width: 96px; height: 32px; margin-left: 28px; }
          .caps { display: flex; margin-left: 76px; }
          :global(.layout_topbar__cap) { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 16px; box-sizing: border-box; border-radius: 10px; color: var(--vp-muted); font-size: 14px; font-weight: 600; text-decoration: none; }
          :global(.layout_topbar__cap) + :global(.layout_topbar__cap) { margin-left: 8px; }
          :global(.layout_topbar__cap).on { background: rgba(255, 255, 255, .1); color: var(--vp-text); }
          :global(.layout_topbar__cap) i { display: inline-flex; width: 16px; font-style: normal; }
          :global(.layout_topbar__cap).on i { color: var(--fx-mint); filter: drop-shadow(0 0 5px rgba(var(--fx-mint-rgb), .6)); }
          .r { margin-left: auto; }
          :global(.layout_topbar__ico) { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 0; border-radius: 8px; background: rgba(255, 255, 255, .08); color: var(--vp-text); font-size: 18px; text-decoration: none; cursor: pointer; }
          /* 图标按钮 hover：背景过渡 var(--mo-hover)；hover 底色为推断值（参考站只测到过渡时长） */
          .menu:hover, :global(.layout_topbar__ico):hover { background: rgba(255, 255, 255, .14); }
          :global(.layout_topbar__ico) + :global(.layout_topbar__ico) { margin-left: 12px; }
          :global(.layout_topbar__avatar) { display: block; width: 40px; height: 40px; margin-left: 12px; border-radius: 50%; background: rgba(255, 255, 255, .12); }
          .chip { height: 40px; padding: 0 14px; border-radius: 12px; font-size: 14px; font-weight: 700; }
          .chip b { width: 24px; height: 24px; margin-left: 8px; }
          .chip b svg { width: 14px; height: 14px; }
          .chip { margin-left: 12px; }
          :global(.layout_topbar__btn) { width: 96px; height: 40px; border-radius: 12px; font-size: 14px; font-weight: 600; }
          :global(.layout_topbar__btn.layout_topbar__ghost) { margin-left: 12px; }
          :global(.layout_topbar__btn.layout_topbar__solid) { margin-left: 8px; font-weight: 700; }
        }
        /* 768 到 1099：窄网页放不下完整顶栏，隐去 Logo 位并收紧胶囊导航左距 */
        @media (min-width: 768px) and (max-width: 1099px) {
          :global(.layout_topbar__logo) { display: none; }
          .caps { margin-left: 16px; }
        }
      `}</style>
      {searchOpen ? <SearchModal onClose={() => setSearchOpen(false)} /> : null}
    </header>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
