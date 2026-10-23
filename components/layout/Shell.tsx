'use client'
// 外壳 = vp-web/app/layouts/default.vue。bare 页（lib/bare.ts）：手机隐藏顶栏/下载条/底部 tab/客服按钮，.page 无内边距，隐藏页脚；桌面保持外壳。
import { Suspense, useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { isBare } from '@/lib/bare'
import { navCount } from '@/lib/navCount'
import { prefetchPost } from '@/lib/queryCache'
import { useGate } from '@/lib/useGate'
import { useLayout } from '@/context/LayoutContext'
import NavProgress from '@/components/layout/NavProgress'
import DownloadBar from '@/components/layout/DownloadBar'
import TopBar from '@/components/layout/TopBar'
import SideNav from '@/components/layout/SideNav'
import SiteFooter from '@/components/layout/SiteFooter'
import TabBar from '@/components/layout/TabBar'
import DrawerMenu from '@/components/layout/DrawerMenu'
import WalletPanel from '@/components/layout/WalletPanel'
import SessionExpiredModal from '@/components/layout/SessionExpiredModal'
import BonusShareModal from '@/components/promo/BonusShareModal'
import SupportFab from '@/components/layout/SupportFab'

import GameHoverPop from '@/components/layout/GameHoverPop'

const ALL_ROUTES = ['/casino', '/sports', '/promotion', '/vip', '/bonus', '/jackpot', '/refer-earn', '/login', '/register', '/user', '/deposit', '/withdraw', '/bets', '/kyc', '/preferences', '/security', '/sessions', '/notifications', '/wallet/records', '/chat', '/freeSpin', '/providers', '/game-list', '/site-map', '/privacy-policy', '/terms-and-conditions', '/casino/search', '/casino/recent', '/casino/favourites-recent', '/language', '/sports-betting', '/bonus/detail', '/jackpot-share', '/refer-earn-calc', '/forgot']

// 常用页的接口（与各页 usePromoData / useRemote 的 path、body 一致，否则缓存对不上）
const PREFETCH_API: [string, Record<string, unknown>][] = [
  ['/api/web/site/home', {}], ['/api/web/site/games', {}], ['/api/web/site/games', { category: '' }],
  ['/api/web/browse/categories', {}], ['/api/web/browse/providers', {}],
  ['/api/web/site/vipLevels', {}], ['/api/web/promo/vipBonus', {}], ['/api/web/currencyRatio/list', {}],
  ['/api/web/site/promotions', {}], ['/api/web/promo/bonusList', {}]
]

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const bare = isBare(pathname)
  // 站内导航计数（首次渲染不算）：供 useGate().back 判断有没有站内上一页
  const router = useRouter()
  // 空闲时预热常用页，点击后更快出内容
  useEffect(() => { const id = window.setTimeout(() => {
    // 全部静态页分批预取（每 60ms 一个，不挤占首屏），之后任何跳转只剩客户端切换
    ALL_ROUTES.forEach((h, i) => window.setTimeout(() => router.prefetch(h), i * 60))
    // 同时把这几页的接口数据取进缓存，进入时不再出现「加载中」
    PREFETCH_API.forEach(([p, b]) => prefetchPost(p, b))
  }, 1500); return () => window.clearTimeout(id) }, [router])
  const first = useRef(true)
  useEffect(() => { if (first.current) { first.current = false; return } navCount.value += 1 }, [pathname])
  return (
    <div className={`app${bare ? ' is-bare' : ''}`}>
      <Suspense fallback={null}><NavProgress /></Suspense>
      <div className="shell-top"><DownloadBar /><TopBar /></div>
      <div className="body">
        <SideNav />
        <div className="col">
          <main className="page">{children}</main>
          {pathname === '/freeSpin' || pathname === '/promotion' ? null : <div className="shell-foot"><SiteFooter /></div>}
        </div>
      </div>
      <div className="shell-tab"><TabBar /></div>
      <DrawerMenu />
      {/* WalletPanel 内用 useSearchParams，需要 Suspense 边界 */}
      <Suspense fallback={null}><WalletPanel /><JumpDeposit /></Suspense>
      <SessionExpiredModal />
      <BonusShareModal />
      <GameHoverPop />
      <div className="shell-fab"><SupportFab /></div>

      <style jsx>{`
        .app { min-height: 100vh; min-height: 100dvh; box-sizing: border-box; padding-bottom: 56px; }
        .shell-top, .shell-tab, .shell-fab, .shell-foot { display: contents; }
        .body { display: flex; }
        .col { position: relative; flex: 1; min-width: 0; }
        /* 每个页面头部一层很淡的渐变光（参考站每页顶部都有）：盖在内容上方，不拦截点击，亮度很低 */
        .col::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 230px; z-index: 3; pointer-events: none;
          background: radial-gradient(60% 100% at 24% 0%, rgba(150, 120, 225, .22), transparent 74%), radial-gradient(46% 90% at 80% 0%, rgba(70, 190, 170, .14), transparent 76%), linear-gradient(180deg, rgba(255, 255, 255, .04), transparent 85%); }
        @media (min-width: 768px) { .col::before { height: 300px; } }
        /* 手机内容左右 12px（参考站卡片起点 x=12） */
        .page { padding: 12px; }
        /* 手机 bare 页：隐藏外壳顶栏、下载条、底部 tab、客服按钮 */
        @media (max-width: 767px) {
          .app.is-bare { padding-bottom: 0; }
          .app.is-bare .page { padding: 0; }
          .app.is-bare .shell-foot { display: none; }
          .app.is-bare .shell-top,
          .app.is-bare .shell-tab,
          .app.is-bare .shell-fab { display: none; }
        }
        @media (min-width: 768px) {
          .app { padding: 0 4px; padding-bottom: 0; }
          /* 侧栏右缘 244 到内容 276：内容左右各 32 */
          .page { padding: 20px 32px; }
        }
      `}</style>
    </div>
  )
}

// 参考站 /redirectPay → /?jumpType=Deposit：打开钱包面板（同顶栏 + 规则，未登录走登录入口）。
// 每次出现该参数只触发一次；触发后用 replace 去掉参数，关闭面板后不会再弹（与参考站 URL 的差异：参考站保留参数，这里去掉）。
function JumpDeposit() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { setWalletOpen } = useLayout()
  const { guard } = useGate()
  const done = useRef(false)
  useEffect(() => {
    if (sp.get('jumpType') !== 'Deposit') { done.current = false; return }
    if (done.current) return
    done.current = true
    guard('wallet', () => { setWalletOpen(true); router.replace(pathname) })
  }, [sp, guard, pathname, router, setWalletOpen])
  return null
}
