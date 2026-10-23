'use client'
// 奖池分享海报（参考站 /jackpot-game-share，JackpotGameShare）：整屏居中海报（原站插画 → SkImg 占位）+ 两个按钮 + 底部弹层「参与并分享」。
// 结构照 app/jackpot-invited/page.tsx。?mode=scan 切为扫码版文案；?state=loading 海报位加载态。
// 「开始助力」未登录走 guard（来源 header，与邀请奖池同规则）。
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import type { ApiJackpotGameShare } from '@/lib/types'
import { usePromoData } from '@/components/promo/usePromoData'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'

export default function Page() {
  return <Suspense fallback={null}><JackpotGameSharePage /></Suspense>
}

function JackpotGameSharePage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const scan = sp.get('mode') === 'scan'
  const { t } = useLanguage()
  const { back, guard } = useGate()
  const { showToast } = useLayout()
  const [sheet, setSheet] = useState(false)
  const { data, error } = usePromoData<ApiJackpotGameShare>('/api/web/promo/jackpotGameShare')
  const loading = st === 'loading' || (data === null && !error)

  const start = () => guard('header', () => showToast(t('jackpotGameShare.joined')))
  const copy = () => {
    const url = `${window.location.origin}/register?ref=share`
    navigator.clipboard?.writeText(url).then(() => showToast(t('jackpot.copied')), () => showToast(t('jackpot.copyFail')))
  }

  return (
    <div className="jgs">
      <header className="jgs-bar">
        <span className="jgs-back" role="button" tabIndex={0} aria-label={t('browse.back')} onClick={back}>‹</span>
      </header>

      <div className="jgs-stage">
        {loading
          ? <SkBox className="jackpot_game_share_pg__poster" state={t('status.loading')} w={353} h={285} radius={12} />
          : <SkImg src="/assets/jackpot/poster.webp" className="jackpot_game_share_pg__poster" w={353} h={285} radius={12} />}
        <div className="jgs-text">
          <p className="jgs-rank">{t('jackpotGameShare.rank', { n: data?.rank ?? 0 })}</p>
          <p className="jgs-amount">{`${data?.currency ?? 'MYR'} ${data?.amount ?? '0'}`}</p>
          <span className="jgs-tag">{scan ? t('jackpotGameShare.byScan') : t('jackpotGameShare.byShare')}</span>
        </div>
      </div>

      <div className="jgs-actions">
        <button type="button" className="jgs-btn jgs-btn--ghost" onClick={start}>{t('jackpotGameShare.start')}</button>
        <button type="button" className="jgs-btn jgs-btn--main" onClick={() => setSheet(true)}>{t('jackpotGameShare.shareBonus')}</button>
      </div>

      {sheet ? (
        <div className="jgs-sheet-wrap">
          <div className="jgs-mask" onClick={() => setSheet(false)} />
          <div className="jgs-sheet" role="dialog" aria-label={t('jackpotGameShare.sheetTitle')}>
            <p className="jgs-sheet-t">{t('jackpotGameShare.sheetTitle')}</p>
            <p className="jgs-sheet-hint">{t('jackpotGameShare.sheetHint')}</p>
            <button type="button" className="jgs-btn jgs-btn--main" onClick={copy}>{t('jackpotGameShare.copyLink')}</button>
            <button type="button" className="jgs-btn jgs-btn--ghost" onClick={() => setSheet(false)}>{t('browse.cancel')}</button>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .jgs { position: relative; width: 100%; min-height: 812px; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; overflow: hidden; }
        .jgs-bar { display: flex; align-items: center; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .jgs-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }

        /* ---- 移动端 375：海报 353×285 居中（距顶 75） ---- */
        .jgs-stage { position: relative; width: 353px; height: 285px; margin: 20px auto 0; }
        :global(.jackpot_game_share_pg__poster) { position: absolute; left: 0; top: 0; }
        .jgs-text { position: absolute; left: 0; right: 0; top: 150px; text-align: center; }
        .jgs-rank { margin: 0 0 6px; font-size: 14px; color: #f5d27a; }
        .jgs-amount { margin: 0 0 8px; font-size: 28px; font-weight: 700; }
        .jgs-tag { display: inline-block; height: 22px; line-height: 22px; padding: 0 10px; border-radius: 999px; background: rgba(0, 0, 0, .45); font-size: 12px; }

        .jgs-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 24px; }
        .jgs-btn { display: block; width: 302px; height: 44px; line-height: 42px; border-radius: 999px; font-family: inherit; font-size: 16px; font-weight: 500; text-align: center; cursor: pointer; box-sizing: border-box; }
        .jgs-btn--ghost { border: 1px solid var(--vp-primary); background: transparent; color: var(--vp-primary); }
        .jgs-btn--main { border: 0; padding: 0; background: var(--vp-grad); color: var(--vp-on-primary); }

        /* 底部弹层：遮罩覆盖整屏，弹层贴底 */
        .jgs-sheet-wrap { position: absolute; inset: 0; z-index: 10; }
        .jgs-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, .6); }
        .jgs-sheet { position: absolute; left: 0; right: 0; bottom: 0; padding: 24px 12px 32px; box-sizing: border-box; border-radius: 16px 16px 0 0; background: #202229; text-align: center; }
        .jgs-sheet-t { margin: 0 0 8px; font-size: 16px; font-weight: 600; }
        .jgs-sheet-hint { margin: 0 0 16px; color: #8d8d92; font-size: 13px; }
        .jgs-sheet .jgs-btn { margin: 0 auto 12px; }

        /* ---- 网页端 ≥768：海报骨架保留手机宽度居中 ---- */
        @media (min-width: 768px) {
          .jgs { max-width: 375px; margin: 0 auto; }
        }
      `}</style>
    </div>
  )
}
