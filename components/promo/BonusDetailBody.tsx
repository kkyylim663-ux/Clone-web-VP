'use client'
// 奖金详情正文（/bonus/details 与 /bonus/detail 共用）。
// 默认 = 详情内容（数据 post('/api/web/promo/bonusDetail')，领取走 post('/api/web/promo/bonusClaim')）；st='loading'：加载骨架；st='empty'：「活动准备中」空态（参考站无参数时的实测表现，保留作状态演示）。
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { post } from '@/lib/api'
import { pickLang, type Translations } from '@/lib/pickLang'
import { usePromoData } from '@/components/promo/usePromoData'
import { fmtStr } from '@/components/promo/util'
import SkImg from '@/components/ui/SkImg'
import { EMPTY } from '@/lib/assets'
import SkBox from '@/components/ui/SkBox'

interface Detail { id: number, amount: string, status: string, translations: Translations<{ title: string, rules: string[] }> }

export default function BonusDetailBody({ st }: { st: string }) {
  const { lang, t } = useLanguage()
  const { showToast } = useLayout()
  const detailOn = st !== 'loading' && st !== 'empty'
  const { data, reload } = usePromoData<Detail>('/api/web/promo/bonusDetail', { id: 1 })
  const tx = pickLang(data?.translations, lang)

  const claim = () => {
    if (!data) return
    post<{ status: string }>('/api/web/promo/bonusClaim', { id: data.id })
      .then(() => { showToast(t('bonus.claimOk')); reload() })
      .catch(() => showToast(t('bonus.claimFail')))
  }

  return (
    <>
      {detailOn ? (
        <div className="bd-detail">
          <SkImg src="/assets/promotion/card-special.webp" ratio="351 / 180" radius={12} label={tx?.title ?? ''} />
          <section className="bd-card">
            <h2 className="bd-h">{tx?.title ?? t('bonus.info')}</h2>
            <span className="bd-amt">{fmtStr(data?.amount ?? '0.00')}</span>
            <small className="bd-st">{data?.status === 'claimable' ? t('bonus.claim') : t('bonus.claimed')}</small>
          </section>
          <section className="bd-card">
            <h2 className="bd-h">{t('bonus.rules')}</h2>
            <ol className="bd-rules">{(tx?.rules ?? []).map((r) => <li key={r}>{r}</li>)}</ol>
          </section>
          <button type="button" className="bd-cta" disabled={!data || data.status !== 'claimable'} onClick={claim}>
            {data?.status === 'claimable' ? t('bonus.claim') : t('bonus.claimed')}
          </button>
        </div>
      ) : st === 'loading' ? (
        <div className="bd-detail">
          <SkBox state={t('status.loading')} h={180} />
          <SkBox state={t('status.loading')} h={120} />
          <SkBox state={t('status.loading')} h={160} />
        </div>
      ) : (
        <div className="bd-empty">
          <SkImg src={EMPTY[0]} w={102} h={102} radius={0} label={t('bonus.illustration')} />
          <p className="bd-msg">{t('bonus.preparing')}</p>
          <small className="bd-sub">{t('bonus.preparingHint')}</small>
        </div>
      )}

      <style jsx global>{`
        .bd-detail { display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box; }
        .bd-detail .sk-img { width: 100% !important; }
        .bd-detail .sk-box { width: 100%; }
        @media (min-width: 768px) { .bd-detail { padding: 0; } .bd-detail .sk-img { aspect-ratio: 968 / 300 !important; height: auto !important; } }
        .bd-card { display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: 12px; background: #202229; border: 1px solid rgba(255, 255, 255, .06); }
        .bd-h { margin: 0; font-size: 16px; font-weight: 700; color: var(--vp-text-img); }
        .bd-st { color: #8d93a0; font-size: 12px; }
        .bd-amt { font-size: 24px; font-weight: 700; color: #f5d27a; }
        .bd-rules { margin: 0; padding-left: 18px; color: #c4c8d0; font-size: 13px; line-height: 20px; }
        .bd-cta { display: block; width: 100%; height: 44px; line-height: 44px; border: 0; padding: 0; border-radius: 12px; text-align: center; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
        .bd-cta:disabled { background: #3a3d44; color: #8d8d92; cursor: default; }

        .bd-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 128px; }
        .bd-msg { margin: 0; font-size: 16px; font-weight: 600; }
        .bd-sub { color: #8d8d92; font-size: 13px; }

        /* ---- 网页端 ≥768 ---- */
        @media (min-width: 768px) {
          .bd-empty { padding-top: 200px; }
          .bd-detail { padding: 24px 0; }
        }
      `}</style>
    </>
  )
}
