'use client'
// 推荐赚钱（对应 vp-web/app/pages/refer-earn.vue，版式/按钮/动效对齐参考站 /refer-earn）。
// 概览取自 post('/api/web/promo/refer')，领取走 referClaim，邀请按钮复制邀请链接。
// 七个页签（邀请 / 我的数据 / 全部数据 / 直属下线数据 / 存款奖金 / 佣金 / 记录）：下划线滑动；邀请页含等级轮播、收益说明、邀请横幅、推荐团队图、两张比例表、FAQ 折叠。
// 图片全部是留空的占位框（SkImg 不带 src），由你自己放图。
// ?state=: 空 = 有数据（访客时为访客态）| none 无下线 | guest 访客 | loading 加载中
import { Suspense, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import { useLayout } from '@/context/LayoutContext'
import { post } from '@/lib/api'
import { usePromoData } from '@/components/promo/usePromoData'
import { cx, fmtStr } from '@/components/promo/util'
import { commissionRows, DEPOSIT_RATIOS, EXP_NEED, referText } from '@/lib/referContent'
import SkImg from '@/components/ui/SkImg'
import { avatarImg } from '@/lib/assets'
import IconTile from '@/components/ui/IconTile'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'

export default function Page() {
  return <Suspense fallback={null}><ReferEarnPage /></Suspense>
}

interface ReferSummary { code: string, claimable: string, downlines: { id: number, nickname: string, amount: string }[] }
const MEDAL = (n: number) => `/assets/vip/medal-${Math.max(1, Math.min(5, n))}.webp`
const MAX_REWARD = '6115.66'
// 团队图里各成员的头像（第几张 avatar）
const AV: Record<string, number> = { A1: 2, A2: 3, B1: 4, C1: 5, C2: 6, D1: 7 }

/** 把文案里的金额 / 百分比标成橙色 */
function hl(text: string): ReactNode[] {
  return text.split(/(MYR [\d.,]+|[\d.]+%)/).map((s, i) => (i % 2 ? <em key={i} className="re-hl">{s}</em> : s))
}

function Chev() {
  return (
    <svg className="re-chev" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
      <path d="M4 14l10-8 10 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 22l10-8 10 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
    </svg>
  )
}

function ReferEarnPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t, lang } = useLanguage()
  const x = referText(lang)
  const { loggedIn, user } = useAuth()
  const { back, enterLogin, enterRegister } = useGate()
  const { showToast } = useLayout()
  const guest = st === 'guest' || (st === '' && !loggedIn)
  const none = st === 'none'
  const { data, error, reload } = usePromoData<ReferSummary>('/api/web/promo/refer')
  const loading = st === 'loading' || (data === null && !error && !guest)
  const downlines = none ? [] : data?.downlines ?? []

  const [tab, setTab] = useState(0)
  const [lv, setLv] = useState(0)
  const [cat, setCat] = useState(0)
  const [period, setPeriod] = useState(1)
  const [faq, setFaq] = useState(0)

  // 页签下划线：量当前页签的位置，用 transform 滑过去
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [line, setLine] = useState<{ l: number, w: number }>({ l: 0, w: 0 })
  useLayoutEffect(() => {
    const el = tabRefs.current[tab]
    if (el) setLine({ l: el.offsetLeft, w: el.offsetWidth })
  }, [tab, lang, loading, error])
  useEffect(() => {
    const on = () => { const el = tabRefs.current[tab]; if (el) setLine({ l: el.offsetLeft, w: el.offsetWidth }) }
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [tab])

  const claim = () => {
    if (guest) { enterLogin('header'); return }
    post('/api/web/promo/referClaim')
      .then(() => { showToast(t('refer.claimOk')); reload() })
      .catch(() => showToast(t('refer.claimFail')))
  }
  const share = () => {
    if (guest) { enterLogin('header'); return }
    const url = `${window.location.origin}/register?ref=${data?.code ?? ''}`
    navigator.clipboard?.writeText(url).then(() => showToast(t('refer.copied')), () => showToast(t('refer.copyFail')))
  }

  const rows = commissionRows(cat)
  const today = new Date()
  const dateText = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`

  const teamCard = (tag: string, tone: string, title: string, lines: Array<[string, string, 'g' | 'y']>, cls?: string) => (
    <div className={cx('re-tc', cls)}>
      <span className="re-tav"><SkImg src={avatarImg(AV[tag] ?? 1)} w={36} h={36} round label="" /><i className={`re-tag re-tag--${tone}`}>{tag}</i></span>
      <div className="re-tt"><b>{title}</b>{lines.map(([k, v, c]) => <small key={k}>{k}<span className={c === 'g' ? 're-g' : 're-y'}>{v}</span></small>)}</div>
    </div>
  )

  const statGrid = (head: string) => (
    <>
      <h3 className="re-sh">{head}</h3>
      <div className="re-stats">
        {x.stats.map((s, i) => (
          <div key={s} className="re-stat"><small>{s}</small><b className={cx(i === 8 && 're-y')}>{i < 3 ? '0' : 'MYR 0.00'}</b></div>
        ))}
      </div>
      <h3 className="re-sh">{x.dash}</h3>
      <div className="re-dash">
        {x.dashCards.map((c) => (
          <div key={c.h} className="re-dc">
            <header><span>{c.h}</span><i aria-hidden="true">›</i></header>
            <div className="re-dcb">{c.cols.map((k, i) => <div key={k}><small>{k}</small><b className={cx(c.h === x.dashCards[3].h && 're-y')}>{c.vals[i]}</b></div>)}</div>
          </div>
        ))}
      </div>
    </>
  )

  const emptyPanel = (rowsData?: ReactNode) => (
    <>
      <div className="re-filter">
        <span className="re-date">{dateText} - {dateText}<i aria-hidden="true">⌄</i></span>
        <label className="re-search"><i aria-hidden="true">⌕</i><input type="text" placeholder={x.searchPh} /></label>
      </div>
      {rowsData ?? (
        <div className="re-none">
          <SkImg src="/assets/mascot/fox-sad.webp" className="re-sad" w={140} h={140} radius={0} label="" />
          <p>{x.noData}</p>
        </div>
      )}
    </>
  )

  return (
    <div className={`re${guest ? ' re--guest' : ''}`}>
      {/* 页内顶栏（移动端）：标题 + 钱包占位（访客显示登录） */}
      <header className="re-bar">
        <span className="re-back" role="button" tabIndex={0} aria-label="back" onClick={back}>‹</span>
        <h1 className="re-title">{t('refer.title')}</h1>
        {!guest ? <span className="re-wallet"><small>{t('refer.balance')}</small><b>MYR 0.00</b></span> : (
          <span className="re-acts">
            <span className="re-login" role="button" tabIndex={0} onClick={() => enterLogin('header')}>{t('refer.login')}</span>
            <span className="re-reg" role="button" tabIndex={0} onClick={() => enterRegister('header')}>{t('refer.register')}</span>
          </span>
        )}
      </header>

      <h1 className="re-h">{t('refer.title')}</h1>
      <nav className="re-tabs" role="tablist">
        {Array.from({ length: 7 }, (_, i) => (
          <button key={i} ref={(el) => { tabRefs.current[i] = el }} type="button" role="tab" aria-selected={tab === i} className={cx('re-tab', tab === i && 'on')} onClick={() => setTab(i)}>{t(`refer.tabName${i + 1}`)}</button>
        ))}
        <i className="re-line" style={{ transform: `translateX(${line.l}px)`, width: line.w }} />
      </nav>

      {!guest && error ? <SkStatus kind="error" h={300} className="refer_earn_pg__re-status" onRetry={reload} /> : null}
      {!guest && !error && loading ? <div className="refer_earn_pg__re-status"><SkBox state={t('status.loading')} h={300} /></div> : null}

      {!error && !loading ? (
        <div className="re-main" key={tab}>
          {tab === 0 ? (
            <>
              {/* 可领取 */}
              <section className="re-claim">
                <div className="re-cl">
                  <b>{t('refer.claimable')}</b>
                  <strong>MYR {fmtStr(data?.claimable ?? '0.00')}</strong>
                </div>
                <span className="re-ic" aria-hidden="true">{(['coins', 'bonus', 'star'] as const).map((n) => <IconTile key={n} name={n} size={28} radius={6} />)}</span>
                <button type="button" className="re-claimbtn" disabled={!data || data.claimable === '0.00'} onClick={claim}>{t('refer.claim')}</button>
              </section>

              {/* 舞台：等级轮播 + 三项收益 + 邀请横幅 */}
              <section className="re-stage">
                <div className="re-sw" style={{ '--i': lv } as CSSProperties}>
                  <div className="re-swt">
                    {EXP_NEED.map((need, i) => (
                      <div key={i} className={cx('re-lvc', i === 0 && 'on')}>
                        <div className="re-lvm">
                          <SkImg src={MEDAL(i + 1)} w={64} h={64} radius={0} label="" />
                          <i className="re-lvn">{t('refer.levelName', { n: i + 1 })}</i>
                        </div>
                        <div className="re-lvp">
                          <b>{i === EXP_NEED.length - 1 ? 'Lv 9 » Max' : `Lv ${i + 1} » Lv ${i + 2}`}</b>
                          <i className="re-lvbar"><u style={{ width: i === 0 ? '0%' : '0%' }} /></i>
                          <small>0.00/ {need} {t('refer.expLabel')}</small>
                        </div>
                        {i === 0 ? <span className="re-cur">{t('refer.levelNow')}</span> : null}
                      </div>
                    ))}
                  </div>
                  {lv > 0 ? <button type="button" className="re-arr re-arr--l" aria-label="prev" onClick={() => setLv((n) => Math.max(0, n - 1))}>‹</button> : null}
                  {lv < EXP_NEED.length - 1 ? <button type="button" className="re-arr re-arr--r" aria-label="next" onClick={() => setLv((n) => Math.min(EXP_NEED.length - 1, n + 1))}>›</button> : null}
                </div>

                <div className="re-earn">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="re-earn__i">
                      <span className="re-pad"><SkImg src={`/assets/refer/earn-${n}.webp`} w={120} h={130} radius={0} label="" /></span>
                      <span className="re-et">{hl(t(`refer.earn${n}`))}</span>
                    </div>
                  ))}
                </div>

                <div className="re-inv">
                  <div className="re-invt">{x.inviteTop}</div>
                  <strong className="re-invm">MYR {MAX_REWARD}</strong>
                  <button type="button" className="re-invb" onClick={share}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="6" cy="12" r="3" fill="currentColor" /><circle cx="18" cy="6" r="3" fill="currentColor" /><circle cx="18" cy="18" r="3" fill="currentColor" /><path d="M8.5 10.7l7-3.4M8.5 13.3l7 3.4" stroke="currentColor" strokeWidth="2" /></svg>
                    {x.inviteNow}
                  </button>
                </div>
              </section>

              {/* 推荐团队 */}
              <section className="re-sec">
                <h2 className="re-st"><i className="re-sti" aria-hidden="true">☺</i>{x.teamTitle}</h2>
                <p className="re-sd">{x.teamSub}</p>
                <div className="re-tc re-tc--you">
                  <span className="re-tav re-tav--you"><SkImg src={avatarImg(user?.avatar ?? 1)} w={52} h={52} round label="" /><i className="re-tag re-tag--you">{x.you}</i></span>
                  <div className="re-tt">
                    <b>{x.agentLevel} <img src={MEDAL(1)} alt="" className="re-mini" /> Lv 1</b>
                    <small>{x.teamRule}</small><small>{x.slotRule}</small><small>{x.fishRule}</small>
                    <small>{x.totalComm}<span className="re-y">95.65</span></small>
                    <small>{x.totalExp}<span className="re-g">195,500</span></small>
                  </div>
                </div>
                <div className="re-arrows"><Chev /><Chev /></div>
                <div className="re-tg">
                  {teamCard('A1', 'a', x.betSlot('5000'), [[x.commGen, '(5k/10k)*35=17.5', 'y'], [x.expEarned, '5,000', 'g']])}
                  {teamCard('A2', 'a2', x.betFish('15,000'), [[x.commGen, '(15k/10k)*35=52.5', 'y'], [x.expEarned, '15,000', 'g']])}
                </div>
                <div className="re-arrows re-arrows--l"><Chev /></div>
                <div className="re-tg">
                  {teamCard('B1', 'b', x.betSlot('10,000'), [[x.commGen, '(10k/10k)*10=10', 'y'], [x.expEarned, '10,000', 'g']])}
                </div>
                <div className="re-arrows re-arrows--l"><Chev /></div>
                <div className="re-tg">
                  {teamCard('C1', 'c', x.betSlot('50,000'), [[x.commGen, '(50k/10k)*3=15', 'y'], [x.expEarned, '50,000', 'g']])}
                  {teamCard('C2', 'c2', x.betFish('2,000'), [[x.commGen, '(2k/10k)*3=0.6', 'y'], [x.expEarned, '2,000', 'g']])}
                </div>
                <div className="re-arrows re-arrows--l"><Chev /></div>
                <div className="re-tg">
                  {teamCard('D1', 'd', x.betSlot('500'), [[x.commGen, '(500/10k)*1=0.05', 'y'], [x.expEarned, '500', 'g']])}
                </div>
                <div className="re-arrows re-arrows--l"><Chev /></div>
                <div className="re-tg re-tg--e">
                  <div className="re-tc re-tc--flat">
                    <span className="re-tav"><SkImg src={avatarImg(8)} w={36} h={36} round label="" /><i className="re-tag re-tag--e">E1</i></span>
                    <div className="re-tt"><b>{x.betAll('10,000')}</b><small>{x.expEarned}<span className="re-g">10,000</span></small></div>
                  </div>
                  <ul className="re-inf">
                    <li>{x.infNote[0]}</li><li>{x.infNote[1]}</li><li>{x.infNote[2]}</li><li>{x.infNote[3]} <span className="re-g">100,000</span></li>
                  </ul>
                  <div className="re-tc re-tc--flat">
                    <span className="re-tav"><SkImg src={avatarImg(1)} w={36} h={36} round label="" /><i className="re-tag re-tag--n">∞</i></span>
                    <div className="re-tt"><b>{x.betAll('3,000')}</b><small>{x.expEarned}<span className="re-g">3,000</span></small></div>
                  </div>
                  <div className="re-brk"><b>{x.infRight[0]}</b><b>{x.infRight[1]}</b><span className="re-g">{x.infRight[2]}</span><span className="re-g">{x.infRight[3]}</span></div>
                </div>
                <ul className="re-bl">
                  {x.bullets.map((b, i) => <li key={i}>{b.map(([s, g], j) => (g ? <span key={j} className="re-g">{s}</span> : s))}</li>)}
                </ul>
              </section>

              {/* 存款奖金表 */}
              <section className="re-sec">
                <h2 className="re-st"><i className="re-sti" aria-hidden="true">⇩</i>{x.depTitle}</h2>
                <p className="re-sd re-sd--b">{x.depSub}</p>
                <div className="re-card">
                  <table className="re-tb">
                    <thead><tr><th>{x.depLevel}</th><th>{x.depRatio}</th></tr></thead>
                    <tbody>
                      {DEPOSIT_RATIOS.map((r, i) => (
                        <tr key={r} className={i === 0 ? 'on' : ''}><td><span className="re-lc"><img src={MEDAL(i + 1)} alt="" />Lv {i + 1}</span></td><td>{r}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="re-note">{x.depNote}<span className="re-y">MYR 20.39</span>.</p>
                </div>
              </section>

              {/* 投注佣金表 */}
              <section className="re-sec">
                <h2 className="re-st"><i className="re-sti" aria-hidden="true">✪</i>{x.comTitle}</h2>
                <p className="re-sd re-sd--b">{x.comSub}</p>
                <div className="re-card">
                  <h4 className="re-ch">{x.comRate}</h4>
                  <div className="re-chips" role="tablist">
                    {x.comCats.map((c, i) => <button key={c} type="button" role="tab" aria-selected={cat === i} className={cx('re-chip', cat === i && 'on')} onClick={() => setCat(i)}>{c}</button>)}
                  </div>
                  <table className="re-tb re-tb--4" key={cat}>
                    <thead><tr><th>{x.comLevel}</th><th>TeamA (/10k)</th><th>TeamB (/10k)</th><th>TeamC (/10k)</th><th>TeamD (/10k)</th></tr></thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className={i === 0 ? 'on' : ''}><td><span className="re-lc"><img src={MEDAL(i + 1)} alt="" />Lv {i + 1}</span></td>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="re-note">{x.comNote}</p>
                </div>
              </section>

              {/* FAQ */}
              <section className="re-sec">
                <h2 className="re-st"><i className="re-sti" aria-hidden="true">?</i>{x.faqTitle}</h2>
                <div className="re-faq">
                  {x.faq.map((f, i) => (
                    <div key={f.q} className={cx('re-fi', faq === i && 'on')}>
                      <button type="button" className="re-fq" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}>
                        <span>{f.q}</span><i aria-hidden="true">⌄</i>
                      </button>
                      <div className="re-fa"><div><p>{f.a}</p></div></div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          {tab === 1 ? (
            <>
              <div className="re-per">{x.period.map((p, i) => <button key={p} type="button" className={cx('re-pb', period === i && 'on')} onClick={() => setPeriod(i)}>{p}</button>)}</div>
              {statGrid(x.teamData)}
            </>
          ) : null}
          {tab === 2 ? (
            <>
              <div className="re-per">{x.period.map((p, i) => <button key={p} type="button" className={cx('re-pb', period === i && 'on')} onClick={() => setPeriod(i)}>{p}</button>)}</div>
              {statGrid(x.allTeamData)}
            </>
          ) : null}
          {tab === 3 ? emptyPanel(downlines.length ? (
            <div className="re-dl">
              {downlines.map((d) => (
                <div key={d.id} className="re-dr"><SkImg src={avatarImg(d.id)} w={40} h={40} round label="" /><b>{d.nickname}</b><span className="re-y">MYR {fmtStr(d.amount)}</span></div>
              ))}
            </div>
          ) : undefined) : null}
          {tab >= 4 ? emptyPanel() : null}
        </div>
      ) : null}

      <style jsx global>{`
        .re { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; padding-bottom: 82px; box-sizing: border-box; }
        .re-h, .re-ic { display: none; }
        .re-hl { font-style: normal; color: #ff9a3d; }
        .re-g { color: #3ddc84; font-weight: 700; }
        .re-y { color: #f2c75c; font-weight: 700; }

        /* ---- 顶栏（移动） ---- */
        .re-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .re-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .re-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }
        .re-wallet { display: flex; align-items: center; gap: 8px; height: 31px; padding: 0 12px; border-radius: 16px; background: #2a2d33; }
        .re-wallet small { color: #8d8d92; font-size: 12px; } .re-wallet b { font-size: 13px; color: var(--vp-primary); }
        .re-acts { display: flex; gap: 8px; margin-left: auto; }
        .re-login, .re-reg { display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: 76px; height: 32px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
        .re-login { border: 1px solid var(--vp-primary); color: var(--vp-primary); }
        .re-reg { background: var(--vp-grad); color: var(--vp-on-primary); }
        :global(.refer_earn_pg__re-status) { margin: 12px; }

        /* ---- 页签：下划线滑动 ---- */
        .re-tabs { position: relative; display: flex; height: 41px; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid #2c2e34; }
        .re-tabs::-webkit-scrollbar { display: none; }
        .re-tab { flex: none; border: 0; background: none; padding: 0 12px; height: 40px; font-family: inherit; font-size: 14px; font-weight: 500; color: #a0a3ab; cursor: pointer; white-space: nowrap; transition: color .25s ease; }
        .re-tab:hover { color: #fff; }
        .re-tab.on { color: #3ddc84; }
        .re-line { position: absolute; left: 0; bottom: 0; height: 2px; border-radius: 2px; background: #3ddc84; box-shadow: 0 0 12px 2px rgba(61, 220, 132, .55); transition: transform .3s ease, width .3s ease; }

        .re-main { animation: re-in .35s ease-out; padding-top: 14px; }
        @keyframes re-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

        /* ---- 可领取 ---- */
        .re-claim { position: relative; display: flex; align-items: center; justify-content: space-between; min-height: 108px; padding: 16px 20px; box-sizing: border-box; border-radius: 16px; border: 1px solid rgba(255, 255, 255, .1); background: linear-gradient(100deg, #16272b 0%, #1b3036 55%, #16222f 100%); overflow: hidden; }
        .re-cl b { display: block; font-size: 15px; font-weight: 500; color: #aeb2bb; }
        .re-cl strong { display: block; margin-top: 8px; font-size: 26px; font-weight: 700; }
        .re-ic { display: flex; position: absolute; right: 20px; top: 12px; gap: 8px; }
        .re-claimbtn { align-self: flex-end; width: 128px; height: 40px; border: 0; border-radius: 999px; background: linear-gradient(180deg, #4fd39a, #2f9a6a); color: #0b2a1b; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; transition: transform .15s ease, filter .2s ease; }
        .re-claimbtn:hover:not(:disabled) { filter: brightness(1.12); }
        .re-claimbtn:active:not(:disabled) { transform: scale(.96); }
        .re-claimbtn:disabled { opacity: .75; cursor: default; }

        /* ---- 舞台 ---- */
        .re-stage { position: relative; margin-top: 18px; padding: 24px 0 28px; border-radius: 20px; background: radial-gradient(ellipse at 50% 0%, rgba(60, 90, 190, .28), transparent 60%), radial-gradient(ellipse at 50% 55%, rgba(20, 150, 170, .2), transparent 55%), #14172a; overflow: hidden; }
        .re-sw { --cw: 388px; position: relative; overflow: hidden; padding: 6px 0 4px; }
        .re-swt { display: flex; gap: 32px; padding-left: calc((100% - var(--cw)) / 2); transform: translateX(calc(var(--i) * (var(--cw) + 32px) * -1)); transition: transform .45s cubic-bezier(.16, 1, .3, 1); }
        .re-lvc { position: relative; flex: none; width: var(--cw); height: 114px; display: flex; align-items: center; gap: 12px; padding: 0 12px; box-sizing: border-box; border-radius: 12px; border: 2px solid #34406b; background: linear-gradient(135deg, #1d2548, #151a36); opacity: .75; transition: opacity .3s ease; }
        .re-lvc.on { border-color: #3fa86a; opacity: 1; }
        .re-lvm { position: relative; width: 92px; flex: none; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .re-lvn { padding: 2px 14px; border-radius: 4px; background: linear-gradient(180deg, #3a4a8e, #2a3770); color: #cfd8ff; font-size: 12px; font-style: normal; font-weight: 600; }
        .re-lvp { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 10px 10px; border-radius: 8px; background: rgba(40, 58, 110, .55); }
        .re-lvp b { font-size: 14px; color: #7fb4ff; }
        .re-lvbar { display: block; width: 100%; height: 14px; border-radius: 4px; border: 1px solid #4a6c9b; background: #0a0d20; overflow: hidden; }
        .re-lvbar u { display: block; height: 100%; background: linear-gradient(90deg, #3ddc84, #19d3d8); }
        .re-lvp small { font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; }
        .re-cur { position: absolute; right: -2px; top: -2px; padding: 4px 10px; background: #19d3d8; color: #05262b; font-size: 13px; font-weight: 700; border-radius: 0 10px 0 6px; }
        .re-arr { position: absolute; top: 50%; width: 36px; height: 36px; margin-top: -18px; border: 0; background: none; color: #19d3d8; font-size: 34px; line-height: 1; cursor: pointer; z-index: 2; animation: re-nudge 1.4s ease-in-out infinite; text-shadow: 0 0 10px rgba(25, 211, 216, .7); }
        .re-arr--r { right: 4px; } .re-arr--l { left: 4px; animation-name: re-nudge-l; }
        @keyframes re-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        @keyframes re-nudge-l { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-5px); } }

        .re-earn { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 28px; padding: 28px 16px 8px; background: linear-gradient(180deg, transparent, rgba(25, 211, 216, .08)); border-top: 1px solid rgba(25, 211, 216, .25); }
        .re-earn__i { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; font-size: 14px; font-weight: 500; line-height: 1.35; }
        .re-pad { display: flex; animation: re-float 3.6s ease-in-out infinite; }
        .re-earn__i:nth-child(2) .re-pad { animation-delay: .5s; } .re-earn__i:nth-child(3) .re-pad { animation-delay: 1s; }
        @keyframes re-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

        .re-inv { position: relative; width: min(530px, calc(100% - 32px)); margin: 32px auto 0; padding: 40px 16px 20px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 14px; border-radius: 22px; border: 3px solid #8c6a3a; background: linear-gradient(180deg, #25307a 0%, #1a2150 60%, #151a3e 100%); box-shadow: 0 0 0 2px #3a3f78 inset, 0 10px 30px rgba(0, 0, 0, .5); }
        .re-invt { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); padding: 6px 26px; border-radius: 6px; background: linear-gradient(180deg, #3b49b0, #27307f); border: 2px solid #8c6a3a; color: #bfc9ff; font-size: 15px; font-style: italic; font-weight: 700; white-space: nowrap; }
        .re-invm { font-size: 52px; line-height: 1.1; font-weight: 800; letter-spacing: 1px; background: linear-gradient(180deg, #ffe28a, #f2a93b); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 3px 6px rgba(0, 0, 0, .5)); animation: re-pulse 2.8s ease-in-out infinite; }
        @keyframes re-pulse { 0%, 100% { filter: drop-shadow(0 3px 6px rgba(0, 0, 0, .5)); } 50% { filter: drop-shadow(0 0 14px rgba(255, 200, 80, .7)); } }
        .re-invb { position: relative; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 64px; border: 3px solid #d8a85a; border-radius: 999px; background: linear-gradient(180deg, #8aff6a, #2fc96a); color: #0b1f6b; font-family: inherit; font-size: 20px; font-weight: 800; letter-spacing: .5px; cursor: pointer; overflow: hidden; transition: transform .15s ease, filter .2s ease; }
        .re-invb::after { content: ''; position: absolute; top: 0; bottom: 0; left: -40%; width: 30%; background: linear-gradient(100deg, transparent, rgba(255, 255, 255, .55), transparent); transform: skewX(-18deg); animation: re-shine 3.2s ease-in-out infinite; }
        @keyframes re-shine { 0%, 50% { left: -40%; } 100% { left: 130%; } }
        .re-invb:hover { filter: brightness(1.08); } .re-invb:active { transform: scale(.97); }

        /* ---- 区块标题 ---- */
        .re-sec { margin-top: 44px; }
        .re-st { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 20px; font-weight: 600; }
        .re-sti { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; font-style: normal; font-size: 16px; border: 2px solid #fff; border-radius: 50%; }
        .re-sd { margin: 14px 0 12px; color: #a0a3ab; font-size: 12px; font-weight: 600; }
        .re-sd--b { margin: 18px 0 14px; }

        /* ---- 推荐团队 ---- */
        .re-tc { display: flex; gap: 14px; padding: 16px 18px; box-sizing: border-box; border-radius: 14px; border: 1px solid #3a3f45; background: linear-gradient(135deg, #2f4a45 0%, #2a2f35 60%, #25282e 100%); transition: transform .2s ease, border-color .2s ease; }
        .re-tc:hover { transform: translateY(-2px); border-color: #4a6a60; }
        .re-tc--you { background: linear-gradient(135deg, #33564c 0%, #2b3a3a 60%, #272b31 100%); }
        .re-tc--flat { background: #2a2d33; padding: 10px 16px; align-items: center; }
        .re-tav { position: relative; flex: none; display: flex; flex-direction: column; align-items: center; }
        .re-tag { margin-top: -8px; min-width: 38px; padding: 0 8px; border-radius: 999px; font-style: normal; font-size: 11px; font-weight: 700; line-height: 16px; text-align: center; color: #fff; border: 1px solid rgba(255, 255, 255, .3); }
        .re-tag--you { background: #a8782a; min-width: 48px; } .re-tag--a { background: #6a3fa0; } .re-tag--a2 { background: #a03f8a; } .re-tag--b { background: #5b3a9a; }
        .re-tag--c { background: #3a5f8a; } .re-tag--c2 { background: #3a6a9a; } .re-tag--d { background: #2f8a72; } .re-tag--e { background: #3a6f78; } .re-tag--n { background: #666; }
        .re-tt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .re-tt b { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
        .re-tt small { font-size: 12px; font-weight: 600; color: #a0a3ab; line-height: 1.4; }
        .re-mini { width: 20px; height: 20px; object-fit: contain; }
        .re-arrows { display: flex; justify-content: space-around; padding: 6px 0; color: #1f8a5f; }
        .re-arrows--l { justify-content: flex-start; padding-left: 12%; }
        .re-chev { animation: re-up 1.6s ease-in-out infinite; }
        .re-arrows .re-chev:nth-child(2) { animation-delay: .3s; }
        @keyframes re-up { 0%, 100% { transform: translateY(0); opacity: .7; } 50% { transform: translateY(-4px); opacity: 1; } }
        .re-tg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .re-tg > .re-tc:only-child { grid-column: 1; }
        .re-tg--e { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
        .re-inf { grid-column: 1; margin: 0; padding: 0 0 0 18px; font-size: 11px; font-weight: 600; color: #c4c8d0; line-height: 1.5; }
        .re-tg--e > .re-tc--flat:nth-of-type(2), .re-tg--e > .re-tc--flat:nth-of-type(3) { grid-column: 1; }
        .re-brk { grid-column: 2; grid-row: 2 / span 2; align-self: center; margin-left: 24px; padding: 8px 12px; border-left: 2px solid #1f8a5f; border-radius: 0 12px 12px 0; display: flex; flex-direction: column; gap: 2px; font-size: 11px; line-height: 1.4; color: #fff; }
        .re-brk b { font-weight: 700; }
        .re-bl { margin: 24px 0 0; padding-left: 20px; color: #a0a3ab; font-size: 14px; line-height: 1.6; }
        .re-bl li { margin-bottom: 6px; }
        .re-bl .re-g { font-weight: 500; }

        /* ---- 表格卡 ---- */
        .re-card { padding: 14px; border-radius: 16px; border: 1px solid #343a3f; background: linear-gradient(160deg, #2b2f33 0%, #25282c 60%, #232a38 100%); }
        .re-ch { margin: 4px 2px 12px; font-size: 14px; font-weight: 500; color: #c4c8d0; }
        .re-tb { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border-radius: 10px; font-size: 12px; font-weight: 700; animation: re-in .3s ease-out; }
        .re-tb th { padding: 10px 8px; background: #3a3d41; color: #aeb2bb; font-weight: 600; text-align: center; }
        .re-tb td { height: 32px; padding: 0 8px; background: #36393d; text-align: center; border-top: 1px solid #1f2125; border-left: 1px solid #1f2125; transition: background .2s ease; }
        .re-tb td:first-child { border-left: 0; text-align: left; padding-left: 20%; }
        .re-tb tbody tr:hover td { background: #424649; }
        .re-tb tr.on td { background: #25574a; }
        .re-tb--4 td:first-child { padding-left: 14px; white-space: nowrap; }
        .re-tb--4 th:first-child, .re-tb--4 td:first-child { width: 22%; }
        .re-lc { display: inline-flex; white-space: nowrap; align-items: center; gap: 8px; }
        .re-lc img { width: 22px; height: 22px; object-fit: contain; }
        .re-note { margin: 14px 4px 4px; padding-left: 14px; position: relative; font-size: 12px; font-weight: 600; color: #a0a3ab; line-height: 1.5; }
        .re-note::before { content: '•'; position: absolute; left: 0; }
        .re-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .re-chip { height: 28px; padding: 0 14px; border: 0; border-radius: 8px; background: #3a3d41; color: #aeb2bb; font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .2s ease, color .2s ease, transform .15s ease; }
        .re-chip:hover { background: #46494d; color: #fff; }
        .re-chip.on { background: #1f4a3a; color: #3ddc84; }
        .re-chip:active { transform: scale(.95); }

        /* ---- FAQ ---- */
        .re-faq { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
        .re-fi { border-radius: 14px; border: 1px solid #343a3f; background: #26282d; overflow: hidden; transition: background .25s ease; }
        .re-fi.on { background: #313338; }
        .re-fq { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 0 12px; min-height: 46px; border: 0; background: none; color: #fff; font-family: inherit; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; }
        .re-fq i { font-style: normal; font-size: 18px; color: #aeb2bb; transition: transform .3s ease; }
        .re-fi.on .re-fq i { transform: rotate(180deg); }
        .re-fa { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
        .re-fi.on .re-fa { grid-template-rows: 1fr; }
        .re-fa > div { overflow: hidden; }
        .re-fa p { margin: 0 12px; padding: 12px 0 14px; border-top: 1px solid #3f4348; color: #a0a3ab; font-size: 12px; font-weight: 600; line-height: 1.5; }

        /* ---- 数据页签 ---- */
        .re-per { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .re-per::-webkit-scrollbar { display: none; }
        .re-pb { flex: none; height: 32px; padding: 0 14px; border: 0; border-radius: 16px; background: #26282d; color: #a0a3ab; font-family: inherit; font-size: 14px; cursor: pointer; transition: background .2s ease, color .2s ease; }
        .re-pb:hover { color: #fff; }
        .re-pb.on { background: #123a2a; color: #3ddc84; box-shadow: 0 0 0 1px rgba(61, 220, 132, .25); }
        .re-sh { margin: 22px 0 12px; font-size: 16px; font-weight: 700; }
        .re-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .re-stat { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 62px; border-radius: 12px; border: 1px solid #343a3f; background: linear-gradient(180deg, #2f3236, #25272b); font-size: 12px; transition: transform .2s ease; }
        .re-stat:hover { transform: translateY(-2px); }
        .re-stat small { color: #a0a3ab; font-weight: 600; } .re-stat b { font-size: 14px; }
        .re-dash { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .re-dc { border-radius: 12px; border: 1px solid #343a3f; background: #25272b; overflow: hidden; }
        .re-dc header { display: flex; align-items: center; justify-content: space-between; height: 32px; padding: 0 16px; background: #34383c; color: #c4c8d0; font-size: 13px; font-weight: 600; }
        .re-dcb { display: grid; grid-template-columns: repeat(3, 1fr); padding: 14px 4px; }
        .re-dcb > div { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 12px; border-left: 1px solid #343a3f; }
        .re-dcb > div:first-child { border-left: 0; }
        .re-dcb small { color: #a0a3ab; font-weight: 600; } .re-dcb b { font-size: 13px; }

        .re-filter { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .re-date { display: inline-flex; align-items: center; gap: 8px; color: #aeb2bb; font-size: 16px; }
        .re-date i { font-style: normal; color: #fff; font-size: 18px; }
        .re-search { display: flex; align-items: center; gap: 8px; width: 220px; max-width: 100%; height: 32px; padding: 0 10px; box-sizing: border-box; border-radius: 8px; background: #34373c; color: #a0a3ab; transition: box-shadow .2s ease; }
        .re-search:focus-within { box-shadow: 0 0 0 1px #3ddc84; }
        .re-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; color: #fff; font-family: inherit; font-size: 13px; }
        .re-none { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 90px 0 60px; color: #a0a3ab; font-size: 13px; font-weight: 600; }
        .re-none p { margin: 0; }
        .re-sad img { filter: grayscale(1) brightness(.75); opacity: .65; object-fit: contain; }
        .re-dl { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .re-dr { display: flex; align-items: center; gap: 12px; height: 60px; padding: 0 14px; border-radius: 12px; background: #26282d; border: 1px solid #343a3f; }
        .re-dr b { flex: 1; font-size: 14px; }

        /* ---- 窄屏 ---- */
        @media (max-width: 767px) {
          .re-main { padding: 14px 12px 0; }
          .re-sw { --cw: 300px; }
          .re-earn { gap: 4px; padding: 24px 6px 8px; } .re-earn__i { font-size: 11px; } .re-earn__i .sk-img { width: 84px !important; height: 92px !important; }
          .re-invm { font-size: 30px; white-space: nowrap; }
          .re-tg { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; } .re-tg .re-tc { flex-direction: column; gap: 6px; padding: 10px; } .re-tg .re-tc--flat { flex-direction: row; } .re-tt b { font-size: 12px; } .re-tt small { font-size: 11px; }
          .re-tg--e { grid-template-columns: 1fr; } .re-brk { grid-column: 1; grid-row: auto; margin-left: 0; }
          .re-arrows--l { padding-left: 24px; }
          .re-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .re-dash { grid-template-columns: 1fr; }
          .re-tb td:first-child { padding-left: 8px; }
          .re-tb--4 { font-size: 11px; }
          .re-tb--4 th { padding: 8px 2px; font-size: 10px; }
        }

        /* ---- 网页端 ≥768：内容 888 居中 ---- */
        @media (min-width: 768px) {
          .re { background: transparent; max-width: 968px; margin: 0 auto; padding: 0 40px 40px; }
          .re-bar { display: none; }
          .re-h { display: block; margin: 0; padding-top: 24px; font-size: 24px; font-weight: 700; }
          .re-guest { display: none; }
          .re--guest .re-main { display: block; }
          .re-tabs { margin-top: 20px; overflow: visible; }
        }
        @media (prefers-reduced-motion: reduce) { .re-main, .re-pad, .re-arr, .re-invm, .re-invb::after, .re-chev, .re-tb, .re-line, .re-swt { animation: none !important; transition: none !important; } }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
