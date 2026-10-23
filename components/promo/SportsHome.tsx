'use client'
// 体育首页（对照参考站）：热门 / 直播 / 即将开始 / 预测 胶囊 → 精选赛事横滑卡（蓝 / 粉 / 紫底 + 吉祥物淡化图）→ 项目胶囊 → 赛事卡片网格。
// 队名、联赛、赔率见 lib/mock/sportsData.ts；队徽为自绘占位（首字母圆章 / 球衣），第三方体育平台接入后换成接口图。
import { HScroll, useHScroll } from '@/components/ui/HScroll'
import SportSvg, { SPORT_ICONS } from '@/components/promo/SportIcons'
import { FEATURED, MATCHES, type Match, type Team } from '@/lib/mock/sportsData'

const PILLS = [
  { slug: 'basketball-2', icon: 'basketball', label: 'Basketball', n: 1 }, { slug: 'soccer-1', icon: 'soccer', label: 'Soccer', n: 2 },
  { slug: 'tennis-5', icon: 'tennis', label: 'Tennis', n: 3 }, { slug: 'dota-2-111', icon: 'dota', label: 'Dota 2', n: 4 },
  { slug: 'counter-strike-109', icon: 'counterstrike', label: 'Counter-Strike', n: 7 }, { slug: 'volleyball-23', icon: 'volleyball', label: 'Volleyball', n: 5 },
  { slug: 'ice-hockey-4', icon: 'icehockey', label: 'Ice Hockey', n: 6 }, { slug: 'badminton', icon: 'cricket', label: 'Badminton', n: 0 },
  { slug: 'baseball-3', icon: 'baseball', label: 'Baseball', n: 8 }
]
const ico = (key: string, size = 18) => { const i = SPORT_ICONS.find((x) => x.key === key); return i ? <SportSvg icon={i} size={size} /> : null }
const TONE_IMG = { blue: 'fox-wave', pink: 'fox-think', purple: 'fox-gift' } as const

function Crest({ t, size = 28 }: { t: Team, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="crest">
      <circle cx="16" cy="16" r="15" fill={t.c1} stroke={t.c2} strokeWidth="2" />
      <text x="16" y="20.5" textAnchor="middle" fontSize={t.abbr.length > 2 ? 10.5 : 12} fontWeight="800" fill={t.c2 === '#ffffff' || t.c2 === '#fdb927' || t.c2 === '#fec524' || t.c2 === '#febe10' ? t.c2 : '#fff'} stroke={t.c1 === '#ffffff' ? '#0e2240' : 'none'} strokeWidth=".4">{t.abbr}</text>
    </svg>
  )
}
function Shirt({ color, size = 34 }: { color: string, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="crest">
      <path d="M11 4 4 8l3 6 3-1.500V28h12V12.500L25 14l3-6-7-4c-.5 2-2.500 3.200-5 3.200S11.500 6 11 4Z" fill={color} stroke="rgba(0,0,0,.25)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

const Odds = ({ m, big }: { m: Match, big?: boolean }) => (
  <div className={`so${big ? ' big' : ''}`}>
    {m.odds.map((o) => <span key={o.k}><i>{o.k}</i><b>{o.v}</b></span>)}
  </div>
)

export default function SportsHome({ s, curSport, go, openMatch }: { s: (k: string) => string, curSport: string, go: (p: string) => void, openMatch: (sport: string, n: number) => void }) {
  const feat = useHScroll()
  const pills = useHScroll()
  const main = [
    { k: 'popular', on: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#f5a623"><path d="m3 8 4.500 4L12 5l4.500 7L21 8l-2 11H5Z" /></svg> },
    { k: 'live', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="2.200" fill="#e5484d" /><path d="M7.500 7.500a6.400 6.400 0 0 0 0 9M16.500 7.500a6.400 6.400 0 0 1 0 9M4.800 4.800a10.200 10.200 0 0 0 0 14.400M19.200 4.800a10.200 10.200 0 0 1 0 14.400" /></svg> },
    { k: 'upcoming', icon: <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#12a05a" /><path d="M12 7v5.500l3.500 2" stroke="#d9ffe9" strokeWidth="2" strokeLinecap="round" fill="none" /></svg> },
    { k: 'predictions', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#35b36b"><rect x="3" y="13" width="4" height="8" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="17" y="4" width="4" height="17" rx="1" /></svg> }
  ]
  return (
    <div className="sh">
      <div className="sh-main">
        {main.map((m) => (
          <span key={m.k} role="button" tabIndex={0} className={`mp${m.on ? ' on' : ''}`} onClick={() => go(`/${m.k}`)}>{m.icon}{s(m.k)}</span>
        ))}
      </div>

      <HScroll hs={feat} className="sh-feat">
        {FEATURED.map((m) => (
          <article key={m.id} role="button" tabIndex={0} className={`fc ${m.tone}`} onClick={() => openMatch(m.sport === 'soccer' ? 'soccer-1' : 'basketball-2', m.id)}>
            <img className="mas" src={`/assets/mascot/${TONE_IMG[m.tone]}.webp`} alt="" draggable={false} />
            <p className="lg"><span className="lgn">{ico(m.sport, 16)}{m.country}<em>›</em>{m.league}</span><span className="tm">{m.when}</span></p>
            <div className="vs">
              <div className="tt">{m.home.shirt ? <Shirt color={m.home.shirt} size={38} /> : <Crest t={m.home} size={34} />}<b>{m.home.name}</b></div>
              <div className="tt r">{m.away.shirt ? <Shirt color={m.away.shirt} size={38} /> : <Crest t={m.away} size={34} />}<b>{m.away.name}</b></div>
            </div>
            <p className="mk">{m.market}</p>
            <Odds m={m} big />
          </article>
        ))}
      </HScroll>

      <HScroll hs={pills} className="sh-pills">
        {PILLS.map((p) => (
          <span key={p.slug} role="button" tabIndex={0} className={`sp-p${(curSport || 'basketball-2') === p.slug ? ' on' : ''}`} onClick={() => go(`/${p.slug}`)}>{ico(p.icon, 20)}{p.label}</span>
        ))}
      </HScroll>

      <div className="sh-grid">
        {MATCHES.map((m) => (
          <article key={m.id} role="button" tabIndex={0} className="mc2" onClick={() => openMatch('basketball-2', m.id)}>
            <p className="lg2">{ico(m.sport, 16)}<span>{m.country}</span><em>›</em><span>{m.league}</span></p>
            <p className="wn"><span>{m.when}</span><Shirt color="#2aa7ff" size={18} /><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2aa7ff" strokeWidth="2.400" strokeLinecap="round"><path d="M5 8h14M5 12h14M5 16h9" /></svg></p>
            <div className="trow"><Crest t={m.home} size={26} /><b>{m.home.name}</b></div>
            <div className="trow"><Crest t={m.away} size={26} /><b>{m.away.name}</b></div>
            <p className="mk2">{m.market}</p>
            <div className="orow">
              {m.odds.map((o) => <span key={o.k} className="ob"><i>{o.k}</i><b>{o.v}</b></span>)}
              <span className="ob more" aria-label="more"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m6 9 6 7 6-7Z" /></svg></span>
            </div>
          </article>
        ))}
      </div>

      <style jsx global>{`
        .sh { padding-bottom: 32px; }
        .sh-main { display: flex; gap: 12px; padding: 20px 20px 0; }
        .sh .mp { height: 44px; padding: 0 18px; display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; background: #262b36; font-size: 16px; font-weight: 600; color: #aeb6c8; cursor: pointer; transition: background .2s, color .2s; }
        .sh .mp:hover { background: #303644; color: #fff; }
        .sh .mp.on { background: #3a3f4b; color: #fff; }
        .sh .sh-feat { gap: 20px; padding: 20px 20px 0; cursor: grab; }
        .sh .fc { position: relative; width: 405px; height: 229px; box-sizing: border-box; padding: 12px 10px 10px; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; color: #fff; cursor: pointer; }
        .sh .fc.blue { background: linear-gradient(135deg, #2f4fa8 0%, #4f4bbd 55%, #3a7bd0 100%); }
        .sh .fc.pink { background: linear-gradient(135deg, #7a2b6e 0%, #b02e6c 55%, #8a2a6a 100%); }
        .sh .fc.purple { background: linear-gradient(135deg, #5b2b7e 0%, #7a2e86 55%, #4a2b8e 100%); }
        .sh .fc .mas { position: absolute; left: 50%; top: -6%; height: 108%; width: auto; transform: translateX(-50%); opacity: .22; mix-blend-mode: screen; pointer-events: none; }
        .sh .fc > * { position: relative; }
        .sh .lg { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin: 0; font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, .85); }
        .sh .lgn { display: inline-flex; align-items: center; gap: 6px; min-width: 0; white-space: nowrap; }
        .sh .lgn em { font-style: normal; opacity: .6; }
        .sh .lg .tm { color: #fff; opacity: .9; white-space: nowrap; }
        .sh .vs { display: flex; justify-content: space-between; margin-top: 22px; }
        .sh .tt { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; max-width: 48%; }
        .sh .tt.r { align-items: flex-end; text-align: right; }
        .sh .tt b { font-size: 15px; font-weight: 700; line-height: 1.2; }
        .sh .mk { margin: auto 0 8px; text-align: center; font-size: 13px; color: rgba(255, 255, 255, .6); }
        .sh .so { display: flex; gap: 8px; }
        .sh .so span { flex: 1; display: flex; align-items: center; justify-content: space-between; height: 44px; padding: 0 10px; border-radius: 8px; background: rgba(255, 255, 255, .18); backdrop-filter: blur(2px); transition: background .2s; }
        .sh .so span:hover { background: rgba(255, 255, 255, .3); }
        .sh .so i { font-style: normal; font-size: 13px; color: rgba(255, 255, 255, .75); }
        .sh .so b { font-size: 15px; }
        .sh .sh-pills { gap: 10px; padding: 24px 20px 0; cursor: grab; }
        .sh .sp-p { height: 40px; padding: 0 16px 0 12px; display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; background: #262b36; font-size: 15px; font-weight: 600; color: #fff; cursor: pointer; white-space: nowrap; transition: background .2s; }
        .sh .sp-p:hover { background: #303644; }
        .sh .sp-p.on { background: #12b45b; }
        .sh .sh-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; padding: 20px 20px 0; }
        .sh .mc2 { padding: 16px 16px 14px; border-radius: 12px; background: #20242d; color: #fff; cursor: pointer; transition: background .2s; }
        .sh .mc2:hover { background: #262b36; }
        .sh .lg2 { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 13px; font-weight: 600; color: #8d97ab; }
        .sh .lg2 em { font-style: normal; opacity: .7; }
        .sh .wn { display: flex; align-items: center; gap: 8px; margin: 10px 0 14px; font-size: 13px; font-weight: 600; color: #8d97ab; }
        .sh .trow { display: flex; align-items: center; gap: 12px; height: 36px; font-size: 15px; }
        .sh .mk2 { margin: 18px 0 8px; font-size: 13px; font-weight: 600; color: #9aa4b8; }
        .sh .orow { display: flex; gap: 8px; }
        .sh .ob { flex: 1; display: flex; align-items: center; justify-content: space-between; height: 44px; padding: 0 12px; border-radius: 8px; background: #2c323e; transition: background .2s; }
        .sh .ob:hover { background: #38404f; }
        .sh .ob i { font-style: normal; font-size: 13px; color: #9aa4b8; }
        .sh .ob b { font-size: 14px; }
        .sh .ob.more { flex: none; width: 44px; justify-content: center; color: #cfd6e6; }
        .sh .crest { flex: none; display: block; }
        @media (max-width: 1100px) { .sh .sh-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 767px) {
          .sh .sh-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; padding: 16px 12px 0; }
          .sh .fc { width: 300px; height: 215px; }
          .sh .sh-main { gap: 8px; padding: 14px 12px 0; overflow-x: auto; scrollbar-width: none; }
          .sh .mp { height: 38px; padding: 0 14px; font-size: 14px; flex: none; }
          .sh .sh-feat { gap: 12px; padding: 14px 12px 0; }
          .sh .sh-pills { padding: 16px 12px 0; }
          .sh .so span { height: 40px; }
        }
      `}</style>
    </div>
  )
}
