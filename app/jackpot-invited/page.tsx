'use client'
// 邀请奖池（对应 vp-web/app/pages/jackpot-invited.vue，参考站真实路径 /jackpot-invited）。
// 数据取自 post('/api/web/promo/jackpotInvited')；参考站实测默认「已结束」。?state=: active 分享中 | loading 加载中
// 分享：需登录（guard('header')），复制邀请链接（推断）。
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { useLayout } from '@/context/LayoutContext'
import { usePromoData } from '@/components/promo/usePromoData'
import { fmtStr } from '@/components/promo/util'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'

export default function Page() {
  return <Suspense fallback={null}><JackpotInvitedPage /></Suspense>
}

interface InvitedData { active: boolean, todayIndex: number, amount: string }

function JackpotInvitedPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { back, guard } = useGate()
  const { showToast } = useLayout()
  const { data, error } = usePromoData<InvitedData>('/api/web/promo/jackpotInvited')
  const loading = st === 'loading' || (data === null && !error)
  const active = st === 'active' || (st === '' && !!data?.active)

  const share = () => {
    const url = `${window.location.origin}/register?ref=invite`
    navigator.clipboard?.writeText(url).then(() => showToast(t('jackpot.copied')), () => showToast(t('jackpot.copyFail')))
  }

  return (
    <div className="iv">
      <header className="iv-bar">
        <span className="iv-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="iv-title">{t('jackpot.invitedTitle')}</h1>
      </header>

      {loading ? <SkBox className="jackpot_invited_pg__iv-poster" state={t('status.loading')} w={353} h={285} radius={12} /> : <SkImg src="/assets/jackpot/poster.webp" className="jackpot_invited_pg__iv-poster" w={353} h={285} radius={12} />}
      <SkImg className="jackpot_invited_pg__iv-logo" w={299} h={91} radius={0} label={t('jackpot.logoImg')} />

      <div className="iv-info">
        <p className="iv-line"><b>{t('jackpot.invitedTitle')}</b></p>
        <p className="iv-line">{t('jackpot.todayNo')} <b>{data?.todayIndex ?? 0}</b></p>
        <p className="iv-amount"><b>{fmtStr(data?.amount ?? '0.00')}</b></p>
        <p className="iv-line iv-muted">{t('jackpot.invitedNote')}</p>
      </div>

      <div className="iv-foot">
        {active ? <button type="button" className="iv-cta" onClick={() => guard('header', share)}>{t('jackpot.share')}</button> : <span className="iv-ended">{t('jackpot.ended')}</span>}
      </div>

      <style jsx global>{`
        .iv { position: relative; width: 100%; min-height: 812px; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; overflow: hidden; }
        .iv-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .iv-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .iv-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }

        /* ---- 移动端 375（绝对定位还原叠放关系） ---- */
        :global(.jackpot_invited_pg__iv-poster) { position: absolute; left: 12px; top: 75px; }
        :global(.jackpot_invited_pg__iv-logo) { position: absolute; left: 38px; top: 228px; }
        .iv-info { position: absolute; left: 12px; right: 12px; top: 340px; text-align: center; }
        .iv-line { margin: 0 0 6px; font-size: 14px; }
        .iv-amount { margin: 10px 0 6px; font-size: 24px; font-weight: 700; }
        .iv-muted { color: #8d8d92; font-size: 12px; }
        .iv-foot { position: absolute; left: 0; right: 0; top: 722px; height: 90px; box-sizing: border-box; padding-top: 21px; border-radius: 20px 20px 0 0; background: #202229; text-align: center; }
        .iv-cta { display: inline-block; width: 302px; height: 44px; line-height: 44px; border: 0; padding: 0; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 16px; font-weight: 500; cursor: pointer; }
        .iv-ended { display: inline-block; width: 302px; height: 44px; line-height: 44px; border-radius: 999px; background: #3a3d44; color: #8d8d92; font-size: 14px; }

        /* ---- 网页端 ≥768：参考站 1280 访问后回到首页，骨架保留手机宽度居中（推断） ---- */
        @media (min-width: 768px) {
          .iv { max-width: 375px; margin: 0 auto; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
