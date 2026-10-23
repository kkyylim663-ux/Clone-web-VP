'use client'
// 已参与奖池（对应 vp-web/app/pages/jackpot-attached.vue，参考站真实路径 /jackpot-attached）。
// 数据取自 post('/api/web/promo/jackpotAttached')。?state=: loading 加载中 | 默认有数据
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { usePromoData } from '@/components/promo/usePromoData'
import { fmtStr } from '@/components/promo/util'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'

export default function Page() {
  return <Suspense fallback={null}><JackpotAttachedPage /></Suspense>
}

interface AttachedData { index: number, amount: string }

function JackpotAttachedPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { back } = useGate()
  const { data, error } = usePromoData<AttachedData>('/api/web/promo/jackpotAttached')
  const loading = st === 'loading' || (data === null && !error)

  return (
    <div className="at">
      <header className="at-bar">
        <span className="at-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="at-title">{t('jackpot.attachedTitle')}</h1>
      </header>

      {loading ? <SkBox className="jackpot_attached_pg__at-poster" state={t('status.loading')} w={353} h={285} radius={12} /> : <SkImg src="/assets/jackpot/poster.webp" className="jackpot_attached_pg__at-poster" w={353} h={285} radius={12} />}
      <SkImg className="jackpot_attached_pg__at-logo" w={299} h={91} radius={0} label={t('jackpot.logoImg')} />

      <div className="at-info">
        <p className="at-line"><b>{t('jackpot.attachedTitle')}</b></p>
        <p className="at-line">{t('jackpot.todayNo')} <b>{data?.index ?? 0}</b></p>
        <p className="at-amount"><b>{fmtStr(data?.amount ?? '0.00')}</b></p>
        <p className="at-muted">{t('jackpot.attachedNote')}</p>
      </div>

      <SkImg src="/assets/jackpot/banner-bottom.webp" className="jackpot_attached_pg__at-banner" w={364} h={111} radius={0} label={t('jackpot.bottomImg')} />
      <span className="at-cta">{t('jackpot.joined')}</span>

      <style jsx global>{`
        .at { position: relative; width: 100%; min-height: 812px; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; overflow: hidden; }
        .at-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .at-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .at-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }

        /* ---- 移动端 375（绝对定位还原叠放关系） ---- */
        :global(.jackpot_attached_pg__at-poster) { position: absolute; left: 12px; top: 67px; }
        :global(.jackpot_attached_pg__at-logo) { position: absolute; left: 38px; top: 220px; }
        .at-info { position: absolute; left: 12px; right: 12px; top: 330px; text-align: center; }
        .at-line { margin: 0 0 6px; font-size: 14px; }
        .at-amount { margin: 10px 0 6px; font-size: 24px; font-weight: 700; }
        .at-muted { margin: 0; color: #8d8d92; font-size: 12px; }
        :global(.jackpot_attached_pg__at-banner) { position: absolute; left: 6px; top: 687px; }
        .at-cta { position: absolute; left: 45px; top: 708px; width: 286px; height: 70px; line-height: 70px; box-sizing: border-box; border-radius: 12px; background: #3a3d44; color: #c4c8d0; text-align: center; font-size: 16px; font-weight: 500; }

        /* ---- 网页端 ≥768：参考站 1280 访问后回到首页，骨架保留手机宽度居中（推断） ---- */
        @media (min-width: 768px) {
          .at { max-width: 375px; margin: 0 auto; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
