'use client'
// 整页版钱包：/deposit、/withdraw、/wallet/records。参考站真实形态是右侧面板（URL 不变），这里按面板结构整页还原。
// ?state=guest|member|loading|error|empty|data；?flow=pick|verr|submitting|success|fail
// 访客：GuestGate（点登录跳 /login?page=wallet）。tab 切换：保留 query 跳转（同 Nuxt WalletPage.vue）。
import { navPush } from '@/lib/navProgress'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import WalletHead, { type WalletView } from '@/components/skeleton/money/WalletHead'
import WalletBody from '@/components/skeleton/money/WalletBody'
import GuestGate from '@/components/skeleton/money/GuestGate'

const PATH: Record<WalletView, string> = { deposit: '/deposit', withdraw: '/withdraw', records: '/wallet/records' }

export default function WalletPage({ view }: { view: WalletView }) {
  const router = useRouter()
  const sp = useSearchParams()
  const { loggedIn } = useAuth()
  const st = sp.get('state') ?? ''
  const flow = sp.get('flow') ?? ''
  // 有 state 参数（非 guest）即视为已登录；无参数跟随登录态
  const member = st !== 'guest' && (st !== '' || loggedIn)
  const go = (v: WalletView) => { if (v !== view) navPush(router, `${PATH[v]}?${sp.toString()}`) }

  return (
    <div className="wp">
      <WalletHead view={view} mode="page" onView={go} />
      <div className="wp-body">
        {!member ? <GuestGate /> : <WalletBody view={view} state={st} flow={flow} />}
      </div>

      <style jsx>{`
        .wp { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .wp-body { padding: 0 12px 24px; box-sizing: border-box; }
        /* 手机：不做 fixed 全屏覆盖。原因：会盖住外壳顶栏（TopBar z30）、底部标签（TabBar z20）与页脚。 */
        @media (min-width: 768px) {
          .wp { max-width: 400px; min-height: 0; background: transparent; }
        }
      `}</style>
    </div>
  )
}
