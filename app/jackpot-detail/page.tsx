'use client'
// 奖池详情（对应 vp-web/app/pages/jackpot/detail.vue，参考站真实路径 /jackpot-detail?status=1&index=0）。
// 版式取自参考站手机截图（368 宽）：页内顶栏 → 公告条 → 轮次横幅（倒计时 + 奖池总额）→ 三个标签 → 前三名领奖台 → 4 名起列表 → 底部固定「去玩游戏」条。
// 排名数据为本站 mock（lib/mock/jackpotRank.ts）；图片位用占位，Logo/文案不取自参考站。?state=loading 显示加载骨架。
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'
import { avatarImg } from '@/lib/assets'
import Icon from '@/components/ui/Icon'
import { POOL_ART } from '@/lib/jackpotArt'
import { RANK_ROWS, RANK_POOL, RANK_GAMES } from '@/lib/mock/jackpotRank'

export default function Page() {
  return <Suspense fallback={null}><JackpotDetailPage /></Suspense>
}

const pad = (n: number) => String(n).padStart(2, '0')
// 距本地当天 24:00 的剩余时间（每日轮次），客户端每秒更新；服务端首渲染用 0 避免水合不一致
function useCountdown() {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => { const d = new Date(); const end = new Date(d); end.setHours(24, 0, 0, 0); setLeft(Math.max(0, Math.floor((end.getTime() - d.getTime()) / 1000))) }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])
  const s = left ?? 0
  return { h: pad(Math.floor(s / 3600)), m: pad(Math.floor((s % 3600) / 60)), s: pad(s % 60), pct: left === null ? 0 : 1 - left / 86400 }
}

// 隐藏身份头像：深色圆底 + 问号（自绘，不用参考站素材）
function Mystery({ size, className }: { size: number, className?: string }) {
  return (
    <span className={`jr-mys${className ? ' ' + className : ''}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }} aria-hidden="true">?</span>
  )
}

function JackpotDetailPage() {
  const sp = useSearchParams()
  const loading = sp.get('state') === 'loading'
  const { t } = useLanguage()
  const { back, go } = useGate()
  const { setShareOpen } = useLayout()
  const art = POOL_ART[sp.get('key') ?? 'A'] ?? POOL_ART.A
  const cd = useCountdown()
  const [tab, setTab] = useState<'rank' | 'games' | 'rules'>('rank')
  const mystery = t('jackpot.rd.mystery')
  const name = (n: string) => (n === '?' ? mystery : n)
  const top = [RANK_ROWS[1], RANK_ROWS[0], RANK_ROWS[2]] // 第 2 / 1 / 3 名，中间最高
  const rest = RANK_ROWS.slice(3)

  return (
    <div className="jr">
      <header className="jr-bar">
        <span className="jr-back" role="button" tabIndex={0} aria-label="back" onClick={back}>‹</span>
        <h1 className="jr-title">{t('jackpot.rd.title')}</h1>
        <span className="jr-pill" role="button" tabIndex={0} onClick={() => go('/jackpot-mybouns')}><Icon name="coins" size={16} />{t('jackpot.rd.bonus')}</span>
        <span className="jr-pill" role="button" tabIndex={0} onClick={() => setShareOpen(true)}><Icon name="share" size={16} />{t('jackpot.rd.share')}</span>
      </header>

      {loading ? <SkBox className="jackpot_detail_pg__jr-skel" state={t('status.loading')} h={420} radius={16} /> : (
        <>
          <div className="jr-notice"><Icon name="megaphone" size={14} className="jr-spk" /><span>{t('jackpot.rd.notice', { name: RANK_ROWS[2].name })}</span></div>

          <section className="jr-round">
            <i className="jr-art" style={{ backgroundImage: `url(${art.src})`, backgroundSize: art.size, backgroundPosition: art.pos }} /><i className="jr-tint" style={{ background: art.tint }} />
            <span className="jr-arrow l" aria-hidden="true">‹</span>
            <span className="jr-arrow r" aria-hidden="true">›</span>
            <div className="jr-info">
              <h2>{t('jackpot.rd.round')}</h2>
              <p className="jr-this">{t('jackpot.rd.thisRound')}</p>
              <div className="jr-cd">
                {[[cd.h, 'hours'], [cd.m, 'mins'], [cd.s, 'secs']].map(([v, k]) => <span key={k} className="jr-box"><b>{v}</b><small>{t(`jackpot.rd.${k}`)}</small></span>)}
              </div>
              <div className="jr-bar2"><i style={{ width: `${Math.round(cd.pct * 100)}%` }} /></div>
              <p className="jr-fin">{t('jackpot.rd.finishIn', { date: '12/31/2027' })}</p>
            </div>
            <div className="jr-pool"><small>{t('jackpot.rd.prizePool')}</small><b>MYR{RANK_POOL}</b></div>
          </section>

          <section className="jr-panel">
            <div className="jr-tabs">
              <span role="button" tabIndex={0} className={tab === 'rank' ? 'on' : ''} onClick={() => setTab('rank')}>{t('jackpot.rd.rankings')}</span>
              <span role="button" tabIndex={0} className={tab === 'games' ? 'on' : ''} onClick={() => setTab('games')}>{t('jackpot.rd.games', { n: RANK_GAMES })}</span>
              <span role="button" tabIndex={0} className={tab === 'rules' ? 'on' : ''} onClick={() => setTab('rules')}>{t('jackpot.rd.rules')}</span>
            </div>
            <span className="jr-hist" role="button" tabIndex={0}><Icon name="clock" size={14} />{t('jackpot.rd.history')}</span>

            {tab === 'rank' ? (
              <>
                <div className="jr-podium">
                  {top.map((r, i) => (
                    <div key={r.rank} className={`jr-pc p${r.rank}`}>
                      {r.name === '?' ? <Mystery size={56} className="jr-av" /> : <SkImg className="jackpot_detail_pg__jr-av" src={avatarImg(r.rank + i)} w={56} h={56} radius={999} label="" />}
                      <b className="jr-nm">{name(r.name)}</b>
                      <span className="jr-pts"><i className="jr-coin" />{r.points}</span>
                      <b className="jr-amt">MYR {r.amount}</b>
                      <span className="jr-pct">{r.pct}</span>
                    </div>
                  ))}
                </div>
                <div className="jr-list">
                  {rest.map((r) => (
                    <div key={r.rank} className="jr-row">
                      <span className="jr-no">{r.rank}</span>
                      {r.name === '?' ? <Mystery size={36} /> : <SkImg src={avatarImg(r.rank)} w={36} h={36} radius={999} label="" />}
                      <div className="jr-who"><b>{name(r.name)}</b><span className="jr-pts"><i className="jr-coin" />{r.points}</span></div>
                      <div className="jr-win"><b>MYR {r.amount}</b><span className="jr-pct">{r.pct}</span></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="jr-empty"><SkImg src="/assets/empty/empty-1.webp" w={102} h={102} radius={0} label="" /><p>{t('jackpot.rd.empty')}</p></div>
            )}
          </section>

          <div className="jr-cta">
            <span>{t('jackpot.rd.cta')}</span>
            <button type="button" className="jr-play" onClick={() => go('/casino')}>{t('jackpot.rd.play')}</button>
          </div>
        </>
      )}

      <style jsx global>{`
        .jr { position: relative; min-height: 100%; background: #14151b; color: #fff; font-size: 14px; padding-bottom: 96px; box-sizing: border-box; }
        .jr-bar { display: flex; align-items: center; gap: 8px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .jr-back { width: 24px; font-size: 28px; line-height: 1; cursor: pointer; }
        .jr-title { flex: 1; margin: 0; font-size: 16px; font-weight: 500; }
        .jr-pill { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; background: rgba(255, 255, 255, .12); font-size: 14px; font-weight: 600; cursor: pointer; }
        
        :global(.jackpot_detail_pg__jr-skel) { margin: 12px; width: calc(100% - 24px); }
        .jr-notice { display: flex; align-items: center; gap: 8px; height: 28px; padding: 0 12px; font-size: 12px; font-weight: 600; color: #e9e9ee; overflow: hidden; white-space: nowrap; }
        .jr-spk { flex: none; color: #f6c96a; }
        .jr-round { position: relative; height: 188px; margin: 0 12px; overflow: hidden; border-radius: 0; background: #1b1d27; }
        .jr-art, .jr-tint { position: absolute; inset: 0; display: block; background-repeat: no-repeat; }
        .jr-arrow { position: absolute; top: 50%; z-index: 3; width: 22px; height: 22px; margin-top: -26px; border-radius: 50%; background: rgba(0, 0, 0, .45); text-align: center; line-height: 20px; font-size: 18px; }
        .jr-arrow.l { left: 0; } .jr-arrow.r { right: 0; }
        .jr-info { position: relative; z-index: 2; padding: 6px 14px 0 20px; width: 62%; }
        .jr-info h2 { margin: 0; font-size: 17px; font-weight: 700; line-height: 20px; text-shadow: var(--vp-text-img-shadow); }
        .jr-this { display: inline-block; margin: 6px 0 4px; padding: 1px 6px; border-radius: 2px; background: rgba(255, 255, 255, .85); color: #333; font-size: 9px; font-weight: 700; }
        .jr-cd { display: flex; gap: 4px; }
        .jr-box { width: 40px; height: 38px; border-radius: 4px; background: rgba(20, 21, 27, .8); border: 1px solid rgba(255, 255, 255, .25); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .jr-box b { font-size: 17px; line-height: 18px; font-variant-numeric: tabular-nums; }
        .jr-box small { font-size: 7px; color: #b6bac4; }
        .jr-bar2 { height: 3px; margin-top: 8px; border-radius: 2px; background: rgba(255, 255, 255, .2); } .jr-bar2 i { display: block; height: 100%; border-radius: 2px; background: #2fe06f; }
        .jr-fin { margin: 4px 0 0; font-size: 9px; font-weight: 600; color: #cfd2da; }
        .jr-pool { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; height: 50px; background: linear-gradient(transparent, rgba(0, 0, 0, .75)); display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 6px; }
        .jr-pool small { font-size: 11px; font-weight: 700; color: #d8d8de; letter-spacing: .5px; }
        .jr-pool b { font-size: 20px; font-weight: 800; color: #f6c96a; font-variant-numeric: tabular-nums; text-shadow: 0 0 10px rgba(246, 201, 106, .35); }
        .jr-panel { position: relative; margin: 10px 8px 0; padding: 10px 8px 14px; border-radius: 22px 22px 0 0; background: linear-gradient(#2a2c36, #1b1c24); }
        .jr-tabs { display: flex; gap: 2px; padding: 3px; border-radius: 10px; background: rgba(0, 0, 0, .3); }
        .jr-tabs span { flex: 1; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 13px; font-weight: 700; color: #9ea3b0; cursor: pointer; }
        .jr-tabs span.on { background: #3a3d4a; color: #fff; }
        .jr-hist { position: absolute; right: 8px; top: 62px; z-index: 3; display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 8px; border-radius: 6px; background: rgba(255, 255, 255, .14); font-size: 12px; font-weight: 700; cursor: pointer; }
        .jr-podium { display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 6px; align-items: end; margin-top: 28px; }
        .jr-pc { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px 10px; border-radius: 12px; background: linear-gradient(#3a3f52, #23242d); }
        .jr-pc.p1 { padding-top: 20px; margin-bottom: 0; background: linear-gradient(#5a4a2a, #2b2519); border: 1px solid rgba(246, 201, 106, .45); }
        .jr-pc.p2, .jr-pc.p3 { margin-bottom: 0; }
        :global(.jackpot_detail_pg__jr-av) { margin-top: -26px; border: 2px solid rgba(255, 255, 255, .4); }
        .jr-mys { flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: radial-gradient(circle at 50% 35%, #3b4052, #15161c); border: 2px solid rgba(255, 255, 255, .35); color: #cfd4e2; font-weight: 800; box-sizing: border-box; text-shadow: 0 0 8px rgba(150, 170, 255, .6); }
        .jr-av { margin-top: -26px; }
        .jr-nm { font-size: 13px; font-weight: 700; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .jr-pts { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 11px; background: rgba(0, 0, 0, .4); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
        .jr-coin { width: 12px; height: 12px; border-radius: 50%; background: #6fd6d6; }
        .jr-amt { font-size: 13px; font-weight: 800; color: #f6c96a; font-variant-numeric: tabular-nums; }
        .jr-pct { padding: 1px 8px; border-radius: 8px; background: rgba(255, 255, 255, .12); font-size: 10px; font-weight: 600; color: #b6bac4; }
        .jr-list { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
        .jr-row { display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 10px; border-radius: 10px; background: linear-gradient(#34384a, #272a37); border: 1px solid rgba(255, 255, 255, .08); }
        .jr-no { width: 20px; text-align: center; font-size: 20px; font-weight: 700; color: #57d6a0; }
        .jr-who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .jr-who b { font-size: 12px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .jr-who .jr-pts { height: 16px; padding: 0 6px; font-size: 11px; background: transparent; padding-left: 0; }
        .jr-win { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .jr-win b { font-size: 13px; font-weight: 800; color: #f6c96a; font-variant-numeric: tabular-nums; }
        .jr-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0 40px; color: #8d8d92; font-size: 13px; }
        .jr-empty p { margin: 0; }
        .jr-cta { position: fixed; left: 50%; bottom: 8px; transform: translateX(-50%); z-index: 20; width: min(351px, calc(100% - 24px)); height: 52px; padding: 0 8px 0 12px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; border-radius: 12px; background: linear-gradient(90deg, #1d2c26, #223a2e); border: 1px solid rgba(255, 255, 255, .1); font-size: 12px; font-weight: 700; line-height: 1.25; }
        .jr-cta span { flex: 1; }
        .jr-play { flex: none; height: 34px; padding: 0 14px; border: 0; border-radius: 8px; background: var(--vp-grad-btn); color: var(--vp-on-btn); font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: var(--vp-glow); }
        /* 网页 ≥768：参考站手机宽度居中（推断） */
        @media (min-width: 768px) { .jr { max-width: 420px; margin: 0 auto; } }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
