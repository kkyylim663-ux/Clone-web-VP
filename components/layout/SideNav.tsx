'use client'
import { Fragment, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { casinoSub, sideGroups } from '@/data/nav'
import { SUPPORTED_LANGS } from '@/config/languages'
import { useLanguage } from '@/context/LanguageContext'
import LangToggle from '@/components/shared/LangToggle'
import { useLayout } from '@/context/LayoutContext'
import SkImg from '@/components/ui/SkImg'
import Icon from '@/components/ui/Icon'

export default function SideNav() {
  const pathname = usePathname()
  const { lang, setLang, t } = useLanguage()
  // 在线客服：与 SupportFab 共用同一弹窗状态（参考站此项打开外部客服，已拦截；改为站内客服弹窗占位，推断）
  const { setSupportOpen, sideCollapsed } = useLayout()

  // 赌场展开菜单：在赌场大厅 / 分类页默认展开，可手动收起
  const inCasino = pathname === '/casino' || pathname.startsWith('/group/slug/')
  const [casinoOpen, setCasinoOpen] = useState<boolean | null>(null)
  const open = casinoOpen ?? inCasino
  const subActive = (slug: string) => (slug === '' ? pathname === '/casino' : pathname === `/group/slug/${slug}`)

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')
  // 语言循环切换（推断：参考站语言下拉未观察到，保留现有循环切换）
  const cycleLocale = () => {
    const i = SUPPORTED_LANGS.indexOf(lang)
    setLang(SUPPORTED_LANGS[(i + 1) % SUPPORTED_LANGS.length])
  }

  return (
    <nav className={`side${sideCollapsed ? ' is-min' : ''}`} aria-label="main">
      <div className="list">
        {sideGroups.map((g, gi) => (
          <Fragment key={gi}>
            {gi > 0 && <hr className="sep" />}
            {/* 点击直接跳转（来源：文档 interactions.md 桌面 a；clicks-public 1280:10–18） */}
            {g.items.map((i) => {
              const on = isActive(i.to)
              if (i.to === '/casino') {
                return (
                  <div key={i.to} className={`cg${open && !sideCollapsed ? ' open' : ''}`}>
                    <Link href={i.to} className={`layout_sidenav__row mo-hover${inCasino ? ' on' : ''}`} onClick={(e) => { if (inCasino) { e.preventDefault(); setCasinoOpen(!open) } else setCasinoOpen(true) }}>
                      <span className="ic" aria-hidden="true"><Icon name={i.icon} solid /></span>
                      <span className="txt">{t(i.k)}</span>
                      <span className="tg" role="button" tabIndex={0} aria-label="toggle" aria-expanded={open} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCasinoOpen(!open) }}>
                        <svg className="tgi" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5.5 7 9.5l4-4" /></svg>
                      </span>
                    </Link>
                    {/* 始终渲染，用 grid 行高 0fr→1fr 做顺滑展开/收起 */}
                    {!sideCollapsed ? (
                      <div className="subw" aria-hidden={!open}>
                        <div className="sub">
                          {casinoSub.map((c) => (
                            <Link key={c.to} href={c.to} tabIndex={open ? 0 : -1} className={`layout_sidenav__row layout_sidenav__sub mo-hover${subActive(c.slug) ? ' on' : ''}`}>
                              <span className="ic2" aria-hidden="true"><Icon name={c.icon} size={16} solid /></span>
                              <span className="txt">{t(c.k)}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              }
              return (
                <Link key={i.to} href={i.to} className={`layout_sidenav__row mo-hover${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
                  <span className="ic" aria-hidden="true"><Icon name={i.icon} solid /></span>
                  <span className="txt">{t(i.k)}</span>
                  {i.badge ? <em className="badge">{i.badge}</em> : null}
                </Link>
              )
            })}
          </Fragment>
        ))}
      </div>

      <div className="foot">
        <div className="layout_sidenav__row mo-hover" role="button" tabIndex={0} onClick={cycleLocale} onKeyDown={(e) => { if (e.key === 'Enter') cycleLocale() }}>
          <span className="ic" aria-hidden="true"><Icon name="language" /></span>
          <span className="txt">{t('base.shell.language')}</span>
          <LangToggle className="layout_sidenav__flag" />
        </div>
        <button className="layout_sidenav__row mo-hover" onClick={() => setSupportOpen(true)}>
          <span className="ic" aria-hidden="true"><Icon name="support" /></span>
          <span className="txt">{t('base.shell.liveSupport')}</span>
          <span className="chev" aria-hidden="true"><Icon name="chevron-right" size={14} /></span>
        </button>
      </div>

      <style jsx>{`
        /* 网页侧栏：宽 240，顶 60（顶栏下方），内边距 16，项高 40 + 间距 4，选中块圆角 12 */
        .side { display: none; }
        @media (min-width: 768px) {
          .side { display: flex; flex-direction: column; flex: none; width: 240px; box-sizing: border-box; position: sticky; top: 60px; z-index: 5; background: var(--vp-bg); height: calc(100vh - 60px); height: calc(100dvh - 60px); padding: 16px; overflow-x: hidden; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; transition: width .3s cubic-bezier(.4, 0, .2, 1); }
          /* 收起：参考站 aside 宽 73（行 41×40 图标居中），内容区随 flex 重排 */
          .side.is-min { width: 73px; }
          .is-min .txt, .is-min .chev, .is-min :global(.layout_sidenav__flag) { display: none; }
          .side.is-min :global(.tg) { display: none; }
          .is-min :global(.layout_sidenav__row) { position: relative; justify-content: center; padding: 0; gap: 0; }
          .is-min .badge { position: absolute; top: 2px; right: 2px; min-width: 14px; height: 14px; padding: 0 3px; font-size: 9px; line-height: 14px; }
        }
        .side::-webkit-scrollbar { display: none; }
        .list { display: flex; flex-direction: column; }
        .foot { margin-top: auto; padding-bottom: 0; }
        /* 项：hover 背景过渡 var(--mo-hover)（motion.css .mo-hover）；按压无视觉变化（文档：未观察到） */
        :global(.layout_sidenav__row) { display: flex; align-items: center; gap: 10px; box-sizing: border-box; width: 100%; height: 40px; padding: 0 10px; margin-bottom: 4px; border: 0; border-radius: 12px; background: transparent; color: var(--vp-text); font-family: inherit; font-size: 14px; font-weight: 500; text-align: left; text-decoration: none; cursor: pointer; }
        :global(.layout_sidenav__row) { position: relative; transition: background var(--mo-hover), color var(--mo-hover), box-shadow var(--mo-hover), transform 120ms ease-out; }
        :global(.layout_sidenav__row):hover { background: rgba(255, 255, 255, .06); }
        :global(.layout_sidenav__row):active { transform: scale(.98); }
        /* 选中：薄荷荧光块（静态光晕 + 描边），图标也发光；到达时再冒一次荧光（::after，只动 transform/opacity） */
        :global(.layout_sidenav__row).on { color: var(--fx-mint); background: radial-gradient(130% 160% at 28% 50%, rgba(var(--fx-mint-rgb), .26), rgba(var(--fx-mint-rgb), .07) 70%); box-shadow: inset 0 0 0 1px rgba(var(--fx-mint-rgb), .38), 0 0 18px rgba(var(--fx-mint-rgb), .2); }
        :global(.layout_sidenav__row)::after { content: ''; position: absolute; inset: -4px; border-radius: 16px; pointer-events: none; opacity: 0; background: radial-gradient(closest-side, rgba(var(--fx-mint-rgb), .55), rgba(var(--fx-mint-rgb), 0) 74%); }
        :global(.layout_sidenav__row):active::after { opacity: .6; }
        :global(.layout_sidenav__row).on::after { animation: sn-burst .75s cubic-bezier(.23, 1, .32, 1) both; }
        @keyframes sn-burst { 0% { opacity: 0; transform: scale(.82); } 35% { opacity: .85; } 100% { opacity: 0; transform: scale(1.2); } }
        @media (prefers-reduced-motion: reduce) { :global(.layout_sidenav__row).on::after { animation: none; } :global(.layout_sidenav__row) { transition: background var(--mo-hover), color var(--mo-hover); } }
        :global(.layout_sidenav__row):focus-visible { outline: 2px solid var(--fx-mint); outline-offset: -2px; }
        .ic { width: 20px; height: 20px; flex: none; display: inline-flex; align-items: center; justify-content: center; color: var(--fx-icon); transition: color var(--mo-hover), filter var(--mo-hover); }
        :global(.layout_sidenav__row).on .ic { color: var(--fx-mint); filter: drop-shadow(0 0 6px rgba(var(--fx-mint-rgb), .7)); }
        .txt { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .badge { flex: none; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: #f43f5e; color: #fff; font-size: 11px; font-style: normal; font-weight: 700; line-height: 18px; text-align: center; }
        .side :global(.cg) { border-radius: 14px; transition: background .3s ease; }
        .side :global(.cg.open) { margin-bottom: 4px; padding-bottom: 4px; background: rgba(255, 255, 255, .05); }
        .cg.open :global(.layout_sidenav__row):first-child { margin-bottom: 4px; }
        .side :global(.tg) { flex: none; width: 28px; height: 28px; border-radius: 8px; background: rgba(255, 255, 255, .08); display: inline-flex; align-items: center; justify-content: center; color: #fff; }
        .side :global(.tgi) { transition: transform .3s cubic-bezier(.4, 0, .2, 1); }
        .side :global(.cg.open .tgi) { transform: rotate(180deg); }
        .side :global(.subw) { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .3s cubic-bezier(.4, 0, .2, 1), opacity .25s ease; }
        .side :global(.cg.open .subw) { grid-template-rows: 1fr; opacity: 1; }
        .side :global(.sub) { min-height: 0; overflow: hidden; padding: 0 8px; }
        :global(.layout_sidenav__sub) { height: 44px; padding-left: 8px; color: #aeb2bb; }
        :global(.layout_sidenav__sub).on { color: var(--fx-mint); background: rgba(var(--fx-mint-rgb), .1); box-shadow: inset 0 0 0 1px rgba(var(--fx-mint-rgb), .28); }
        .side :global(.ic2) { width: 28px; height: 28px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--fx-icon); }
        :global(.layout_sidenav__sub).on :global(.ic2) { color: var(--fx-mint); filter: drop-shadow(0 0 5px rgba(var(--fx-mint-rgb), .6)); }
        .sep { height: 0; margin: 9px 0 11px; border: 0; border-top: 1px solid rgba(255, 255, 255, .08); }
        :global(.layout_sidenav__flag) { flex: none; margin-right: 8px; }
        .chev { flex: none; width: 14px; height: 14px; display: inline-flex; color: var(--vp-muted); }
      `}</style>
    </nav>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
