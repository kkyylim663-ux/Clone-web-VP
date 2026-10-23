'use client'
// 奖池分享页（对应 vp-web/app/pages/jackpot/share.vue，参考站真实路径 /jackpot-share，需登录才能看，访客会回首页）。
// 三个页签：相关活动（跳转入口）/ 分享记录（取自 post('/api/web/promo/jackpotShare')，无数据显示空态）/ 奖池（可分享的奖池卡，复制分享链接）。
// ?state=: loading | data（演示分享记录行）。手机整页；网页版居中 960 宽卡片。
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import { pickLang } from '@/lib/pickLang'
import type { JackpotPool } from '@/lib/mock/promo'
import { usePromoData } from '@/components/promo/usePromoData'
import { cx, fmtStr } from '@/components/promo/util'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'

export default function Page() {
  return <Suspense fallback={null}><JackpotSharePage /></Suspense>
}

interface ShareRow { id: number | string, title: string, sub: string, amount: string }
type Tab = 'rel' | 'rec' | 'pool'
const TABS: Array<{ k: Tab, label: 'tabA' | 'tabB' | 'tabC' }> = [{ k: 'rel', label: 'tabA' }, { k: 'rec', label: 'tabB' }, { k: 'pool', label: 'tabC' }]
// 奖池卡配图：与奖池页同一组封面（v-05 / v-06 / v-07），主体靠右
const ART: Record<string, string> = { A: '/assets/covers/v-05.webp', B: '/assets/covers/v-06.webp', C: '/assets/covers/v-07.webp' }
const REL = [
  { to: '/bonus', t: 'relA', d: 'relADesc', ico: '/assets/bonus/ico-1.webp' },
  { to: '/promotion', t: 'relB', d: 'relBDesc', ico: '/assets/bonus/ico-2.webp' },
  { to: '/vip', t: 'relC', d: 'relCDesc', ico: '/assets/bonus/ico-3.webp' }
] as const

function JackpotSharePage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { lang, t } = useLanguage()
  const { back, go } = useGate()
  const { showToast } = useLayout()
  const [tab, setTab] = useState<Tab>('pool')
  const shareQ = usePromoData<{ list: ShareRow[] }>('/api/web/promo/jackpotShare')
  const poolQ = usePromoData<{ pools: JackpotPool[] }>('/api/web/promo/jackpot')
  const list = shareQ.data?.list ?? []
  const rows: ShareRow[] = st === 'data' && list.length === 0 ? [0, 1, 2].map((n) => ({ id: n, title: '—', sub: '—', amount: '0.00' })) : list
  const pools = useMemo(() => poolQ.data?.pools ?? [], [poolQ.data])

  const share = (key: string) => {
    const url = `${window.location.origin}/jackpot-share?pool=${key}`
    navigator.clipboard?.writeText(url).then(() => showToast(t('jackpot.copied')), () => showToast(t('jackpot.copyFail')))
  }
  const loading = st === 'loading' || (tab === 'rec' ? shareQ.data === null && !shareQ.error : tab === 'pool' ? poolQ.data === null && !poolQ.error : false)
  const failed = tab === 'rec' ? shareQ.error : tab === 'pool' ? poolQ.error : false

  return (
    <div className="js">
      <header className="js-bar">
        <span className="js-back" role="button" tabIndex={0} aria-label="back" onClick={back}>‹</span>
        <h1 className="js-title">{t('jackpot.shareTitle')}</h1>
        <span className="js-wallet"><small>{t('jackpot.balance')}</small><b>MYR 0.00</b></span>
      </header>

      <section className="js-panel">
        <nav className="js-tabs" role="tablist">
          {TABS.map((x) => (
            <button key={x.k} type="button" role="tab" aria-selected={tab === x.k} className={cx('js-tab', tab === x.k && 'on')} onClick={() => setTab(x.k)}>{t(`jackpot.${x.label}`)}</button>
          ))}
        </nav>

        <div className="js-body" key={tab}>
          {tab === 'rel' ? (
            <div className="js-rel">
              {REL.map((r) => (
                <div key={r.to} className="js-relc" role="button" tabIndex={0} onClick={() => go(r.to)}>
                  <img src={r.ico} alt="" />
                  <div className="js-txt"><b>{t(`jackpot.${r.t}`)}</b><small>{t(`jackpot.${r.d}`)}</small></div>
                  <span className="js-go">{t('jackpot.go')}</span>
                </div>
              ))}
            </div>
          ) : null}

          {tab !== 'rel' && loading ? <SkBox className="jackpot_share_pg__js-skel" state={t('status.loading')} h={300} /> : null}
          {tab !== 'rel' && !loading && failed ? <SkStatus kind="error" h={300} className="jackpot_share_pg__js-status" onRetry={tab === 'rec' ? shareQ.reload : poolQ.reload} /> : null}

          {tab === 'rec' && !loading && !failed ? (rows.length > 0 ? (
            <div className="js-list">
              {rows.map((r) => (
                <div key={r.id} className="js-row">
                  <div className="js-txt"><b>{r.title}</b><small>{r.sub}</small></div>
                  <b className="js-val">{r.amount}</b>
                </div>
              ))}
            </div>
          ) : <SkStatus kind="empty" title={t('jackpot.shareEmpty')} hint={t('jackpot.shareEmptyHint')} h={300} className="jackpot_share_pg__js-status" />) : null}

          {tab === 'pool' && !loading && !failed ? (
            <div className="js-pools">
              <p className="js-hint">{t('jackpot.shareHint')}</p>
              {pools.map((p) => (
                <article key={p.key} className="js-pool">
                  <i className="js-art" style={{ backgroundImage: `url(${ART[p.key] ?? ART.A})` }} />
                  <div className="js-pi">
                    <b className="js-pt">{pickLang(p.translations, lang)?.title ?? ''}</b>
                    <span className="js-pa"><small>{t('jackpot.recAmount')}</small>{fmtStr(p.amount)}</span>
                    <span className="js-pe">{t('jackpot.finishIn', { date: p.finishAt.slice(5, 16).replace('T', ' ') })}</span>
                  </div>
                  <button type="button" className="js-sb" onClick={() => share(p.key)}>{t('jackpot.shareCopy')}</button>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <style jsx global>{`
        .js { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; padding-bottom: 80px; box-sizing: border-box; }
        .js-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .js-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .js-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }
        .js-wallet { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex: none; height: 31px; padding: 0 12px; box-sizing: border-box; border-radius: 16px; background: #2a2d33; }
        .js-wallet small { color: #8d8d92; font-size: 12px; }
        .js-wallet b { font-size: 13px; color: var(--vp-primary); }

        .js-panel { box-sizing: border-box; min-height: 713px; padding: 0 0 16px; border-radius: 12px 12px 0 0; background: #202229; }
        .js-tabs { display: flex; height: 41px; border-bottom: 1px solid #2a2d33; }
        .js-tab { flex: 1; border: 0; background: none; font-family: inherit; font-size: 14px; line-height: 41px; padding: 0; text-align: center; color: #8d8d92; font-weight: 500; cursor: pointer; }
        .js-tab:hover { color: #c4c8d0; }
        .js-tab.on { color: var(--vp-primary); box-shadow: inset 0 -2px 0 var(--vp-primary); }
        .js-body { padding: 16px 12px 0; animation: js-in .3s ease-out; }
        @keyframes js-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        :global(.jackpot_share_pg__js-skel), :global(.jackpot_share_pg__js-status) { margin: 0; }
        .js-list { display: flex; flex-direction: column; gap: 8px; }
        .js-row { display: flex; align-items: center; justify-content: space-between; height: 60px; padding: 0 12px; box-sizing: border-box; border-radius: 10px; background: #2a2d33; }
        .js-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
        .js-txt b { font-size: 14px; font-weight: 600; }
        .js-txt small { font-size: 12px; color: #8d8d92; }
        .js-val { font-weight: 600; }

        .js-rel { display: flex; flex-direction: column; gap: 10px; }
        .js-relc { display: flex; align-items: center; gap: 12px; height: 76px; padding: 0 14px; box-sizing: border-box; border-radius: 12px; background: #2a2d33; border: 1px solid #353844; cursor: pointer; transition: transform .2s ease, border-color .2s ease; }
        .js-relc:hover { transform: translateY(-2px); border-color: var(--vp-primary); }
        .js-relc img { width: 48px; height: 48px; object-fit: contain; flex: none; }
        .js-go { flex: none; padding: 0 14px; height: 30px; line-height: 28px; border: 1px solid rgba(5, 242, 106, .4); border-radius: 999px; color: #3df585; font-size: 13px; font-weight: 600; background: rgba(5, 242, 106, .08); }

        .js-pools { display: flex; flex-direction: column; gap: 12px; }
        .js-hint { margin: 0 0 2px; color: #8d8d92; font-size: 13px; }
        .js-pool { position: relative; display: flex; align-items: flex-start; gap: 12px; height: 148px; padding: 14px; box-sizing: border-box; overflow: hidden; border-radius: 14px; background: #262932; border: 1px solid #353844; }
        .js-art { position: absolute; top: 0; bottom: 0; right: 0; width: 50%; background-size: cover; background-position: 50% 12%; background-repeat: no-repeat; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 45%); mask-image: linear-gradient(90deg, transparent 0, #000 45%); opacity: .9; }
        .js-pi { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
        .js-pt { font-size: 16px; font-weight: 700; }
        .js-pa { display: flex; align-items: baseline; gap: 6px; color: var(--vp-primary); font-size: 18px; font-weight: 700; }
        .js-pa small { color: #8d8d92; font-size: 11px; font-weight: 400; }
        .js-pe { color: #8d8d92; font-size: 11px; }
        .js-sb { position: absolute; left: 14px; bottom: 14px; z-index: 1; height: 34px; padding: 0 16px; border: 0; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }

        /* ---- 网页端 ≥768：居中 960 宽 ---- */
        @media (min-width: 768px) {
          .js { max-width: 960px; margin: 0 auto; background: transparent; padding: 20px 0 40px; }
          .js-back { display: none; }
          .js-title { font-size: 22px; font-weight: 700; }
          .js-wallet { height: 36px; }
          .js-panel { min-height: 0; margin-top: 16px; border-radius: 16px; background: #202229; border: 1px solid #2f323c; overflow: hidden; }
          .js-tabs { height: 48px; }
          .js-tab { line-height: 48px; font-size: 15px; }
          .js-body { padding: 20px; }
          .js-pools { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
          .js-hint { grid-column: 1 / -1; }
          .js-pool { height: 156px; }
          .js-rel { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
          .js-relc { height: 96px; }
        }
        @media (prefers-reduced-motion: reduce) { .js-body { animation: none; } }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
