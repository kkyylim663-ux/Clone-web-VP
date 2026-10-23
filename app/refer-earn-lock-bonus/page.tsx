'use client'
// 锁定奖金（对应 vp-web/app/pages/refer-earn-lock-bonus.vue）。数据取自 post('/api/web/promo/lockBonus')。
// 标签：锁定中 / 已释放（筛选）；搜索框按标题过滤。?state=: 空 = 有数据 | empty 空态 | loading 加载中
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { pickLang, type Translations } from '@/lib/pickLang'
import { usePromoData } from '@/components/promo/usePromoData'
import { cx, fmtStr } from '@/components/promo/util'
import SkImg from '@/components/ui/SkImg'
import { avatarImg } from '@/lib/assets'
import SkStatus from '@/components/shared/SkStatus'

export default function Page() {
  return <Suspense fallback={null}><LockBonusPage /></Suspense>
}

interface LockRow { id: number, status: 'locked' | 'released', amount: string, translations: Translations<{ title: string }> }
interface LockData { locked: string, rules: string[], rows: LockRow[] }

function LockBonusPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { lang, t } = useLanguage()
  const { back } = useGate()
  const { data, error, reload } = usePromoData<LockData>('/api/web/promo/lockBonus')
  const [tab, setTab] = useState<'locked' | 'released'>('locked')
  const [q, setQ] = useState('')
  const rows = (data?.rows ?? []).filter((r) => r.status === tab && (pickLang(r.translations, lang)?.title ?? '').toLowerCase().includes(q.trim().toLowerCase()))
  const loading = st === 'loading' || (data === null && !error)

  return (
    <div className="lb">
      <header className="lb-bar">
        <span className="lb-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="lb-title">{t('lock.title')}</h1>
      </header>

      {/* 顶部横幅：金额 + 规则卡（规则卡压在横幅底部） */}
      <section className="lb-top">
        <div className="lb-amount"><small>{t('lock.amountLabel')}</small><b>{fmtStr(data?.locked ?? '0.00')}</b></div>
        <div className="lb-rules">
          {(data?.rules ?? []).map((r) => <p key={r}>{r}</p>)}
        </div>
      </section>

      {/* 表格：标签 + 搜索 + 列表 */}
      <section className="lb-table">
        <nav className="lb-tabs">
          <button type="button" className={cx(tab === 'locked' && 'on')} onClick={() => setTab('locked')}>{t('lock.tabLocked')}</button>
          <button type="button" className={cx(tab === 'released' && 'on')} onClick={() => setTab('released')}>{t('lock.tabReleased')}</button>
        </nav>
        <label className="lb-search">
          <input className="lb-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('lock.searchPh')} aria-label={t('lock.searchPh')} />
        </label>

        {st === 'empty' || (!loading && !error && rows.length === 0) ? (
          <SkStatus kind="empty" title={t('lock.emptyTitle')} hint={t('lock.emptyHint')} h={300} />
        ) : null}
        {!loading && error ? <SkStatus kind="error" h={300} onRetry={reload} /> : null}
        {loading && !error ? (
          <div className="lb-rows">{[0, 1, 2, 3, 4].map((n) => <span key={n} className="lb-row lb-row--skel" />)}</div>
        ) : null}
        {!loading && !error && st !== 'empty' && rows.length > 0 ? (
          <div className="lb-rows">
            {rows.map((r) => (
              <div key={r.id} className="lb-row">
                <SkImg src={avatarImg(r.id)} w={36} h={36} round />
                <div className="lb-txt"><b>{pickLang(r.translations, lang)?.title ?? ''}</b><small>{t(`lock.status.${r.status}`)}</small></div>
                <b className="lb-val">{fmtStr(r.amount)}</b>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <style jsx global>{`
        .lb { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; padding-bottom: 80px; box-sizing: border-box; }

        /* ---- 移动端 375 ---- */
        .lb-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .lb-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .lb-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }

        .lb-top { position: relative; height: 201px; background: linear-gradient(160deg, #3b2a66, #1f2a44); }
        .lb-amount { padding: 17px 12px 0; box-sizing: border-box; }
        .lb-amount small { display: block; color: #c9c3e0; font-size: 12px; }
        .lb-amount b { display: block; margin-top: 4px; font-size: 24px; font-weight: 700; }
        .lb-rules { position: absolute; left: 12px; right: 12px; top: 78px; height: 123px; box-sizing: border-box; padding: 10px 16px; border-radius: 8px; background: rgba(20, 20, 28, 0.85); overflow: hidden; }
        .lb-rules p { margin: 0 0 6px; font-size: 13px; line-height: 18px; color: #c4c8d0; }

        .lb-table { margin: 16px 12px 0; height: 460px; box-sizing: border-box; padding: 8px 8px 0; border-radius: 8px; background: #202229; }
        .lb-tabs { display: flex; height: 40px; border-bottom: 1px solid #2a2d33; }
        .lb-tabs button { flex: 1; border: 0; padding: 0; background: transparent; line-height: 40px; color: #8d8d92; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
        .lb-tabs button.on { color: var(--vp-primary); box-shadow: inset 0 -2px 0 var(--vp-primary); }
        .lb-search { display: flex; align-items: center; height: 32px; margin: 0 0 8px; padding: 0 10px; box-sizing: border-box; border-radius: 8px; background: #2a2d33; }
        .lb-input { width: 100%; border: 0; outline: none; background: transparent; color: #fff; font-family: inherit; font-size: 12px; }
        .lb-input::placeholder { color: #8d8d92; }
        .lb-rows { display: flex; flex-direction: column; gap: 8px; }
        .lb-row { display: flex; align-items: center; gap: 10px; height: 56px; box-sizing: border-box; padding: 0 10px; border-radius: 8px; background: #2a2d33; }
        .lb-row--skel { background: repeating-linear-gradient(90deg, #2a2d33 0 40px, #30343b 40px 80px); }
        .lb-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .lb-txt b { font-size: 13px; font-weight: 600; }
        .lb-txt small { font-size: 11px; color: #8d8d92; }
        .lb-val { font-size: 13px; font-weight: 600; }

        /* ---- 网页端 ≥768（1280 实测：横幅 968，表格 944 居中） ---- */
        @media (min-width: 768px) {
          .lb { background: transparent; max-width: 968px; margin: 0 auto; padding: 0 0 40px; }
          .lb-bar { display: none; }
          .lb-top { height: 198px; margin-top: 0; }
          .lb-amount { padding: 24px 24px 0; }
          .lb-rules { left: 12px; right: 12px; top: 87px; height: 95px; }
          .lb-table { margin: 0 12px; width: auto; height: 261px; }
        }
      `}</style>
    </div>
  )
}
