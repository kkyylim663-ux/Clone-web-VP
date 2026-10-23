'use client'
// 体育界面静态骨架（桌面端）：标题栏 / 图标工具栏 / 主分类 / 精选赛事横滑 / 项目标签 / 赛事卡片网格 / 赛事详情页。
// 路由沿用参考站做法：/sports?bt-path=<路径>。 /<项目> 项目页（高亮对应图标与标签），/<项目>/<国家>/<联赛>/<赛事> 赛事详情。
// 第三方体育平台接入前的占位；队名、赔率为自写示例。
import { useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { navPush } from '@/lib/navProgress'
import { LeagueIcon, SportChip, TeamCrest } from '@/components/promo/SportBadges'
import SportSvg, { SPORT_ICONS } from '@/components/promo/SportIcons'
import SportsHome from '@/components/promo/SportsHome'

const MAIN = ['popular', 'live', 'upcoming', 'predictions'] as const
const SPORTS = [
  { n: 1, slug: 'basketball-2' }, { n: 2, slug: 'soccer-1' }, { n: 3, slug: 'tennis-5' }, { n: 4, slug: 'dota-2-111' },
  { n: 5, slug: 'volleyball-23' }, { n: 6, slug: 'ice-hockey-4' }, { n: 7, slug: 'counter-strike-109' }, { n: 8, slug: 'baseball-3' }
]
const FEATURED = [1, 2, 3, 4, 5, 6]
const CARDS = [1, 2, 3, 4, 5, 6]

// 横向拖拽滚动（鼠标按住拖动；触控板 / 触屏用原生 overflow 滚动）
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const st = useRef({ down: false, x: 0, left: 0, moved: false })
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    st.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = st.current
    if (!s.down || !ref.current) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > 4) s.moved = true
    ref.current.scrollLeft = s.left - dx
  }
  const end = () => { st.current.down = false }
  // 拖动后抑制紧随其后的 click，避免拖动结束时误触发卡片跳转
  const onClickCapture = (e: React.MouseEvent) => { if (st.current.moved) { e.stopPropagation(); e.preventDefault(); st.current.moved = false } }
  return { ref, onPointerDown, onPointerMove, onPointerUp: end, onPointerLeave: end, onClickCapture }
}

export default function SportsSkeleton() {
  const { t } = useLanguage()
  const router = useRouter()
  const sp = useSearchParams()
  const btPath = sp.get('bt-path') ?? ''
  const segs = btPath.split('/').filter(Boolean)
  const isMatch = segs.length >= 4
  const curSport = segs[0] ?? ''
  const [main, setMain] = useState<(typeof MAIN)[number]>('popular')
  const s = (k: string, o?: Record<string, string | number>) => t(`sports.sk.${k}`, o)
  const go = (path: string) => navPush(router, path ? `/sports?bt-path=${encodeURIComponent(path)}` : '/sports')
  const openMatch = (sport: string, n: number) => go(`/${sport}/usa/league-${n}/match-${n}`)

  const dragFeat = useDragScroll()
  const dragIcons = useDragScroll()
  const dragSports = useDragScroll()

  const odds = (a: string, b: string, c?: string) => (
    <div className="odds">
      <span><i>1</i><b>{a}</b></span>
      {c ? <span><i>{s('draw')}</i><b>{c}</b></span> : null}
      <span><i>2</i><b>{b}</b></span>
    </div>
  )

  const head = (
    <>
      <header className="top">
        <h2>{s('title')}</h2>
        <span role="button" tabIndex={0} className="trophy" aria-label="trophy" onClick={() => go('/outrights')}><svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
            <defs>
              <radialGradient id="trophy-bg" cx="50%" cy="35%" r="75%"><stop offset="0" stopColor="#4a3a1c" /><stop offset="1" stopColor="#1f180b" /></radialGradient>
              <linearGradient id="trophy-cup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a0" /><stop offset=".5" stopColor="#f5b83a" /><stop offset="1" stopColor="#b8761a" /></linearGradient>
              <linearGradient id="trophy-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffd466" /><stop offset="1" stopColor="#9a5e12" /></linearGradient>
              <linearGradient id="trophy-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e3a232" /><stop offset="1" stopColor="#8a5510" /></linearGradient>
              <filter id="trophy-sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1" /></filter>
            </defs>
            <circle cx="18" cy="18" r="17" fill="url(#trophy-bg)" stroke="#8a6c2f" />
            <ellipse cx="18" cy="29.200" rx="7" ry="1.400" fill="#000" opacity=".5" filter="url(#trophy-sh)" />
            <path d="M11.500 11.500H8.500c0 3.200 1.600 5.200 3.800 5.600M24.500 11.500h3c0 3.200-1.600 5.200-3.800 5.600" fill="none" stroke="url(#trophy-side)" strokeWidth="1.700" strokeLinecap="round" />
            <path d="M11 9.500h14v4.500a7 7 0 0 1-14 0Z" fill="url(#trophy-cup)" />
            <path d="M22 10.500h3v3.600a7 7 0 0 1-4.200 6.400 7.800 7.800 0 0 0 1.200-6Z" fill="#7a4a0e" opacity=".35" />
            <path d="M13 11v3.500c0 2.200 1 3.800 2.600 4.700-1.400-1.200-2-2.900-2-4.700V11Z" fill="#fff" opacity=".55" />
            <ellipse cx="18" cy="9.700" rx="7" ry="1.200" fill="#fff3c4" opacity=".85" />
            <path d="M16.800 21h2.400v3.200h-2.400Z" fill="url(#trophy-side)" />
            <path d="M13.500 24.200h9l.8 1.800h-10.600Z" fill="url(#trophy-base)" />
            <path d="M12.700 26h10.600v1.800a.6.6 0 0 1-.6.6h-9.400a.6.6 0 0 1-.6-.6Z" fill="#8a5510" />
            <path d="M13.500 24.200h9" stroke="#ffe2a0" strokeWidth=".7" strokeLinecap="round" />
          </svg></span>
      </header>
      <div className="tools">
        <div className="icons" {...dragIcons} ref={dragIcons.ref}>
          {SPORT_ICONS.map((ic, i) => {
            const on = ic.key === 'home' ? btPath === '' : ic.path === `/${curSport}`
            return (
              <span key={ic.key} role="button" tabIndex={0} aria-label={ic.key} className={`ic${on ? ' on' : ''}${i === 3 ? ' sepr' : ''}`} onClick={() => go(ic.path)}><SportSvg icon={ic} /></span>
            )
          })}
        </div>
        <span role="button" tabIndex={0} className="ic" aria-label="search" onClick={() => go('/search')}><svg width="28" height="28" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>
      </div>
    </>
  )

  if (isMatch) {
    const sport = segs[0]
    const matchNo = (segs[3] ?? 'match-1').replace('match-', '')
    return (
      <div className="sp">
        {head}
        <div className="md">
          <button type="button" className="back" onClick={() => go(`/${sport}`)}>‹ {s('backList')}</button>
          <div className="live" {...dragFeat} ref={dragFeat.ref}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <span key={n} role="button" tabIndex={0} className={`lm${String(n) === matchNo ? ' on' : ''}`} onClick={() => openMatch(sport, n)}>
                <em>{s('live42')}</em><b>{s('home')} {n}</b><b>{s('away')} {n}</b>
              </span>
            ))}
          </div>
          <div className="mh">
            <p className="lg"><LeagueIcon n={Number(matchNo) || 1} size={16} />{s('league', { n: matchNo })}</p>
            <p className="st">{s('live42')}</p>
            <div className="tr"><TeamCrest n={Number(matchNo) || 1} size={36} /><b>{s('home')} {matchNo}</b></div>
            <div className="tr"><TeamCrest n={Number(matchNo) || 1} away size={36} /><b>{s('away')} {matchNo}</b></div>
          </div>
          <div className="mtabs">
            {['all', 'period', 'total', 'handicap', 'half'].map((k, i) => <span key={k} className={i === 0 ? 'on' : ''}>{s(`mt_${k}`)}{i === 0 ? ' 14' : ''}</span>)}
          </div>
          <div className="mk-grid">
            <section className="mkc"><h4>{s('winner')}</h4>{odds('1.01', '12.00')}</section>
            <section className="mkc"><h4>{s('total')}</h4>
              {['219.5', '224.5', '229.5'].map((v) => <div key={v} className="odds"><span><i>{s('over')} {v}</i><b>1.45</b></span><span><i>{s('under')} {v}</i><b>2.55</b></span></div>)}
            </section>
            <section className="mkc"><h4>{s('handicap')}</h4>{odds('1.85', '1.95')}{odds('2.10', '1.70')}</section>
            <section className="mkc"><h4>{s('half')}</h4>{odds('1.60', '2.30')}</section>
          </div>
        </div>
        <Styles />
      </div>
    )
  }

  // 我的投注 / 收藏（空态）：与参考站一致，标题 + 过滤胶囊 + 插画占位 + 「回到首页」
  if (btPath === '/bets' || btPath === '/favorites') {
    const bets = btPath === '/bets'
    return (
      <div className="sp">
        {head}
        <div className="pg">
          <h3 className="pgt"><span className="pgi"><SportSvg icon={SPORT_ICONS.find((i) => i.key === (bets ? 'bets' : 'star'))!} size={22} /></span>{bets ? s('myBets') : s('favTitle')}</h3>
          {bets ? (
            <div className="bf">
              <div className="bfp">
                {['b_all', 'b_open', 'b_won', 'b_lost', 'b_cash', 'b_cancel', 'b_refund'].map((k, i) => <span key={k} role="button" tabIndex={0} className={i === 1 ? 'on' : ''}>{s(k)}</span>)}
              </div>
              <span className="sel">{s('recent')} ⌄</span>
            </div>
          ) : null}
          <div className="empty">
            <img className="emp-img" src="/assets/mascot/fox-sad.webp" alt="" width={130} height={130} />
            <p className="e1">{bets ? s('noBets') : s('favEmpty')}</p>
            <p className="e2">{bets ? s('noBetsHint') : s('favHint')}</p>
            <button type="button" className="gh" onClick={() => go('')}>{s('goHome')}</button>
          </div>
          <p className="of"><span>{s('oddsFormat')}</span><span className="sel">{s('european')} ⌄</span></p>
        </div>
        <Styles />
      </div>
    )
  }

  // 直播 / 项目页：标题 + 项目胶囊（直播）或 联赛胶囊 +「直播 / 即将开始 / 冠军盘」（项目页）+ 赛事卡片
  const isLive = btPath === '/live'
  const isSportPage = segs.length === 1 && !['live', 'bets', 'favorites', 'live', 'outrights', 'search'].includes(segs[0]) && SPORT_ICONS.some((i) => i.path === btPath)
  if (isLive || isSportPage) {
    return (
      <div className="sp">
        {head}
        {isLive ? (
          <>
            <h3 className="pgt lv"><span className="dot" />{s('liveTitle')}</h3>
            <div className="sports" {...dragSports} ref={dragSports.ref}>
              {SPORTS.map(({ n, slug }, i) => (
                <span key={n} role="button" tabIndex={0} className={`sp-p${i === 1 ? ' on' : ''}`} onClick={() => go(`/${slug}`)}><SportChip slug={slug} size={18} />{s(`sp${n}`)}</span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="sports" {...dragSports} ref={dragSports.ref}>
              <span className="sp-p sel2">{s(`sp${(SPORTS.find((x) => x.slug === curSport)?.n) ?? 2}`)} <em>29</em> ⌄</span>
              <span className="sp-p on">{s('all')}</span>
              {[1, 2, 3, 4, 5, 6].map((n) => <span key={n} role="button" tabIndex={0} className="sp-p"><LeagueIcon n={n} size={18} />{s('leagueTag', { n })}</span>)}
            </div>
            <div className="main">
              <span className="mp on">{s('live')}</span><span className="mp">{s('upcomingT')}</span><span className="mp">{s('outrights')}</span>
            </div>
          </>
        )}
        <div className="grid">
          {CARDS.concat([7, 8, 9]).map((n) => (
            <article key={n} role="button" tabIndex={0} className="mc" onClick={() => openMatch(curSport || 'soccer-1', n)}>
              <p className="lg"><LeagueIcon n={n} size={14} /><span>{s('league', { n })}</span></p>
              <p className="tm2">{n % 3 === 0 ? s('live2') : s('live42')}</p>
              <div className="row"><TeamCrest n={n} size={26} /><span>{s('home')}</span></div>
              <div className="row"><TeamCrest n={n} away size={26} /><span>{s('away')}</span></div>
              <p className="mk">{s('winner')}</p>
              {odds('1.07', '2.55', '4.30')}
            </article>
          ))}
        </div>
        <Styles />
      </div>
    )
  }

  return (
    <div className="sp">
      {head}
      <SportsHome s={s} curSport={curSport} go={go} openMatch={openMatch} />
      <Styles />
    </div>
  )
}

function Styles() {
  return (
    <style jsx global>{`
      .sp { color: #fff; }
      .sp .top { display: flex; align-items: center; justify-content: space-between; height: 48px; padding: 0 20px; background: #21262f; border-radius: 16px 16px 0 0; }
      .sp h2 { margin: 0; font-size: 22px; font-weight: 700; }
      .sp .trophy { cursor: pointer; }
      .sp .tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 72px; padding: 0 20px; background: #2a3342; }
      .sp .icons { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; cursor: grab; user-select: none; }
      .sp .icons::-webkit-scrollbar, .sp .feat::-webkit-scrollbar, .sp .sports::-webkit-scrollbar, .sp .live::-webkit-scrollbar { display: none; }
      .sp .ic { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 10px; color: #dfe4f2; cursor: pointer; transition: background .15s ease; }
      .sp .ic:hover { background: rgba(255, 255, 255, .08); }
      .sp .ic.on { background: rgba(255, 255, 255, .16); color: #fff; }
      .sp .ic.sepr { margin-right: 14px; position: relative; }
      .sp .ic.sepr::after { content: ''; position: absolute; right: -11px; top: 8px; bottom: 8px; width: 1px; background: rgba(255, 255, 255, .25); }
      .sp .main { display: flex; gap: 12px; padding: 24px 20px 0; }
      .sp .mp { height: 48px; padding: 0 20px; display: inline-flex; align-items: center; border-radius: 999px; background: rgba(255, 255, 255, .06); font-size: 16px; font-weight: 600; color: #cfd4e6; cursor: pointer; }
      .sp .mp.on { background: rgba(255, 255, 255, .16); color: #fff; }
      .sp .feat { display: flex; gap: 20px; padding: 24px 20px 0; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; cursor: grab; user-select: none; }
      .sp .fc { flex: none; width: 450px; height: 255px; box-sizing: border-box; padding: 12px 10px 10px; border-radius: 16px; display: flex; flex-direction: column; scroll-snap-align: start; cursor: pointer; }
      .sp .fc0 { background: linear-gradient(135deg, #5a2a6e, #a02a6e); }
      .sp .fc1 { background: linear-gradient(135deg, #2a4a9e, #3a7ad0); }
      .sp .fc2 { background: linear-gradient(135deg, #7a2a5e, #c0306e); }
      .sp .lg { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin: 0; font-size: 14px; font-weight: 600; }
      .sp .lg em { font-style: normal; color: #9ff5c0; }
      .sp .tm { display: flex; align-items: center; gap: 10px; margin-top: 18px; font-size: 18px; font-weight: 700; }
      .sp .tm b { flex: 1; } .sp .tm .r { text-align: right; }
      .sp .mk { margin: auto 0 8px; text-align: center; font-size: 14px; color: rgba(255, 255, 255, .75); }
      .sp .odds { display: flex; gap: 6px; margin-bottom: 6px; }
      .sp .odds span { flex: 1; display: flex; align-items: center; justify-content: space-between; height: 48px; padding: 0 12px; border-radius: 8px; background: rgba(255, 255, 255, .15); }
      .sp .odds i { font-style: normal; font-size: 13px; color: rgba(255, 255, 255, .7); }
      .sp .odds b { font-size: 16px; }
      .sp .sports { display: flex; gap: 12px; padding: 24px 20px 0; overflow-x: auto; scrollbar-width: none; cursor: grab; user-select: none; }
      .sp .sp-p { flex: none; height: 40px; padding: 0 16px 0 10px; display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; background: rgba(255, 255, 255, .06); font-size: 16px; font-weight: 600; cursor: pointer; }
      .sp .sp-p.on { background: #0fbf6a; color: #fff; }
      .sp .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; padding: 24px 20px 32px; }
      .sp .mc { padding: 16px; border-radius: 16px; background: rgba(255, 255, 255, .05); cursor: pointer; }
      .sp .mc .lg { justify-content: flex-start; color: #aeb2bb; font-size: 14px; }
      .sp .tm2 { margin: 12px 0 8px; font-size: 14px; font-weight: 600; color: #aeb2bb; }
      .sp .row { display: flex; align-items: center; gap: 12px; height: 40px; font-size: 16px; font-weight: 600; }
      .sp .mc .mk { margin: 12px 0 8px; text-align: left; color: #aeb2bb; }
      .sp .mc .odds span { background: rgba(255, 255, 255, .08); }
      /* 赛事详情 */
      .sp .md { padding: 20px; }
      .sp .back { border: 0; background: rgba(255, 255, 255, .08); color: #fff; height: 36px; padding: 0 16px; border-radius: 999px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
      .sp .live { display: flex; gap: 10px; margin-top: 16px; overflow-x: auto; scrollbar-width: none; cursor: grab; user-select: none; }
      .sp .lm { flex: none; width: 190px; display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: 10px; background: rgba(255, 255, 255, .06); font-size: 13px; cursor: pointer; }
      .sp .lm.on { box-shadow: inset 0 0 0 1px #0fbf6a; background: rgba(15, 191, 106, .12); }
      .sp .lm em { font-style: normal; color: #9ff5c0; font-size: 12px; }
      .sp .mh { margin-top: 16px; padding: 16px 20px; border-radius: 14px; background: rgba(255, 255, 255, .05); }
      .sp .mh .lg { color: #aeb2bb; }
      .sp .st { margin: 6px 0 12px; color: #9ff5c0; font-size: 14px; font-weight: 600; }
      .sp .tr { display: flex; align-items: center; gap: 12px; height: 48px; font-size: 18px; }
      .sp .mtabs { display: flex; gap: 10px; margin-top: 20px; }
      .sp .mtabs span { height: 36px; padding: 0 16px; display: inline-flex; align-items: center; border-radius: 999px; background: rgba(255, 255, 255, .06); font-size: 14px; color: #cfd4e6; }
      .sp .mtabs .on { background: rgba(255, 255, 255, .16); color: #fff; font-weight: 600; }
      .sp .mk-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 16px; }
      .sp .mkc { padding: 16px; border-radius: 14px; background: rgba(255, 255, 255, .05); }
      .sp .mkc h4 { margin: 0 0 12px; font-size: 16px; }
      .sp .mkc .odds span { background: rgba(255, 255, 255, .08); }
      .sp .pg { padding: 20px; min-height: 420px; }
      .sp .pgt { display: flex; align-items: center; gap: 10px; margin: 0; padding: 20px 20px 0; font-size: 22px; }
      .sp .pg .pgt { padding: 0; }
      .sp .pgi { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #2f3340; color: #f5c451; }
      .sp .mh .lg { justify-content: flex-start; }
      .sp .emp-img { object-fit: contain; filter: grayscale(1) brightness(.75); opacity: .65; }
      .sp .sp-p .sbadge, .sp .sp-p svg { color: #c4c8d0; }
      .sp .pgt.lv .dot { width: 10px; height: 10px; border-radius: 50%; background: #ff4d4d; box-shadow: 0 0 0 4px rgba(255, 77, 77, .25); }
      .sp .bf { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; }
      .sp .bfp { display: flex; gap: 8px; }
      .sp .bfp span { height: 32px; padding: 0 14px; display: inline-flex; align-items: center; border-radius: 999px; background: rgba(255, 255, 255, .08); font-size: 13px; cursor: pointer; }
      .sp .bfp .on { background: #0fbf6a; color: #fff; }
      .sp .sel { height: 36px; padding: 0 14px; display: inline-flex; align-items: center; border-radius: 8px; background: rgba(255, 255, 255, .08); font-size: 13px; }
      .sp .sel2 { gap: 6px; }
      .sp .sel2 em { font-style: normal; font-size: 12px; color: #aeb2bb; }
      .sp .empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0 24px; text-align: center; }
      .sp .e1 { margin: 20px 0 6px; font-size: 18px; font-weight: 700; }
      .sp .e2 { margin: 0 0 20px; font-size: 14px; color: #8d93a0; }
      .sp .gh { height: 40px; padding: 0 28px; border: 0; border-radius: 999px; background: #0fbf6a; color: #fff; font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
      .sp .of { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 24px 0 8px; font-size: 12px; color: #8d93a0; letter-spacing: .08em; }
      @media (max-width: 1100px) { .sp .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      /* 手机：边距 12、卡片收窄、单列 */
      @media (max-width: 767px) {
        .sp .top { padding: 0 12px; border-radius: 0; }
        .sp h2 { font-size: 18px; }
        .sp .tools { padding: 0 12px; height: 60px; }
        .sp .fc { width: 300px; height: 229px; }
        .sp .grid { grid-template-columns: minmax(0, 1fr); }
      }
    `}</style>
  )
}
