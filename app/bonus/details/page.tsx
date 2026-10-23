'use client'
// 奖金详情（对应 vp-web/app/pages/bonus/details.vue）。默认显示活动详情内容；参考站无参数时是「活动准备中」，保留为 ?state=empty。
// ?state=loading 加载中。正文见 components/promo/BonusDetailBody.tsx（与 /bonus/detail 共用）。
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import BonusDetailBody from '@/components/promo/BonusDetailBody'

export default function Page() {
  return <Suspense fallback={null}><BonusDetailsPage /></Suspense>
}

function BonusDetailsPage() {
  const st = useSearchParams().get('state') ?? ''
  const { t } = useLanguage()
  const { back } = useGate()

  return (
    <div className="bd">
      <header className="bd-bar">
        <span className="bd-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="bd-title">{t('bonus.detailTitle')}</h1>
      </header>

      <BonusDetailBody st={st} />

      <style jsx global>{`
        .bd { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; }

        /* ---- 移动端 375 ---- */
        .bd-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .bd-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .bd-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }

        /* ---- 网页端 ≥768 ---- */
        @media (min-width: 768px) {
          .bd { background: transparent; max-width: 968px; margin: 0 auto; }
          .bd-bar { display: none; }
        }
      `}</style>
    </div>
  )
}
