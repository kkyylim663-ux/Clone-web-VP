'use client'
import { navPush } from '@/lib/navProgress'
// 会话过期弹窗：遮罩 .mo-overlay，弹窗盒 .mo-modal 150ms（scale+fade，推断沿用登录弹窗曲线）
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useLayout } from '@/context/LayoutContext'
import { useModalMotion } from '@/lib/useModalMotion'

export default function SessionExpiredModal() {
  const { t } = useLanguage()
  const { sessionExpired, setSessionExpired } = useLayout()
  const { logout } = useAuth()
  const router = useRouter()
  const { mounted, shown } = useModalMotion(sessionExpired)

  // 重新登录：先 useAuth().logout() 清会话（cookie vp_session），再去登录页（参考站为 Logout 后去登录页，推断）
  const relogin = () => {
    setSessionExpired(false)
    logout()
    navPush(router, '/login')
  }

  return (
    <div className={`back mo-overlay${sessionExpired ? ' on' : ''}`}>
      {mounted && (
        <div className={`box mo-modal-enter-active${shown ? '' : ' mo-modal-enter-from'}`} role="dialog" aria-modal="true">
          <h3>{t('base.shell.expiredTitle')}</h3>
          <p>{t('base.shell.expiredDesc')}</p>
          <button onClick={relogin}>{t('base.shell.expiredBtn')}</button>
        </div>
      )}

      <style jsx>{`
        .back { position: fixed; inset: 0; z-index: 90; background: rgba(0, 0, 0, .6); display: flex; align-items: center; justify-content: center; padding: 16px; }
        .back:not(.on) { pointer-events: none; }
        .box { width: min(100%, 340px); background: #1d1f23; border-radius: 14px; padding: 20px; text-align: center; }
        h3 { margin: 0 0 8px; }
        p { margin: 0 0 16px; color: var(--vp-muted); font-size: 14px; }
        button { width: 100%; padding: 11px; border: 0; border-radius: 10px; background: var(--vp-grad); color: var(--vp-on-primary); font-weight: 700; cursor: pointer; font-family: inherit; }
      `}</style>
    </div>
  )
}
