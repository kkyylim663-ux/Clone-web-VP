'use client'
// 奖金详情（参考站 /bonus/detail，BonusDetail；与 /bonus/details 是不同路由）。
// 访客：顶栏右侧 Sign In / Register，正文显示登录提示；已登录或 ?state=member：显示详情骨架（复用 BonusDetailBody）。
// ?state=loading 加载中。注意：参考站登录后的正文结构未取证，按 /bonus/details?state=detail 骨架复用。
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import BonusDetailBody from '@/components/promo/BonusDetailBody'

export default function Page() {
  return <Suspense fallback={null}><BonusDetailPage /></Suspense>
}

function BonusDetailPage() {
  const st = useSearchParams().get('state') ?? ''
  const { t } = useLanguage()
  const { loggedIn } = useAuth()
  const { back, enterLogin, enterRegister } = useGate()
  const member = st === 'member' || (st !== 'guest' && loggedIn)

  return (
    <div className="bdt">
      <header className="bdt-bar">
        <span className="bdt-back" role="button" tabIndex={0} aria-label={t('browse.back')} onClick={back}>‹</span>
        <h1 className="bdt-title">{t('bonus.detailTitle')}</h1>
        {!member ? (
          <div className="bdt-auth">
            <span className="bdt-btn bdt-btn--ghost" role="button" tabIndex={0} onClick={() => enterLogin('header')}>{t('browse.fav.login')}</span>
            <span className="bdt-btn bdt-btn--main" role="button" tabIndex={0} onClick={() => enterRegister('header')}>{t('browse.register')}</span>
          </div>
        ) : null}
      </header>

      {member || st === 'loading' ? (
        <BonusDetailBody st={member && st !== 'loading' ? 'detail' : 'loading'} />
      ) : (
        <div className="bdt-guest">
          <p className="bdt-msg">{t('gate.needLogin')}</p>
          <button type="button" className="bdt-cta" onClick={() => enterLogin('bonus')}>{t('gate.login')}</button>
        </div>
      )}

      <style jsx>{`
        .bdt { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; }

        /* ---- 移动端 375：顶栏 55；右侧 Sign In 76×32 位于 x=203，Register 位于 x=287 ---- */
        .bdt-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .bdt-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .bdt-title { flex: 1; margin: 0; font-size: 16px; font-weight: 600; white-space: nowrap; }
        .bdt-auth { display: flex; gap: 8px; }
        .bdt-btn { display: block; width: 76px; height: 32px; line-height: 30px; border-radius: 8px; border: 1px solid var(--vp-primary);
          font-size: 13px; font-weight: 500; text-align: center; cursor: pointer; }
        .bdt-btn--ghost { color: var(--vp-primary); }
        .bdt-btn--main { color: var(--vp-on-primary); background: var(--vp-grad); }

        .bdt-guest { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 128px 12px 0; box-sizing: border-box; }
        .bdt-msg { margin: 0; font-size: 16px; font-weight: 600; }
        .bdt-cta { width: 302px; height: 44px; border: 0; padding: 0; border-radius: 12px; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }

        /* ---- 网页端 ≥768：外壳顶栏已有登录入口，本页隐藏顶栏 ---- */
        @media (min-width: 768px) {
          .bdt { background: transparent; max-width: 968px; margin: 0 auto; }
          .bdt-bar { display: none; }
          .bdt-guest { padding-top: 200px; }
        }
      `}</style>
    </div>
  )
}
