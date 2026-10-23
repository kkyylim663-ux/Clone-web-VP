'use client'
// 免费旋转（对应 vp-web/app/pages/freeSpin.vue）。参考站无此页，本页为自定义骨架（推断）。
// 次数取自 post('/api/web/promo/freeSpin')；按钮需登录（guard('game')），点击后调用 freeSpinPlay 扣减一次。
// ?state=: '' 有次数 | empty 无次数 | loading 加载中
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { useLayout } from '@/context/LayoutContext'
import { post } from '@/lib/api'
import { usePromoData } from '@/components/promo/usePromoData'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'
import { fmtStr } from '@/components/promo/util'

export default function Page() {
  return <Suspense fallback={null}><FreeSpinPage /></Suspense>
}

const A = '/assets/freespin/'
// 奖品占位：k=图片名，label=转盘文字，title=中奖弹窗标题。后续由后台下发（接口可返回 prize 序号或 key）
const PRIZES = [
  { k: 'spin1', label: 'RM188', title: 'RM188', amt: 188 },
  { k: 'coin3', label: 'RM3', title: 'RM3', amt: 3 },
  { k: 'coin88', label: 'RM88', title: 'RM88', amt: 88 },
  { k: 'spin2', label: 'Try Again', title: 'Try Again', amt: 0 },
  { k: 'cashout', label: 'Cash out', title: 'Cash out', amt: 0 },
  { k: 'mystery', label: 'RM0-0.9', title: 'Mystery Bonus', amt: -1 }, // -1 = 0.1~0.9 随机（占位，后台控制）
]
// 兑现弹窗里的中奖播报占位（后台下发）
const WINNERS = [
  { n: 'U****6A', t: '10/22/2026 15:26:52', a: '13.50', c: '#e0a43a' },
  { n: 'Q****F', t: '10/22/2026 15:26:29', a: '17.10', c: '#7b8fd6' },
  { n: 'p****Pc', t: '10/22/2026 15:26:10', a: '16.20', c: '#8a8f98' },
  { n: '2Jp****iyh', t: '10/22/2026 15:23:14', a: '13.50', c: '#d9694f' },
  { n: 'Tf6****BXl', t: '10/22/2026 15:21:03', a: '18.00', c: '#4fb38a' },
]
const MyFlag = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><rect width="22" height="14" rx="2" fill="#fff" /><g fill="#d6263b"><rect y="0" width="22" height="2" /><rect y="4" width="22" height="2" /><rect y="8" width="22" height="2" /><rect y="12" width="22" height="2" /></g><rect width="11" height="8" fill="#1a2f7a" /><circle cx="4.6" cy="4" r="2.2" fill="#f5c518" /><circle cx="5.3" cy="4" r="1.8" fill="#1a2f7a" /></svg>
)
const CASH_TARGET = 18
const prizeAmount = (idx: number, win: string) => {
  const a = PRIZES[idx].amt
  if (a >= 0) return a
  const w = Number(win)
  return w > 0 && w <= 0.9 ? w : Math.round((Math.random() * 0.8 + 0.1) * 100) / 100
}
const pickPrize = (win: number) => (win >= 188 ? 0 : win >= 88 ? 2 : win >= 3 ? 1 : win > 0 ? 5 : 3)

interface SpinData { count: number, list: { id: number, title: string }[] }

function RecordList({ hist, empty }: { hist: { idx: number, amt: string, time: string }[], empty: string }) {
  if (!hist.length) return <div className="fs-rec__empty"><img src="/assets/mascot/fox-sad.webp" alt="" /><span>{empty}</span></div>
  return (
    <div className="fs-cash__list">
      {hist.map((h, i) => (
        <div key={i} className="fs-cash__row">
          <img className="fs-rec__ic" src={`${A}prize-${PRIZES[h.idx].k}.webp`} alt="" />
          <div className="fs-cash__who"><strong>{PRIZES[h.idx].title}</strong><small>{h.time}</small></div>
          <span className="fs-cash__a">{Number(h.amt) > 0 ? `MYR ${h.amt}` : '—'}</span>
        </div>
      ))}
    </div>
  )
}

function FreeSpinPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { back, guard, go } = useGate()
  const { showToast } = useLayout()
  const { data, error, reload } = usePromoData<SpinData>('/api/web/promo/freeSpin')
  const [left, setLeft] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [won, setWon] = useState('0.00')
  const [rot, setRot] = useState(0)
  const [tab, setTab] = useState(0)
  const [cashOpen, setCashOpen] = useState(false)
  const [panel, setPanel] = useState<null | 'rules' | 'record'>(null)
  const [hist, setHist] = useState<{ idx: number, amt: string, time: string }[]>([])
  const [result, setResult] = useState<{ idx: number, win: string } | null>(null)
  const [secs, setSecs] = useState(3 * 86400 - 1)
  useEffect(() => { const id = setInterval(() => setSecs((v) => (v > 0 ? v - 1 : 0)), 1000); return () => clearInterval(id) }, [])
  const pad = (n: number) => String(n).padStart(2, '0')
  const expiresShort = `${Math.floor(secs / 86400)}d ${pad(Math.floor(secs / 3600) % 24)}:${pad(Math.floor(secs / 60) % 60)}:${pad(secs % 60)}`
  const expires = `${pad(Math.floor(secs / 86400))} d ${pad(Math.floor(secs / 3600) % 24)}:${pad(Math.floor(secs / 60) % 60)}:${pad(secs % 60)}`
  const count = left ?? data?.count ?? 0

  const spin = () => {
    if (busy || count < 1) return
    setBusy(true)
    post<{ win: string, left: number, prize?: number | string }>('/api/web/promo/freeSpinPlay', { left: count })
      .then((r) => {
        const byKey = PRIZES.findIndex((p) => p.k === r.prize)
        const idx = typeof r.prize === 'number' && PRIZES[r.prize] ? r.prize : byKey >= 0 ? byKey : pickPrize(Number(r.win || 0))
        setRot((v) => (Math.floor(v / 360) + 5) * 360 - (30 + 60 * idx))
        setLeft(r.left)
        const amt = prizeAmount(idx, r.win)
        setTimeout(() => { setWon((v) => (Number(v) + amt).toFixed(2)); setResult({ idx, win: amt.toFixed(2) }); setHist((h) => [{ idx, amt: amt.toFixed(2), time: new Date().toLocaleString('en-GB', { hour12: false }) }, ...h]); setBusy(false) }, 4200)
      })
      .catch(() => { showToast(t('freeSpin.noSpin')); setBusy(false) })
  }

  const invite = () => {
    const url = typeof window !== 'undefined' ? window.location.origin : ''
    const done = () => { setLeft(count + 1); showToast(t('freeSpin.shared')) }
    if (typeof navigator !== 'undefined' && navigator.share) navigator.share({ url }).then(done).catch(() => {})
    else if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(url).then(done).catch(() => {})
    else done()
  }
  const wonN = Number(won)
  const remain = Math.max(CASH_TARGET - wonN, 0)

  const loading = st === 'loading' || (data === null && !error)
  const empty = st === 'empty' || (!loading && !error && count < 1)

  return (
    <div className="fs">
      {/* 网页端头部：标题 + 规则 / 记录；下方「更多奖金」 */}
      <div className="fs-dk">
        <img className="fs-gift" src={A + 'gift.webp'} alt="" /><h1 className="fs-dk__t">{t('freeSpin.headline')}</h1>
        <div className="fs-dk__btns">
          <span role="button" tabIndex={0} onClick={() => setPanel('rules')}>{t('freeSpin.rules')}</span>
          <span role="button" tabIndex={0} onClick={() => setPanel('record')}>{t('freeSpin.record')}</span>
        </div>
        <span className="fs-dk__more" role="button" tabIndex={0} onClick={() => go('/bonus')}>{t('freeSpin.moreBonus')} ›</span>
      </div>
      <header className="fs-bar">
        <span className="fs-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="fs-title">{t('freeSpin.headline')}</h1>
        <button type="button" className="fs-bar__b" aria-label={t('freeSpin.rules')} onClick={() => setPanel('rules')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.2 9.3a2.9 2.9 0 1 1 4.2 2.6c-.9.5-1.4 1-1.4 2" /><circle cx="12" cy="17.2" r=".6" fill="currentColor" /></svg>
        </button>
        <button type="button" className="fs-bar__b" aria-label={t('freeSpin.record')} onClick={() => setPanel('record')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h4" /></svg>
        </button>
      </header>
      <div className="fs-more-m"><span role="button" tabIndex={0} onClick={() => go('/bonus')}>{t('freeSpin.moreBonus')} ›</span></div>

      {loading ? (
        <>
          <SkBox state={t('status.loading')} h={200} className="freespin_pg__fs-block" />
          <SkBox state={t('status.loading')} h={64} className="freespin_pg__fs-block" />
        </>
      ) : null}

      {!loading && error ? <SkStatus kind="error" h={200} className="freespin_pg__fs-block" onRetry={reload} /> : null}

      {!loading && !error ? (
        <>
          <section className="fs-hero">
            <div className="fs-stage">
              <picture className="fs-bg"><source media="(min-width: 768px)" srcSet={A + 'bg-desktop.webp'} /><img src={A + 'bg-mobile.webp'} alt="" /></picture>
              <img className="fs-base" src={A + 'base.webp'} alt="" />
              <div className="fs-ring">
              <img className={`fs-glow${busy ? ' on' : ''}`} src={A + 'glow.webp'} alt="" />
              <div className="fs-wheel" style={{ transform: `rotate(${rot}deg)` }}>
                <img className="fs-disc" src={A + 'wheel-disc.webp'} alt="" />
                {PRIZES.map((p, i) => (
                  <div key={p.k} className="fs-slot" style={{ transform: `rotate(${30 + 60 * i}deg)` }}>
                    <img className="fs-prize" src={`${A}prize-${p.k}.webp`} alt="" style={{ transform: `translate(-50%, -50%) rotate(${-(30 + 60 * i)}deg)` }} />
                    <span className="fs-plabel" style={{ transform: `translate(-50%, -50%) rotate(${i === 2 || i === 3 ? 180 : 0}deg)` }}>{p.label}</span>
                  </div>
                ))}
              </div>
              <img className="fs-hub" src={A + 'wheel-hub.webp'} alt="" />
              <img className="fs-pointer" src={A + 'pointer.webp'} alt="" />
              </div>
            </div>
            <button type="button" className="fs-cta" disabled={busy || empty} onClick={() => guard('game', spin)}>
              <img className="fs-cta__bg" src={A + 'btn.webp'} alt="" /><span className="fs-cta__m">{t('freeSpin.spin')}</span><span className="fs-cta__d">{t('freeSpin.spinBtn', { n: count })}</span>
            </button>
            <p className="fs-exp">{t('freeSpin.expires')} {expires}</p>
          </section>

          <section className="fs-amt">
            <div className="fs-amt__top">
              <div><small>{t('freeSpin.myAmount')}</small><b>MYR {won}</b></div>
              <span role="button" tabIndex={0} onClick={() => setCashOpen(true)}>{t('freeSpin.cashOut')}</span>
            </div>
            <div className="fs-amt__bar"><i style={{ width: `${Math.min(wonN / CASH_TARGET, 1) * 100}%` }} /></div>
            <p className="fs-amt__tip">{t('freeSpin.cashPre')} <em>MYR {remain.toFixed(2)}</em> {t('freeSpin.cashMid')} <strong>MYR {CASH_TARGET.toFixed(2)}</strong></p>
            <button type="button" className="fs-amt__inv" onClick={() => guard('game', invite)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 16a3 3 0 0 0-2.1.9l-7-4.1a3 3 0 0 0 0-1.6l6.9-4A3 3 0 1 0 15 5a3 3 0 0 0 .1.8l-6.9 4a3 3 0 1 0 0 4.4l7 4.1a3 3 0 1 0 2.8-2.3z" /></svg>
              <span>{t('freeSpin.invite')}</span>
            </button>
          </section>

          <section className="fs-rec">
            <div className="fs-rec__tabs">
              <span className={tab === 0 ? 'on' : ''} role="button" tabIndex={0} onClick={() => setTab(0)}>{t('freeSpin.record')}</span>
              <span className={tab === 1 ? 'on' : ''} role="button" tabIndex={0} onClick={() => setTab(1)}>{t('freeSpin.helper')}</span>
            </div>
            {tab === 0 ? <RecordList hist={hist} empty={t('freeSpin.noData')} /> : <RecordList hist={[]} empty={t('freeSpin.noData')} />}
          </section>

          <section className="fs-count">
            <span>{t('freeSpin.left')}</span><b>{count}</b>
          </section>

        </>
      ) : null}

      {panel ? (
        <div className="fs-win" onClick={() => setPanel(null)}>
          <div className="fs-cash fs-cash--p" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="fs-cash__x" aria-label="close" onClick={() => setPanel(null)}>✕</button>
            <h3 className="fs-cash__t">{panel === 'rules' ? t('freeSpin.rules') : t('freeSpin.record')}</h3>
            {panel === 'rules' ? (
              <ol className="fs-rules">{[1, 2, 3, 4, 5].map((n) => <li key={n}>{t(`freeSpin.rule${n}`)}</li>)}</ol>
            ) : <RecordList hist={hist} empty={t('freeSpin.noData')} />}
          </div>
        </div>
      ) : null}

      {cashOpen ? (
        <div className="fs-win" onClick={() => setCashOpen(false)}>
          <div className="fs-cash" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="fs-cash__x" aria-label="close" onClick={() => setCashOpen(false)}>✕</button>
            <h3 className="fs-cash__h">{t('freeSpin.myAmount')}</h3>
            <b className="fs-cash__amt">MYR {won}</b>
            <div className="fs-amt__bar"><i style={{ width: `${Math.min(wonN / CASH_TARGET, 1) * 100}%` }} /></div>
            <p className="fs-cash__tip">{t('freeSpin.justPre')} <em>MYR {remain.toFixed(2)}</em> {t('freeSpin.justPost')}</p>
            <button type="button" className="fs-amt__inv fs-cash__inv" onClick={() => guard('game', invite)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 16a3 3 0 0 0-2.1.9l-7-4.1a3 3 0 0 0 0-1.6l6.9-4A3 3 0 1 0 15 5a3 3 0 0 0 .1.8l-6.9 4a3 3 0 1 0 0 4.4l7 4.1a3 3 0 1 0 2.8-2.3z" /></svg>
              <span>{t('freeSpin.invite')}</span>
            </button>
            <p className="fs-cash__exp">{t('freeSpin.expires')} {expiresShort}</p>
            <div className="fs-cash__list">
              {WINNERS.map((w) => (
                <div key={w.n} className="fs-cash__row">
                  <i className="fs-cash__av" style={{ background: w.c }}>{w.n[0]}</i>
                  <div className="fs-cash__who"><strong>{w.n}</strong><small>{w.t}</small></div>
                  <span className="fs-cash__a">MYR {w.a}</span><MyFlag />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="fs-win" onClick={() => setResult(null)}>
          <div className="fs-win__card" onClick={(e) => e.stopPropagation()}>
            <div className="fs-win__rays" />
            <img className="fs-win__img" src={`${A}prize-${PRIZES[result.idx].k}.webp`} alt="" />
            <p className="fs-win__sub">{PRIZES[result.idx].k === 'spin2' ? '' : t('freeSpin.congrats')}</p>
            <h2 className="fs-win__t">{PRIZES[result.idx].title}</h2>
            <button type="button" className="fs-win__ok" onClick={() => setResult(null)}>{t('freeSpin.ok')}</button>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .fs { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; padding-bottom: 80px; box-sizing: border-box; }
        .fs-bar { background: linear-gradient(180deg, rgba(6, 20, 26, .85), transparent); display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .fs-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .fs-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; text-shadow: 0 2px 6px rgba(0,0,0,.9); }

        /* ---- 移动端 375 ---- */
        .fs-hero { display: flex; flex-direction: column; gap: 12px; margin: 12px; }
        .fs-hero .sk-box { width: 100%; }
        .fs-cta { display: block; height: 44px; line-height: 44px; border: 0; padding: 0; border-radius: 12px; text-align: center; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
        .fs-cta:disabled { opacity: 0.5; cursor: default; }
        .fs-count { display: none; justify-content: space-between; height: 44px; line-height: 44px; margin: 0 12px; padding: 0 12px; box-sizing: border-box; border-radius: 10px; background: #202229; color: #c4c8d0; }
        :global(.freespin_pg__fs-block) { margin: 12px; }
        :global(.freespin_pg__fs-block).sk-box { width: calc(100% - 24px); }
        .fs-list { display: flex; flex-direction: column; gap: 8px; margin: 12px; }
        .fs-row { display: flex; justify-content: space-between; height: 52px; align-items: center; padding: 0 12px; box-sizing: border-box; border-radius: 10px; background: #2a2d33; }


        .fs { background: #1a1a21; position: relative; isolation: isolate; }
        .fs::before { content: ''; position: absolute; inset: 0; z-index: -1; background: url(/assets/freespin/bg-mobile.webp) center top / cover no-repeat; opacity: 1; pointer-events: none; }
        .fs-stage { position: relative; width: min(100%, 340px); aspect-ratio: 1 / 1.05; margin: 8px auto 0; }
        .fs-stage img { position: absolute; user-select: none; -webkit-user-drag: none; }
        .fs-glow { left: 50%; top: 50%; width: 130%; transform: translate(-50%, -50%); mix-blend-mode: screen; opacity: .35; transition: opacity .4s; pointer-events: none; }
        .fs-glow.on { opacity: 1; }
        .fs-base { left: 50%; bottom: 0; width: 135%; transform: translateX(-50%); }
        .fs-ring { position: absolute; left: 0; top: 0; width: 100%; aspect-ratio: 1; }
        .fs-wheel { position: absolute; left: 0; top: 0; width: 100%; height: 100%; transition: transform 4s cubic-bezier(.12,.7,.1,1); }
        .fs-disc { left: 0; top: 0; width: 100%; }
        .fs-slot { position: absolute; inset: 0; }
        .fs-prize { left: 50%; top: 25%; width: 22%; }
        .fs-hub { left: 50%; top: 50%; width: 28%; transform: translate(-50%, -50%); }
        .fs-pointer { left: 50%; top: -6%; width: 18%; transform: translateX(-50%); z-index: 2; }
        .fs-cta { position: relative; overflow: hidden; background: none; margin-top: -28px; }
        .fs-cta__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; z-index: 0; }
        .fs-cta__m { display: none; }
        .fs-cta__d { font-size: 20px; font-weight: 800; }
        .fs-cta__m, .fs-cta__d { position: relative; z-index: 1; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,.5); }
        .fs-cta:disabled { filter: grayscale(1); }
        .fs-gift { display: none; }
        .fs-exp { display: block; margin: 0; text-align: center; font-size: 14px; font-weight: 700; text-shadow: 0 2px 6px rgba(0,0,0,.9); }
        .fs-rec .fs-cash__list { margin-top: 12px; max-height: 320px; }
        .fs-amt { margin: 12px; padding: 14px 16px 16px; box-sizing: border-box; border-radius: 16px; background: linear-gradient(135deg, rgba(38, 38, 45, .92), rgba(26, 26, 34, .92)); border: 1px solid var(--vp-border); backdrop-filter: blur(6px); }
        .fs-amt__top { display: flex; align-items: center; justify-content: space-between; }
        .fs-amt small { display: block; font-size: 14px; color: var(--vp-muted); }
        .fs-amt b { display: block; margin-top: 4px; font-size: 26px; font-weight: 800; color: var(--vp-primary); }
        .fs-amt__top span { height: 36px; line-height: 36px; padding: 0 18px; border-radius: 999px; background: rgba(255, 255, 255, .1); font-size: 14px; font-weight: 600; cursor: pointer; }
        .fs-amt__bar { height: 8px; margin-top: 12px; border-radius: 999px; background: rgba(255, 255, 255, .12); overflow: hidden; }
        .fs-amt__bar i { display: block; height: 100%; border-radius: 999px; background: var(--vp-grad); transition: width .6s ease; }
        .fs-amt__tip { margin: 12px 0 0; font-size: 14px; font-weight: 600; }
        .fs-amt__tip em { font-style: normal; color: var(--vp-primary); }
        .fs-amt__tip strong { color: #ffd978; }
        .fs-amt__inv { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 48px; margin-top: 14px; border: 0; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
        .fs-win__card { overflow: hidden; }
        .fs-cash { position: relative; width: min(92vw, 420px); max-height: 86vh; padding: 28px 16px 16px; box-sizing: border-box; display: flex; flex-direction: column; text-align: center; border-radius: 24px; background: linear-gradient(180deg, #1f3a35, #151a1d 55%); border: 1px solid rgba(255, 255, 255, .12); animation: fs-pop .45s cubic-bezier(.2, 1.3, .4, 1); }
        .fs-cash__x { position: absolute; right: 14px; top: 14px; width: 32px; height: 32px; border: 0; border-radius: 50%; background: rgba(255, 255, 255, .15); color: #fff; font-size: 14px; cursor: pointer; }
        .fs-cash__t { margin: 0 0 16px; font-size: 18px; font-weight: 700; }
        .fs-cash--p { text-align: left; }
        .fs-cash--p .fs-cash__t { text-align: center; }
        .fs-rules { margin: 0; padding: 0 4px 8px 22px; overflow-y: auto; font-size: 14px; line-height: 1.6; color: #d7dde0; }
        .fs-rules li { margin-bottom: 10px; }
        .fs-rec__ic { flex: none; width: 40px; height: 40px; object-fit: contain; }
        .fs-bar__b { flex: none; width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid rgba(255, 255, 255, .18); background: rgba(10, 24, 30, .78); color: #fff; cursor: pointer; }
        .fs-bar { gap: 10px; }
        .fs-more-m { display: flex; justify-content: flex-end; margin: 4px 12px 0; position: relative; z-index: 3; }
        .fs-more-m span { display: inline-flex; align-items: center; height: 32px; padding: 0 14px; border-radius: 999px; background: rgba(10, 24, 30, .78); border: 1px solid rgba(255, 255, 255, .18); font-size: 13px; font-weight: 700; cursor: pointer; }
        .fs-cash__h { margin: 0; font-size: 17px; font-weight: 600; color: var(--vp-muted); }
        .fs-cash__amt { display: block; margin: 8px 0 14px; font-size: 32px; font-weight: 800; color: var(--vp-primary); }
        .fs-cash .fs-amt__bar { margin: 0 8px; }
        .fs-cash__tip { margin: 12px 0 16px; font-size: 14px; font-weight: 600; }
        .fs-cash__tip em { font-style: normal; color: var(--vp-primary); }
        .fs-cash__inv { width: calc(100% - 16px); margin: 0 8px; height: 54px; font-size: 17px; }
        .fs-cash__exp { margin: 12px 0 14px; font-size: 14px; font-weight: 600; color: var(--vp-muted); }
        .fs-cash__list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; min-height: 0; }
        .fs-cash__row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: rgba(255, 255, 255, .07); text-align: left; }
        .fs-cash__av { flex: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-style: normal; font-weight: 800; color: #fff; }
        .fs-cash__who { flex: 1; min-width: 0; }
        .fs-cash__who strong { display: block; font-size: 14px; }
        .fs-cash__who small { display: block; margin-top: 2px; font-size: 11px; color: var(--vp-muted); }
        .fs-cash__a { font-size: 16px; font-weight: 800; }
        .fs-plabel { position: absolute; left: 50%; top: 14.5%; width: 34%; text-align: center; font-size: 10px; font-weight: 800; line-height: 1.1; color: #fff; text-shadow: 0 1px 3px #000, 0 0 6px rgba(0,0,0,.9); white-space: nowrap; pointer-events: none; }
        .fs-win { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, .72); animation: fs-fade .25s ease-out; }
        .fs-win__card { position: relative; width: min(86vw, 340px); padding: 32px 20px 24px; box-sizing: border-box; text-align: center; border-radius: 20px; background: linear-gradient(180deg, #1f3a3a, #121a1d); border: 1px solid rgba(255, 215, 120, .35); animation: fs-pop .6s cubic-bezier(.2, 1.4, .4, 1); }
        .fs-win__rays { position: absolute; left: 50%; top: 105px; width: 300px; height: 300px; margin: -150px 0 0 -150px; background: repeating-conic-gradient(rgba(255, 220, 130, .22) 0 10deg, transparent 10deg 20deg); border-radius: 50%; -webkit-mask-image: radial-gradient(circle, #000 20%, transparent 70%); mask-image: radial-gradient(circle, #000 20%, transparent 70%); animation: fs-spin 12s linear infinite; pointer-events: none; }
        .fs-win__img { position: relative; width: 150px; animation: fs-bump 1.2s ease-in-out infinite; }
        .fs-win__sub { position: relative; min-height: 20px; margin: 8px 0 0; color: var(--vp-muted); font-size: 14px; }
        .fs-win__t { position: relative; margin: 4px 0 18px; font-size: 30px; font-weight: 800; color: #ffd978; text-shadow: 0 2px 8px rgba(0,0,0,.6); }
        .fs-win__ok { position: relative; width: 100%; height: 44px; border: 0; border-radius: 12px; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer; }
        @keyframes fs-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fs-pop { from { transform: scale(.2); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes fs-spin { to { transform: rotate(360deg) } }
        @keyframes fs-bump { 50% { transform: scale(1.08) } }
        /* 舞台背景随转盘舞台缩放：底座中心对准背景里的圆形平台 */
        .fs { overflow-x: clip; background: #06141a; }
        .fs::before { background: none; }
        .fs-bg { position: absolute; left: -20%; top: -61.4%; width: 140%; z-index: -1; pointer-events: none; -webkit-mask-image: linear-gradient(#000 78%, transparent); mask-image: linear-gradient(#000 78%, transparent); }
        .fs-bg img { position: static; display: block; width: 100%; }
        .fs-rec { margin: 12px; padding: 12px; border-radius: 16px; background: #26262d; }
          .fs-rec__tabs { display: flex; padding: 4px; gap: 4px; border-radius: 10px; background: #1a1a22; }
          .fs-rec__tabs span { flex: 1; height: 40px; line-height: 40px; text-align: center; border-radius: 8px; font-weight: 600; color: var(--vp-muted); cursor: pointer; }
          .fs-rec__tabs span.on { background: #34343c; color: var(--vp-primary); }
          .fs-rec__empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 0 32px; color: var(--vp-muted); font-size: 14px; }
          .fs-rec__empty img { width: 96px; object-fit: contain; filter: grayscale(1) brightness(.6); opacity: .6; }

        /* ---- 网页端 ≥768（推断：自定义骨架，手机宽度居中） ---- */
        .fs-dk { display: none; }
        @media (min-width: 768px) {
          .fs { max-width: 1110px; margin: 0 auto; padding: 24px 0 40px; background: transparent; position: relative; }
          .fs::before { content: ''; position: absolute; left: 0; right: 0; top: -24px; bottom: -40px; z-index: -1; border-radius: 24px; background: radial-gradient(ellipse at 50% 45%, rgba(120, 60, 200, .55), rgba(30, 14, 60, .6) 55%, transparent 80%); pointer-events: none; }
          .fs { background: transparent; overflow-x: clip; }
          .fs::before { display: none; }
          .fs-gift { display: block; width: 60px; height: 60px; }
          .fs-dk__t { flex: 1 1 0; }
          .fs-bg { left: -70.5%; top: -18.7%; width: 241%; }
          .fs-base { width: 184%; }
          .fs-plabel { font-size: 15px; }
          .fs-stage { width: 460px; margin: 0 auto; aspect-ratio: auto; height: 520px; }
          .fs-cta { margin-top: -48px; }
          .fs-cta__bg { object-fit: fill; }
          .fs-cta__d { text-shadow: 0 2px 4px rgba(0,0,0,.4); }
          .fs-bar, .fs-more-m { display: none; }
          .fs-dk { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; position: relative; padding: 12px 16px; border-radius: 16px 16px 0 0; background: linear-gradient(180deg, rgba(6, 20, 26, .92), rgba(6, 20, 26, .6) 70%, transparent); }
          .fs-dk__t { flex: 1; margin: 0; font-size: 24px; font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,.9); }
          .fs-dk__btns { display: flex; gap: 8px; }
          .fs-dk__btns span, .fs-dk__more { display: inline-flex; align-items: center; height: 36px; padding: 0 16px; border-radius: 999px; background: rgba(10, 24, 30, .78); border: 1px solid rgba(255, 255, 255, .18); color: #fff; font-size: 14px; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,.8); cursor: pointer; }
          .fs-dk__more { margin-top: 4px; }
          .fs-hero { align-items: center; margin: 12px 0 0; }
          :global(.freespin_pg__fs-wheel) { width: 460px !important; height: 460px !important; border-radius: 50% !important; margin: 0 auto; }
          .fs-cta { width: 700px; max-width: 100%; height: 56px; line-height: 56px; margin-top: -40px; border-radius: 16px; background: none; box-shadow: none; color: #fff; font-size: 24px; font-weight: 800; position: relative; }
          .fs-cta__d { display: inline; }
          .fs-exp { display: block; margin: 12px 0 0; font-size: 16px; font-weight: 700; text-shadow: 0 2px 6px rgba(0,0,0,.9); }
          .fs-count, .fs-list { display: none; }
          .fs-amt { width: 700px; max-width: 100%; margin: 24px auto 0; padding: 18px 20px 20px; }
          .fs-amt b { font-size: 26px; }
          .fs-rec { display: block; width: 700px; max-width: 100%; margin: 16px auto 0; padding: 12px; box-sizing: border-box; border-radius: 16px; background: #26262d; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
