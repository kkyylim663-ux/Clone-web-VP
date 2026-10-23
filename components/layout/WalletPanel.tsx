'use client'
// 钱包右侧面板：顶栏“+”打开（已登录），URL 不变。参考站实测：手机 375 全宽；网页宽 400 为推断。
// 动效：.mo-panel-right 300ms ease-out（同抽屉曲线，方向相反）；遮罩 .mo-overlay。
// ?state=guest|member|loading|error|empty|data ；?flow=pick|verr|submitting|success|fail
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLayout } from '@/context/LayoutContext'
import WalletHead from '@/components/skeleton/money/WalletHead'
import WalletBody from '@/components/skeleton/money/WalletBody'
import GuestGate from '@/components/skeleton/money/GuestGate'

export default function WalletPanel() {
  const sp = useSearchParams()
  const { loggedIn } = useAuth()
  const { walletOpen, setWalletOpen, walletView: view, setWalletView: setView } = useLayout()
  const st = sp.get('state') ?? ''
  const flow = sp.get('flow') ?? ''
  // 有 state 参数（非 guest）即视为已登录；无参数跟随登录态
  const member = st !== 'guest' && (st !== '' || loggedIn)
  const close = () => setWalletOpen(false)

  return (
    <div>
      <div className={`mask mo-overlay${walletOpen ? ' on' : ''}`} onClick={close} />
      <aside className={`panel mo-panel-right${walletOpen ? ' on' : ''}`} aria-label="wallet">
        <WalletHead view={view} mode="panel" onView={setView} onClose={close} />
        <div className="pb">
          {!member ? <GuestGate /> : <WalletBody view={view} state={st} flow={flow} />}
        </div>
      </aside>

      <style jsx>{`
        .mask { position: fixed; inset: 0; background: rgba(0, 0, 0, .6); z-index: 60; }
        .mask:not(.on) { pointer-events: none; }
        /* 位移与曲线由 motion.css .mo-panel-right 提供（不在此覆盖 transition） */
        .panel { position: fixed; top: 0; bottom: 0; right: 0; width: 100%; box-sizing: border-box; z-index: 70; background: #1a1a21; color: #fff; overflow-y: auto; }
        .pb { padding: 0 12px 24px; box-sizing: border-box; }
        @media (min-width: 768px) {
          .panel { left: auto; width: 400px; box-shadow: -8px 0 24px rgba(0, 0, 0, .35); }
        }
      `}</style>
    </div>
  )
}
