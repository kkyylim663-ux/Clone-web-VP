'use client'
// 奖池页（对应 vp-web/app/pages/jackpot/index.vue）。奖池列表取自 post('/api/web/promo/jackpot')，倒计时每秒更新；到点后重新拉取。
// 奖池卡 → /jackpot-detail（参考站真实路径）。分享角标：复制分享链接（推断，不跳转）。
// 网页版顶栏右侧：奖金 → /jackpot-mybouns，分享 → /jackpot-share（参考站 1280 顶栏 Bonus / Share，json y82 h34 bg rgba(255,255,255,.1)）。
// ?state=: init（默认，有数据）| loading（金额为 —，倒计时变灰）| empty（榜单空）
import { Suspense, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { POOL_ART } from '@/lib/jackpotArt'
import { useGate } from '@/lib/useGate'
import { pickLang } from '@/lib/pickLang'
import type { JackpotPool } from '@/lib/mock/promo'
import { usePromoData } from '@/components/promo/usePromoData'
import { useNow, splitRemain } from '@/components/promo/useNow'
import { fmtStr } from '@/components/promo/util'
import IconTile from '@/components/ui/IconTile'
import { coverV, coverH, avatarImg, HOME } from '@/lib/assets'

export default function Page() {
  return <Suspense fallback={null}><JackpotPage /></Suspense>
}

// 与 Nuxt 骨架一致的卡片宽度（手机版奖池金额框宽）
const POOL_W: Record<string, number> = { A: 166, B: 153, C: 166 }
// 三张奖池卡的配图见 lib/jackpotArt.ts（奖池详情页的横幅用同一套）
const SPARKS = [0, 1, 2, 3, 4, 5]
// 参考 json：每张卡倒计时固定 4 格（天/时/分/秒）
const UNIT_KEYS = ['jackpot.unitDay', 'jackpot.unitHour', 'jackpot.unitMin', 'jackpot.unitSec'] as const

function JackpotPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? 'init'
  const { lang, t } = useLanguage()
  const { back, go, enterLogin, enterRegister } = useGate()
  const { setShareOpen } = useLayout()
  const { data, error, reload } = usePromoData<{ pools: JackpotPool[] }>('/api/web/promo/jackpot')
  const now = useNow()

  const pools = useMemo(() => data?.pools ?? [], [data])
  const isLoading = st === 'loading' || (data === null && !error)
  const isEmpty = st === 'empty'

  // 到点：重新拉取，服务端会给出下一周期的截止时刻
  useEffect(() => {
    if (now !== null && pools.some((p) => p.endAt <= now)) reload()
  }, [now, pools, reload])

  // 参考站：Share 弹出「Bonus Share」弹窗（叠在当前页上），不再复制链接或跳页
  const share = () => setShareOpen(true)

  // 倒计时：加载中或时钟未就绪时显示 00
  const cellsOf = (p: JackpotPool) => {
    const vals = now === null || isLoading ? ['00', '00', '00', '00'] : splitRemain(p.endAt - now, 4)
    return vals.map((v, n) => (
      <span key={n} className="box"><b key={v}>{v}</b><small>{t(UNIT_KEYS[n])}</small></span>
    ))
  }
  // 本轮已过时间比例（进度条宽度）；加载中为 0
  const pctOf = (p: JackpotPool): number => {
    if (now === null || isLoading) return 0
    const start = Date.parse(p.roundStart)
    const total = p.endAt - start
    return total > 0 ? Math.min(1, Math.max(0, (now - start) / total)) : 0
  }
  // 「结束于」只显示 MM-DD HH:mm（UTC），避免手机宽度下换行
  const finishOf = (p: JackpotPool): string => p.finishAt.slice(5, 16).replace('T', ' ')
  const amtOf = (p: JackpotPool): string => (isLoading ? '—' : fmtStr(p.amount))
  const titleOf = (p: JackpotPool): string => pickLang(p.translations, lang)?.title ?? ''

  return (
    <div className="jp">
      {/* 手机版 */}
      <div className="jp-m">
        <div className="nav">
          <span className="back" onClick={back}>‹</span>
          <span className="ttl">{t('jackpot.title')}</span>
          <span className="sel">{t('jackpot.status')}</span>
          <span className="bo" role="button" tabIndex={0} onClick={() => enterLogin('header')}>{t('jackpot.login')}</span>
          <span className="bg" role="button" tabIndex={0} onClick={() => enterRegister('header')}>{t('jackpot.register')}</span>
        </div>
        <div className="mq"><IconTile className="jackpot_pg__mq-ic" name="megaphone" size={32} round solid tone="mint" /><i className="mq-text">{t('jackpot.marquee')}</i></div>

        {pools.map((p, i) => (
          <div key={p.key} className="card" onClick={() => go(`/jackpot-detail?key=${p.key}`)} style={{ top: `${109 + i * 222}px` }}>
            <div className="jp-art jp-art--m" style={{ animationDelay: (POOL_ART[p.key] ?? POOL_ART.A).delay }}>
              <i className="ar-bg" style={{ backgroundImage: `url(${(POOL_ART[p.key] ?? POOL_ART.A).src})` }} />
              <i className="ar-img" style={{ backgroundImage: `url(${(POOL_ART[p.key] ?? POOL_ART.A).src})`, backgroundSize: (POOL_ART[p.key] ?? POOL_ART.A).size, backgroundPosition: (POOL_ART[p.key] ?? POOL_ART.A).pos }} />
              <i className="ar-tint" style={{ background: (POOL_ART[p.key] ?? POOL_ART.A).tint }} />
              <i className="ar-sheen" style={{ animationDelay: (POOL_ART[p.key] ?? POOL_ART.A).delay }} />
            </div>
            <div className="ct">
              {Array.from({ length: p.lines }, (_, n) => (
                <i key={n} className="tl" style={{ width: n === 0 ? '200px' : '150px' }}>{n === 0 ? titleOf(p) : ''}</i>
              ))}
            </div>
            <div className="pool"><span className="ptag">{t('jackpot.prizeTag')}</span><span className="amt">{amtOf(p)}</span></div>
            <div className="bot">
              <div className="bl">
                <span className="rd">{t('jackpot.roundLabel')}</span>
                <span className="fin">{t('jackpot.finishIn', { date: finishOf(p) })}</span>
              </div>
              <div className="cdw">
                <div className={`cd${isLoading ? ' dim' : ''}`}>{cellsOf(p)}</div>
                <div className="pbar"><i style={{ width: `${pctOf(p) * 100}%` }} /></div>
              </div>
            </div>
            {p.share ? <span className="share" role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); share() }}>{t('jackpot.share')}</span> : null}
          </div>
        ))}

        {isEmpty ? <div className="empty">{t('jackpot.emptyBoard')}</div> : null}
      </div>

      {/* 网页版 */}
      <div className="jp-d">
        <div className="jh">
          <span className="jt">{t('jackpot.title')}</span>
          <span className="sel">{t('jackpot.status')}</span>
          <span className="hb a" role="button" tabIndex={0} onClick={() => go('/jackpot-mybouns')}>{t('jackpot.navBonus')}</span>
          <span className="hb b" role="button" tabIndex={0} onClick={() => setShareOpen(true)}>{t('jackpot.share')}</span>
        </div>
        <div className="jmq"><IconTile className="jackpot_pg__mq-ic" name="megaphone" size={40} round solid tone="mint" />
          <div className="jmq-win"><div className="jmq-tr"><span>{t('jackpot.marquee')}</span><span>{t('jackpot.marquee')}</span></div></div>
        </div>

        <div className="jgrid">
          {pools.map((p, i) => (
            <div key={p.key} className="dcard" style={{ animationDelay: `${i * 90}ms` }} onClick={() => go(`/jackpot-detail?key=${p.key}`)}>
              <div className="jp-art">
                <i className="ar-bg" style={{ backgroundImage: `url(${(POOL_ART[p.key] ?? POOL_ART.A).src})` }} />
                <i className="ar-img" style={{ backgroundImage: `url(${(POOL_ART[p.key] ?? POOL_ART.A).src})`, backgroundSize: (POOL_ART[p.key] ?? POOL_ART.A).size, backgroundPosition: (POOL_ART[p.key] ?? POOL_ART.A).pos, animationDelay: (POOL_ART[p.key] ?? POOL_ART.A).delay }} />
                <i className="ar-tint" style={{ background: (POOL_ART[p.key] ?? POOL_ART.A).tint }} />
                <i className="ar-sheen" style={{ animationDelay: (POOL_ART[p.key] ?? POOL_ART.A).delay }} />
                {SPARKS.map((s) => <i key={s} className={`ar-sp sp${s}`} style={{ animationDelay: `${s * 0.7 + i * 0.4}s` }} />)}
              </div>
              <i className="dtl">{titleOf(p)}</i>
              <div className="dpool" style={{ width: `${POOL_W[p.key] ?? 166}px` }}><span className="ptag">{t('jackpot.prizeTag')}</span><span className="amt">{amtOf(p)}</span></div>
              <div className="dbot">
                <div className="bl">
                  <span className="rd">{t('jackpot.roundLabel')}</span>
                  <span className="fin">{t('jackpot.finishIn', { date: finishOf(p) })}</span>
                </div>
                <div className="cdw">
                  <div className={`cd${isLoading ? ' dim' : ''}`}>{cellsOf(p)}</div>
                  <div className="pbar"><i style={{ width: `${pctOf(p) * 100}%` }} /></div>
                </div>
              </div>
              {p.share ? <span className="dshare" role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); share() }}>{t('jackpot.share')}</span> : null}
            </div>
          ))}
        </div>

        {isEmpty ? <div className="jempty">{t('jackpot.emptyBoard')}</div> : null}
      </div>

      <style jsx global>{`
        .jp { font-size: 14px; color: #fff; }
        .pl, .rd { color: #c4c8d0; font-size: 12px; }
        .amt { color: var(--vp-primary); font-weight: 700; font-size: 18px; }
        .tl { display: block; height: 18px; margin-bottom: 4px; border-radius: 4px; background: #5b6068; font-style: normal; font-size: 12px; line-height: 18px; padding: 0 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box; }
        .box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 0; border-radius: 4px; background: #2e3038; color: #fff; }
        .box b { font-size: 15px; line-height: 16px; font-weight: 700; }
        .box small { font-size: 9px; line-height: 10px; color: var(--vp-muted); font-weight: 400; white-space: nowrap; }
        .cd { display: flex; gap: 4px; }
        .cd.dim .box { opacity: 0.35; }
        /* 奖池金额胶囊：外框同参考 json（rgba(255,255,255,.1)，圆角 8），内部标签为主色描边胶囊 */
        .ptag { display: inline-flex; align-items: center; align-self: flex-start; height: 18px; padding: 0 8px; box-sizing: border-box; border: 1px solid var(--vp-primary); border-radius: 999px; color: var(--vp-primary); font-size: 10px; line-height: 16px; white-space: nowrap; }
        /* 本轮进度条：3px 主色，宽度 = 已过比例（pctOf） */
        .cdw { display: flex; flex-direction: column; gap: 4px; }
        .pbar { height: 3px; border-radius: 2px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
        .pbar i { display: block; height: 100%; background: var(--vp-primary); }
        .bl { display: flex; flex-direction: column; justify-content: center; gap: 2px; min-width: 0; }
        .fin { color: var(--vp-muted); font-size: 11px; line-height: 14px; white-space: nowrap; }
        .rb { display: block; width: 240px; height: 14px; border-radius: 4px; background: #4a4e57; }
        .rbtn { display: flex; align-items: center; justify-content: center; height: 40px; padding: 0 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.1); color: #fff; font-size: 14px; font-weight: 600; }
        .mq-bar { flex: 1; height: 12px; border-radius: 6px; background: #3a3d46; }
        .sel { display: flex; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: #fff; font-size: 12px; }
        .hb { display: flex; align-items: center; justify-content: center; height: 34px; border-radius: 8px; background: rgba(255, 255, 255, 0.1); font-size: 14px; cursor: pointer; }

        /* ---------- 手机版 ---------- */
        .jp-m { position: relative; height: 812px; overflow: hidden; background: #1a1a21; }
        .nav { position: absolute; left: 0; right: 0; top: 0; height: 55px; box-sizing: border-box; background: rgba(26, 26, 34, 0.3); }
        .nav > * { position: absolute; }
        .nav .back { left: 12px; top: 14px; font-size: 26px; line-height: 26px; cursor: pointer; }
        .nav .ttl { left: 50px; top: 16px; font-size: 17px; font-weight: 700; }
        .mq-text { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; font-style: normal; font-size: 13px; color: #fff; }
        .nav .sel { left: 113px; top: 15px; width: 76px; height: 24px; }
        .nav .bo { left: 203px; top: 11px; width: 76px; height: 32px; box-sizing: border-box; border: 1px solid var(--vp-primary); border-radius: 8px; color: var(--vp-primary); font-size: 13px; font-weight: 500; }
        .nav .bg { left: 287px; top: 11px; width: 76px; height: 32px; border-radius: 8px; background: var(--vp-grad); color: var(--vp-on-primary); font-size: 13px; font-weight: 500; }
        .nav .bo, .nav .bg { display: flex; align-items: center; justify-content: center; cursor: pointer; }
        /* 跑马灯胶囊：高 40、圆角 20、rgba(255,255,255,.05)（参考 json 375 marquee y63 h40 w351） */
        .mq { position: absolute; left: 12px; top: 63px; width: 351px; height: 40px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 0 8px 0 4px; border-radius: 20px; background: rgba(255, 255, 255, 0.05); }
        .card { position: absolute; left: 12px; width: 351px; height: 210px; overflow: hidden; border-radius: 8px; background: #23242b; cursor: pointer; }
        :global(.jackpot_pg__art) { position: absolute; left: 0; top: 0; }
        .ct { position: absolute; left: 17px; top: 27px; width: 300px; }
        /* 参考 json 375：金额框 x29 y196 → 卡内 left 17 top 87，w300 h46 */
        .pool { position: absolute; left: 17px; top: 87px; width: 300px; height: 46px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.1); }
        /* 参考 json 375：底栏 y257 h62 左右 pad 16，bg rgba(255,255,255,.1) */
        .bot { position: absolute; left: 0; right: 0; bottom: 0; height: 62px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: rgba(255, 255, 255, 0.1); }
        /* 4 格，每格 40×34（底栏内容区 46px 高：34 格 + 4 间距 + 3 进度条 = 41） */
        .card .box { width: 40px; height: 34px; }
        .share { position: absolute; right: 12px; top: 0; width: 61px; height: 26px; box-sizing: border-box; padding: 0 8px; display: flex; align-items: center; justify-content: center; border-radius: 0 0 8px 8px; background: #8b3fd6; color: #fff; font-size: 12px; cursor: pointer; }
        .empty { position: absolute; left: 12px; top: 775px; width: 351px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255, 255, 255, 0.05); color: #8d9099; font-size: 13px; }

        /* ---------- 网页版 ---------- */
        .jp-d { display: none; }
        @media (min-width: 768px) {
          .jp-m { display: none; }
          .jp-d { display: block; box-sizing: border-box; }
        }
        /* 桌面：外壳盒子已在 x=276、y=80（实测）；标题行需落在 y=82，上距 2px */
        @media (min-width: 1024px) {
          .jp-d { padding: 2px 0 0; }
        }
        .jh { display: flex; align-items: center; height: 36px; }
        .jt { width: 95px; font-size: 22px; font-weight: 700; line-height: 36px; }
        .jh .sel { width: 84px; height: 36px; }
        /* 参考 json 1280 顶栏：奖金 x1069 w85、分享 x1162 w82，y82 h34，间距 8 */
        .hb.a { width: 85px; margin-left: auto; }
        .hb.b { width: 82px; margin-left: 8px; }
        .jmq { display: flex; align-items: center; gap: 8px; box-sizing: border-box; height: 48px; margin-top: 18px; padding: 0 4px; border-radius: 60px; background: rgba(255, 255, 255, 0.05); }
        .jmq .mq-bar { height: 38px; border-radius: 60px; background: #1a1a1b; }
        .jgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
        .dcard { position: relative; height: 220px; overflow: hidden; border-radius: 16px; background: #22232b; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; animation: jp-in .5s cubic-bezier(.2, .8, .2, 1) both; }
        .dcard:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0, 0, 0, .5); }
        .dtl { position: absolute; left: 17px; top: 28px; width: 320px; font-style: normal; font-size: 22px; font-weight: 800; line-height: 28px; text-shadow: 0 2px 8px rgba(0, 0, 0, .6); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; z-index: 2; }
        .dpool, .dbot, .dshare { z-index: 2; }
        /* 配图：封面裁切 + 色调 + 缓慢推拉 + 扫光 + 飘动光点 */
        .jp-art { position: absolute; inset: 0; overflow: hidden; }
        .jp-art--m { inset: 0 0 auto 0; height: 208px; }
        .ar-bg { position: absolute; inset: -24px; background-size: cover; background-position: center; filter: blur(18px) saturate(1.25); }
        .ar-img { position: absolute; top: 0; bottom: 0; right: 0; width: 56%; background-repeat: no-repeat; transform-origin: 50% 40%; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 30%); mask-image: linear-gradient(90deg, transparent 0, #000 30%); animation: jp-kb 14s ease-in-out infinite alternate; }
        .ar-tint { position: absolute; inset: 0; }
        .ar-sheen { position: absolute; top: 0; bottom: 0; left: -40%; width: 30%; background: linear-gradient(100deg, transparent, rgba(255, 255, 255, .16), transparent); transform: skewX(-18deg); animation: jp-sheen 6.5s ease-in-out infinite; }
        .ar-sp { position: absolute; bottom: -6px; width: 3px; height: 3px; border-radius: 50%; background: #ffe9a8; box-shadow: 0 0 6px 2px rgba(255, 220, 130, .7); opacity: 0; animation: jp-spark 4.2s ease-in infinite; }
        .ar-sp.sp0 { left: 52%; } .ar-sp.sp1 { left: 60%; } .ar-sp.sp2 { left: 68%; } .ar-sp.sp3 { left: 76%; } .ar-sp.sp4 { left: 84%; } .ar-sp.sp5 { left: 92%; }
        @keyframes jp-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes jp-kb { from { transform: scale(1); } to { transform: scale(1.1) translate(-1.5%, -1%); } }
        @keyframes jp-sheen { 0%, 55% { left: -40%; } 100% { left: 130%; } }
        @keyframes jp-spark { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-150px); opacity: 0; } }
        @keyframes jp-tick { from { transform: translateY(-5px); opacity: .3; } to { transform: none; opacity: 1; } }
        @keyframes jp-glow { 0%, 100% { text-shadow: 0 0 0 rgba(53, 213, 109, 0); } 50% { text-shadow: 0 0 12px rgba(53, 213, 109, .7); } }
        @keyframes jp-marq { to { transform: translateX(-50%); } }
        @keyframes jp-shim { from { background-position: 0 0; } to { background-position: -200% 0; } }
        .box b { animation: jp-tick .35s ease-out; }
        .dpool .amt { animation: jp-glow 2.8s ease-in-out infinite; }
        .pbar i { background: linear-gradient(90deg, var(--vp-primary) 0%, #b6ffd2 50%, var(--vp-primary) 100%); background-size: 200% 100%; animation: jp-shim 2.4s linear infinite; }
        .jmq-win { flex: 1; min-width: 0; height: 38px; overflow: hidden; border-radius: 60px; background: #1a1a1b; display: flex; align-items: center; }
        .jmq-tr { display: flex; width: max-content; animation: jp-marq 28s linear infinite; }
        .jmq-tr span { padding: 0 64px; white-space: nowrap; font-size: 14px; color: #e6e8ec; }
        .jp-art--m + .ct { z-index: 2; }
        @media (prefers-reduced-motion: reduce) { .ar-img, .ar-sheen, .ar-sp, .box b, .dpool .amt, .pbar i, .jmq-tr, .dcard { animation: none !important; } }
        /* 参考 json 1280：金额框 x293 y305（卡内 left 17 top 97）w166 h46 */
        .dpool { position: absolute; left: 17px; top: 97px; height: 46px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 0 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.1); }
        .dpool .amt { font-size: 16px; }
        /* 参考 json 1280：底栏 y366 h62 pad 8 12 */
        .dbot { position: absolute; left: 0; right: 0; bottom: 0; height: 62px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); }
        .dbot .box { width: 48px; height: 36px; }
        .dshare { position: absolute; right: 12px; top: 0; width: 61px; height: 26px; box-sizing: border-box; padding: 0 8px; display: flex; align-items: center; justify-content: center; border-radius: 0 0 6px 6px; background: #8b3fd6; color: #fff; font-size: 12px; cursor: pointer; }
        .jfoot { display: flex; align-items: center; gap: 0; height: 40px; margin-top: 56px; }
        .flogo { display: flex; align-items: center; justify-content: center; width: 156px; height: 56px; margin-left: 0; margin-right: 36px; border: 1px dashed #3a3d44; border-radius: 6px; color: #c4c8d0; font-size: 12px; font-weight: 700; }
        .fline { flex: 1; height: 1px; background: #3a3d46; }
        .up { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; margin-left: 36px; border-radius: 8px; background: rgba(255, 255, 255, 0.1); }
        .rank-a { display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 88px; margin-top: 32px; padding: 0 16px; border-radius: 16px; background: rgba(255, 255, 255, 0.05); }
        .rank-a .rbtn { width: 141px; height: 48px; border-radius: 12px; }
        .rank-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 16px; }
        .rr { display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 88px; padding: 0 16px; border-radius: 16px; background: rgba(255, 255, 255, 0.05); }
        .rr .rbtn { width: 96px; }
        .rr .rbtn.sm { width: 69px; }
        .jempty { display: flex; align-items: center; justify-content: center; height: 180px; margin-top: 32px; border-radius: 16px; background: rgba(255, 255, 255, 0.05); color: #8d9099; }
        .jmore { width: 186px; height: 32px; margin: 193px 0 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255, 255, 255, 0.1); font-size: 12px; }
        .jpartners { display: flex; justify-content: flex-end; gap: 8px; margin-top: 69px; }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
