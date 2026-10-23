'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { tabItems } from '@/data/nav'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import Icon from '@/components/ui/Icon'

export default function TabBar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { setDrawerOpen } = useLayout()

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')
  // 已在当前页再点：滚动到顶（来源：文档 handlers-static §2，底部 tab 配置 scrollTo 分支；行为为瞬时滚动，推断）
  const onTab = (to: string) => {
    if (pathname === to) window.scrollTo({ top: 0 })
  }

  return (
    <nav className="tabbar" aria-label="tabs">
      {tabItems.map((x) =>
        // Menu 开抽屉（来源：文档 interactions.md 抽屉 触发）
        x.key === 'menu' ? (
          <button key={x.key} className="layout_tabbar__tab" onClick={() => setDrawerOpen(true)}>
            <i aria-hidden="true"><Icon name={x.icon} size={22} solid /></i><span>{t(x.k)}</span>
          </button>
        ) : (
          <Link key={x.key} href={x.to} className={`layout_tabbar__tab${isActive(x.to) ? ' on' : ''}`} onClick={() => onTab(x.to)}>
            <i aria-hidden="true"><Icon name={x.icon} size={22} solid /></i><span>{t(x.k)}</span>
            {x.badge ? <em className="badge">{x.badge}</em> : null}
          </Link>
        ),
      )}

      <style jsx>{`
        /* 手机底部 tab：高 56，5 等分，图标在上（20px）、标签在下（11px） */
        .tabbar { position: fixed; bottom: 0; left: 0; right: 0; height: 56px; box-sizing: border-box; z-index: 20; display: flex; align-items: stretch; background: #1a1a21; border-top: 1px solid rgba(255, 255, 255, .06); padding-bottom: env(safe-area-inset-bottom); }
        :global(.layout_tabbar__tab) { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px 0 0; background: none; border: 0; color: var(--vp-muted); font-family: inherit; font-size: 11px; text-decoration: none; cursor: pointer; }
        :global(.layout_tabbar__tab) i { display: inline-flex; width: 22px; height: 22px; font-style: normal; transition: filter var(--mo-hover), transform 120ms ease-out; }
        :global(.layout_tabbar__tab):active i { transform: scale(.94); }
        /* 选中：薄荷色实心图标 + 荧光（与桌面侧栏一致） */
        :global(.layout_tabbar__tab).on { color: var(--fx-mint); }
        :global(.layout_tabbar__tab).on i { filter: drop-shadow(0 0 6px rgba(var(--fx-mint-rgb), .75)); }
        :global(.layout_tabbar__tab):focus-visible { outline: 2px solid var(--vp-primary); outline-offset: -2px; }
        .badge { position: absolute; top: 4px; left: calc(50% + 8px); min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: #f43f5e; color: #fff; font-size: 10px; font-style: normal; font-weight: 700; line-height: 16px; text-align: center; }
        @media (min-width: 768px) { .tabbar { display: none; } }
      `}</style>
    </nav>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
