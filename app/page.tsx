'use client'
// 首页（browse 组）：版式与 Vue 骨架一致（网页 1280 / 手机 375 两套，CSS 原样），数据来自 mock 接口，语言用 pickLang 即时挑。
import JackpotAmount from '@/components/browse/JackpotAmount'
import { Suspense, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'next/navigation'
import { useViewport } from '@/lib/useViewport'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import { pickLang } from '@/lib/pickLang'
import type { ApiGame, ApiHome, ApiWin } from '@/lib/types'
import SkImg from '@/components/ui/SkImg'
import IconTile from '@/components/ui/IconTile'
import SkSlider from '@/components/browse/SkSlider'
import SocialIcons from '@/components/shared/SocialIcons'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import Msg from '@/components/browse/Msg'
import { AllPill, ArrowBtns, HScroll, useHScroll } from '@/components/ui/HScroll'
import { type GamesResp, fill, gameName, phaseOf, useHover, usePlay, useRemote } from '@/components/browse/browseData'

// 循环取行：从 from 起取 n 个，越界回绕；无数据时全部 undefined（显示占位）
const pick = <T,>(arr: T[], n: number, from: number): (T | undefined)[] => Array.from({ length: n }, (_, i) => (arr.length ? arr[(from + i) % arr.length] : undefined))
// 翻页：偏移量按 d 平移，结果始终落在 [0, len) 内
const shiftOff = (o: number, d: number, len: number) => (len ? (((o + d) % len) + len) % len : 0)
// 在线人数：≥1000 显示为 1 位小数 + k（如 5.7k）
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

export default function Page() {
  return <Suspense fallback={null}><HomeView /></Suspense>
}

function HomeView() {
  const st = useSearchParams().get('state') ?? ''
  const { lang, t } = useLanguage()
  const vp = useViewport()
  const { loggedIn, user, balance } = useAuth()
  const { guard, go, enterRegister } = useGate()
  const play = usePlay()
  const { cls, on } = useHover()
  const home = useRemote<ApiHome>('/api/web/site/home', {})
  const games = useRemote<GamesResp>('/api/web/site/games', {})

  const demoTurn = useSearchParams().get('demo') === 'turnover'
  const member = st === 'member' || (st !== 'guest' && loggedIn)
  const phase = phaseOf(st, home.loading || games.loading, home.error || games.error, false)
  const showRows = phase !== 'empty' && phase !== 'error'
  const showText = phase === 'ok'
  const msg = phase === 'error' ? t('browse.error') : t('browse.empty')
  const retry = () => { home.reload(); games.reload() }
  const hotHs = useHScroll()
  const featHs = useHScroll()
  const mHotHs = useHScroll()
  const mFeatHs = useHScroll()

  const gmap = new Map<number, ApiGame>((games.data?.list ?? []).map(g => [g.id, g]))
  const pop = home.data?.popular ?? []
  const wins = home.data?.wins ?? []
  const mslides = (home.data?.banners ?? []).map(b => ({ title: pickLang(b.translations, lang)?.title ?? '', to: b.link }))
  const banner = home.data?.banners[0]
  const bTitle = pickLang(banner?.translations, lang)?.title || t('browse.bannerFallback')
  const online = compact(home.data?.online ?? 0)
  const airdrop = <JackpotAmount base={home.data?.airdropAmount} />
  // 流水进度条：只有存在流水要求（required > 0）时才显示；?demo=turnover 可预览
  const tw = balance?.turnover ?? (demoTurn ? { done: '320.00', required: '1000.00' } : undefined)
  const showTurn = !!tw && Number(tw.required) > 0
  const turnPct = tw ? Math.min(100, Math.max(0, (Number(tw.done) / Math.max(1, Number(tw.required))) * 100)) : 0
  const turnTxt = tw ? t('browse.turnover', { done: tw.done, required: tw.required }) : ''

  // 入口卡：未登录先去登录（文档 handlers-static §4 首页入口卡 f，来源 home）；登录后去对应页（推断）
  const entry = (to: string) => guard('home', () => go(to))
  const deposit = () => go('/deposit', 'wallet')
  const withdraw = () => go('/withdraw', 'wallet')
  const all = () => go('/group/category/slots')

  // 近期大赢家跑马灯：单份宽 = 张数 × 161（149 + 间距 12），循环位移 -50%，速度 18px/s → 时长 = 单份宽 / 18
  const marqDur = (n: number) => `${(n * 167 / 18).toFixed(1)}s`
  const winItem = (w: ApiWin | undefined, key: string, hidden: boolean) => {
    const g = w ? gmap.get(w.gameId) : undefined
    const av = w ? 'abcd'[w.id % 4]! + 'abcd'[(w.id >> 2) % 4]! : 'aa'
    const amt = w ? `${w.currency} ${Number(w.amount).toFixed(2)}` : ''
    return (
      <div key={key} data-gslug={g?.slug} className="page__bw" aria-hidden={hidden ? 'true' : undefined} onClick={() => g && play(g.slug)}>
        <span className="page__bwimg">
          {g ? <img src={`/assets/wins/${g.slug}.webp`} alt="" draggable={false} onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = '1'; el.src = coverV(g.slug) } }} /> : <SkImg w={62} h={62} radius={7} label="" />}
        </span>
        <div className="page__bwtxt">
          {showText && w ? <span className="page__bwuser"><img src={`/assets/wins/av-${av}.webp`} alt="" draggable={false} /><span>{w.nickname}</span></span> : null}
          {showText && w ? <span className="page__bwamt">{amt}</span> : null}
        </div>
      </div>
    )
  }
  const marquee = (items: (ApiWin | undefined)[]) => (
    <div className="mo-marquee" style={{ ['--mo-marquee-dur' as string]: marqDur(items.length) } as CSSProperties}>
      {[...items, ...items].map((w, i) => winItem(w, String(i), i >= items.length))}
    </div>
  )
  const gameTile = (g: ApiGame | undefined, key: string, base: string, w: number | string, h: number | string, radius: number, showProv: boolean) => (
    <div key={key} data-gslug={g?.slug} className={cls(key, base)} {...on(key)} onClick={() => g && play(g.slug)}>
      <SkImg src={typeof w === 'number' && typeof h === 'number' && h > w ? coverV(g?.slug ?? key) : coverH(g?.slug ?? key)} w={w} h={h} radius={radius} label="" />
      {base === 'page__gc' ? (
        <div className="page__gm">
          {showText && g ? <span>{gameName(g, lang)}</span> : null}
          {showText && g && showProv ? <span>{g.provider}</span> : null}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="sk-page">
      {/* 网页 >= 768px：横幅 617 + 右侧入口卡 337，然后三段列表 */}
      {vp !== 'm' && <div className="desk">
        <section className="hero">
          <div className="banner">
            <SkImg src={HOME.heroDesktop} className="page__cover" w="100%" h="100%" radius={24} label="" />
            {!member ? (
              <>
                <span className="bn-title">{t('browse.heroLine1')}</span>
                <span className="amount">{t('browse.heroAmount')}</span>
                <span className="bn-sub">{t('browse.heroLine3')}</span>
                <span className="cta cta-g" role="button" tabIndex={0} onClick={() => enterRegister('home')}>{t('browse.register')}</span>
                <SocialIcons className="d-soc" size={40} />
              </>
            ) : (
              <>
                <SkImg src={avatarImg(user?.avatar ?? 1)} className="page__av" w={56} h={56} round label="" />
                <span className="nm">{user?.nickname ?? '-'}</span>
                <span className="lv">{t('browse.vip', { level: user?.level ?? 0 })}</span>
                <span className="bal">{balance?.available ?? '0.00'}</span>
                {showTurn ? <><span className="bar"><i style={{ width: `${turnPct}%` }} /></span><span className="bar-l">{turnTxt}</span></> : null}
                <span className="cta cta-a" role="button" tabIndex={0} onClick={deposit}>{t('browse.deposit')}</span>
                <span className="cta cta-b" role="button" tabIndex={0} onClick={withdraw}>{t('browse.withdraw')}</span>
              </>
            )}
          </div>
          <div className="side">
            <div className="card" role="button" tabIndex={0} onClick={() => go('/jackpot')}>
              <SkImg src="/assets/home/entry-3.webp" className="page__deco" w={136} h={109} radius={0} label="" />
              <span className="chip c1"><i className="dot" />{t('browse.home.entryJackpot')}</span>
              {showText ? <span className="card-amt">{airdrop}</span> : null}
            </div>
            <div className="card" role="button" tabIndex={0} onClick={() => go('/bonus')}>
              <SkImg src="/assets/home/entry-4.webp" className="page__deco" w={136} h={109} radius={0} label="" />
              <span className="chip c2"><i className="dot" />{t('browse.home.entryBonusShort')}</span>
              <span className="card-sub">{t('browse.home.bonusSub')}<br />{t('browse.home.bonusSub2')}</span>
            </div>
          </div>
        </section>

        <section className="sec sec-recent">
          <div className="head">
            <span className="ttl">{t('browse.home.recentTitle')}</span>
            <span className="pill pill-online">{t('browse.online', { n: online })}</span>
          </div>
          {showRows ? (
            <div className="row">{marquee(fill(wins, 14))}</div>
          ) : <Msg text={msg} h={62} retryLabel={t('browse.retry')} onRetry={retry} />}
        </section>

        <section className="sec sec-hot">
          <div className="head">
            <span className="ttl">{t('browse.home.hotTitle')}</span>
            <div className="hr"><AllPill label={t('browse.all')} onClick={all} /><ArrowBtns hs={hotHs} /></div>
          </div>
          {showRows ? (
            <HScroll hs={hotHs} className="row5">{(pop.length ? pop.slice(0, 40) : pick(pop, 5, 0)).map((g, i) => <div key={'h' + i} className="it">{gameTile(g, 'h' + i, 'page__gc', '100%', 136, 8, true)}</div>)}</HScroll>
          ) : <Msg text={msg} h={184} retryLabel={t('browse.retry')} onRetry={retry} />}
        </section>

        <section className="sec sec-feat">
          <div className="head">
            <span className="ttl">{t('browse.home.featTitle')}</span>
            <div className="hr"><AllPill label={t('browse.all')} onClick={all} /><ArrowBtns hs={featHs} /></div>
          </div>
          {showRows ? (
            <HScroll hs={featHs} className="row6">
              {(pop.length ? pop.slice(0, 40) : pick(pop, 6, 0)).map((g, i) => (
                <div key={'f' + i} data-gslug={g?.slug} className={`it ${cls('f' + i, 'page__gc')}`} {...on('f' + i)} onClick={() => g && play(g.slug)}>
                  <SkImg src={coverV(g?.slug ?? i)} w="100%" h={202} radius={8} label="" />
                  <span className="badge">{i + 1}</span>
                </div>
              ))}
            </HScroll>
          ) : <Msg text={msg} h={202} retryLabel={t('browse.retry')} onRetry={retry} />}
        </section>
      </div>}

      {/* 手机 < 768px：横幅 375，两张并排入口卡，两张整行卡，近期大赢家，热门，精选 */}
      {vp !== 'd' && <div className="mob">
        {member ? (
          <>
            <section className="m-mbanner">
              <SkSlider variant="mob" slides={mslides} onSlide={go} cta={t('browse.bannerCta')} />
            </section>
            <div className="m-mrow">
              <SkImg src={avatarImg(user?.avatar ?? 1)} w={44} h={44} round label="" />
              <div className="m-mem-t">
                <span className="nm">{user?.nickname ?? '-'}</span>
                <span className="lv">{t('browse.vip', { level: user?.level ?? 0 })} · {balance?.available ?? '0.00'}</span>
                {showTurn ? <><span className="lv">{turnTxt}</span><span className="m-tbar"><i style={{ width: `${turnPct}%` }} /></span></> : null}
              </div>
              <span className="m-mdep" role="button" tabIndex={0} onClick={() => deposit()}>{t('browse.deposit')}</span>
            </div>
            <SocialIcons className="m-msoc" size={48} />
          </>
        ) : (
        <section className="m-hero">
          <SkImg src={HOME.heroMobile} className="page__m-img" w="100%" h={320} radius={0} label="" />
          <div className="m-shade" />
          {!member ? (
            <div className="m-ttl">
              <span className="t">{t('browse.heroLine1')}</span>
              <span className="amt">{t('browse.heroAmount')}</span>
              <span className="sub">{t('browse.heroLine3')}</span>
            </div>
          ) : (
            <div className="m-mem">
              <SkImg src={avatarImg(user?.avatar ?? 1)} w={48} h={48} round label="" />
              <div className="m-mem-t">
                <span className="nm">{user?.nickname ?? '-'}</span>
                <span className="lv">{t('browse.vip', { level: user?.level ?? 0 })} · {balance?.available ?? '0.00'}</span>
              </div>
            </div>
          )}
          <span className="m-btn" role="button" tabIndex={0} onClick={() => (member ? deposit() : enterRegister('home'))}>
            {member ? t('browse.deposit') : t('auth.tab.register')}
          </span>
          <SocialIcons className="m-round" />
        </section>
        )}

        <section className="m-ent">
          <div className="m-ent-a" role="button" tabIndex={0} onClick={() => go('/casino')}>
            <span className="m-ent-hd">
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="4" y="2" width="16" height="22" rx="3" fill="#1f2a24" stroke="#c9ffe0" strokeWidth="1.5" /><path d="M12 8c-2 3-4 3.6-4 5.4a2 2 0 003 1.5c-.1 1-.5 1.8-1 2.4h4c-.5-.6-.9-1.4-1-2.4a2 2 0 003-1.5C16 11.600 14 11 12 8z" fill="#5afa68" /></svg>
              <span className="m-ent-t">{t('browse.home.entryCasino')}</span>
            </span>
            <span className="m-ent-s">{t('browse.home.casinoSub', { n: String(games.data?.list?.length ?? 0) })}</span>
            <SkImg src="/assets/home/entry-1.webp" className="page__m-ent-ic" w={82} h={66} radius={0} label="" />
          </div>
          <div className="m-ent-b" role="button" tabIndex={0} onClick={() => go('/sports')}>
            <span className="m-ent-hd">
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="11" fill="#2fbf5a" /><path d="M13 2v22M2 13h22M5 5c4 3 4 13 0 16M21 5c-4 3-4 13 0 16" fill="none" stroke="#0e3d1d" strokeWidth="1.3" /></svg>
              <span className="m-ent-t">{t('browse.home.entrySports')}</span>
            </span>
            <span className="m-ent-s">{t('browse.home.sportsSub')}</span>
            <SkImg src="/assets/home/entry-2.webp" className="page__m-ent-ic" w={82} h={66} radius={0} label="" />
          </div>
        </section>

        <div className="m-full m-full-a" role="button" tabIndex={0} onClick={() => go('/jackpot')}>
          <SkImg src="/assets/home/icon-1.webp" className="page__m-ico" w={64} h={64} radius={8} label="" />
          <div className="m-full-body">
            <span className="m-full-t">{t('browse.home.entryJackpot')}</span>
            {showText ? <span className="m-full-amt">{airdrop}</span> : null}
          </div>
          <i className="m-arr" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M5 2.500l4.500 4.500L5 11.500" fill="none" stroke="currentColor" strokeWidth="1.600" strokeLinecap="round" strokeLinejoin="round" /></svg></i>
        </div>
        <div className="m-full m-full-b" role="button" tabIndex={0} onClick={() => go('/bonus')}>
          <SkImg src="/assets/home/icon-2.webp" className="page__m-ico" w={64} h={64} radius={8} label="" />
          <div className="m-full-body">
            <span className="m-full-row"><span className="m-full-t">{t('browse.home.entryBonusShort')}</span><span className="m-full-tag">{t('browse.home.bonusTag')}</span></span>
            <span className="m-full-sub">{t('browse.home.bonusMini')}</span>
          </div>
          <i className="m-arr" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M5 2.500l4.500 4.500L5 11.500" fill="none" stroke="currentColor" strokeWidth="1.600" strokeLinecap="round" strokeLinejoin="round" /></svg></i>
        </div>

        <section className="m-recent">
          <div className="m-head">
            <span className="ttl">{t('browse.home.recentTitle')}</span>
            <span className="pill-m">{t('browse.online', { n: online })}</span>
          </div>
          {showRows ? (
            <div className="m-row">{marquee(fill(wins, 10))}</div>
          ) : <Msg text={msg} h={62} retryLabel={t('browse.retry')} onRetry={retry} />}
        </section>

        <section className="m-lobby">
          <div className="m-head m-head-hot">
            <span className="ttl">{t('browse.home.hotTitle')}</span>
            <AllPill label={t('browse.all')} onClick={all} />
          </div>
          {showRows ? (
            <HScroll hs={mHotHs} className="m-row2">
              {(pop.length ? pop.slice(0, 30) : fill(pop, 3)).map((g, i) => (
                <div key={'mh' + i} className="m-hc" onClick={() => g && play(g.slug)}>
                  <SkImg src={coverH(g?.slug ?? i)} w={168} h={125} radius={8} label="" />
                  <div className="page__gm">
                    {showText && g ? <span>{gameName(g, lang)}</span> : null}
                    {showText && g ? <span>{g.provider}</span> : null}
                  </div>
                </div>
              ))}
            </HScroll>
          ) : <Msg text={msg} h={125} retryLabel={t('browse.retry')} onRetry={retry} />}

          <div className="m-head m-head-feat">
            <span className="ttl">{t('browse.home.featTitle')}</span>
            <AllPill label={t('browse.all')} onClick={all} />
          </div>
          {showRows ? (
            <HScroll hs={mFeatHs} className="m-row2 m-feat-row">
              {(pop.length > 3 ? pop.slice(30, 60) : fill(pop, 2, 3)).map((g, i) => (
                <div key={'mf' + i} className="m-hc" onClick={() => g && play(g.slug)}>
                  <SkImg src={coverH(g?.slug ?? i)} w={168} h={125} radius={8} label="" />
                  <div className="page__gm">
                    {showText && g ? <span>{gameName(g, lang)}</span> : null}
                    {showText && g ? <span>{g.provider}</span> : null}
                  </div>
                </div>
              ))}
            </HScroll>
          ) : <Msg text={msg} h={125} retryLabel={t('browse.retry')} onRetry={retry} />}
        </section>
      </div>}

      <style jsx>{`
        .sk-page, .sk-page :global(*) { box-sizing: border-box; }
        .sk-page { color: var(--vp-text, #e6e8ec); font-size: 14px; }
        .ttl { font-size: 18px; font-weight: 600; white-space: nowrap; }
        .btn { height: 32px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex: none; cursor: pointer; }
        .btn-s { height: 26px; padding: 0 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); display: inline-flex; align-items: center; font-size: 12px; font-weight: 600; flex: none; cursor: pointer; }
        :global(.page__bw) { display: flex; align-items: center; gap: 8px; width: 155px; height: 64px; padding: 0 8px 0 1px; flex: none; cursor: pointer; border-radius: 8px; background: rgba(255, 255, 255, 0.06); overflow: hidden; }
        :global(.page__bwimg) { flex: none; width: 62px; height: 62px; border-radius: 8px; border: 1px solid #7d7d81; overflow: hidden; display: block; }
        :global(.page__bwimg img) { width: 100%; height: 100%; object-fit: cover; display: block; }
        :global(.page__bwtxt) { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 6px; flex: 1; min-width: 0; }
        :global(.page__bwuser) { display: flex; align-items: center; gap: 4px; max-width: 100%; font-size: 12px; font-weight: 500; color: #fff; }
        :global(.page__bwuser img) { width: 16px; height: 16px; border-radius: 50%; flex: none; }
        :global(.page__bwuser span) { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        :global(.page__bwamt) { height: 20px; padding: 0 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.05); display: inline-flex; align-items: center; max-width: 100%; font-size: 11.5px; font-weight: 700; color: #00f071; white-space: nowrap; overflow: hidden; }
        :global(.page__gm) { display: flex; flex-direction: column; height: 40px; margin-top: 8px; font-size: 13px; }
        :global(.page__gm) span:last-child { color: #8d93a0; font-size: 12px; }
        .badge { position: absolute; right: 8px; top: 8px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: rgba(0, 0, 0, 0.55); display: flex; align-items: center; justify-content: center; font-size: 11px; }
        :global(.page__gc) { position: relative; min-width: 0; cursor: pointer; }
        .grid { display: grid; }
        .row { display: flex; gap: 0; margin: 12px 0 0; overflow: hidden; }
        .row :global(.mo-marquee), .m-row :global(.mo-marquee) { gap: 12px; flex: none; }

        /* ---------- 网页 1280 ---------- */
        .desk { display: none; max-width: 1320px; margin: 0 auto; padding: 0 0 8px; }
        .hero { display: grid; grid-template-columns: minmax(0, 1.83fr) minmax(0, 1fr); gap: 14px; align-items: stretch; }
        .banner { position: relative; min-width: 0; min-height: 234px; }
        :global(.page__cover) { position: absolute; left: 0; top: 0; }
        .bn-title { color: var(--vp-text-img); text-shadow: var(--vp-text-img-shadow); position: absolute; left: 27px; top: 22px; font-size: 16px; font-weight: 600; white-space: nowrap; }
        .bn-sub { position: absolute; left: 27px; top: 90px; font-size: 13px; color: #a9afbb; white-space: nowrap; }
        :global(.d-soc) { position: absolute; left: 27px; top: 178px; gap: 10px; }
        .amount { position: absolute; left: 27px; top: 48px; font-size: 26px; font-weight: 800; line-height: 1.2; letter-spacing: .5px; color: #00f56a; white-space: nowrap; }
        .cta { position: absolute; width: 149px; height: 32px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; cursor: pointer; }
        .cta-g { left: 27px; top: 126px; width: 200px; height: 36px; background: var(--vp-grad); color: var(--vp-on-primary); font-size: 14px; font-weight: 500; }
        :global(.page__mini) { position: absolute; top: 183px; }
        :global(.page__m1) { left: 27px; } :global(.page__m2) { left: 79px; } :global(.page__m3) { left: 131px; }
        :global(.page__av) { position: absolute; left: 27px; top: 36px; }
        .nm { position: absolute; left: 99px; top: 46px; font-size: 18px; font-weight: 600; }
        .lv { position: absolute; left: 99px; top: 74px; font-size: 13px; color: #8d93a0; }
        .bal { position: absolute; left: 27px; top: 118px; font-size: 28px; font-weight: 700; }
        .bar { position: absolute; left: 27px; top: 162px; width: 300px; height: 8px; border-radius: 4px; background: rgba(255, 255, 255, 0.12); overflow: hidden; }
        .bar-l { position: absolute; left: 336px; top: 154px; font-size: 12px; color: #a9afbb; white-space: nowrap; }
        .m-tbar { display: block; width: 100%; height: 5px; margin-top: 2px; border-radius: 3px; background: rgba(255, 255, 255, 0.12); overflow: hidden; }
        .m-tbar i { display: block; height: 100%; background: var(--vp-grad); }
        .bar i { display: block; height: 100%; background: #fff; opacity: 0.6; }
        .cta-a { left: 27px; top: 186px; width: 120px; background: #fff; color: #111; }
        .cta-b { left: 159px; top: 186px; width: 120px; background: rgba(255, 255, 255, 0.12); }

        .side { display: flex; flex-direction: column; gap: 14px; }
        .card { position: relative; width: 100%; aspect-ratio: 396 / 130; border-radius: 21.4px; overflow: hidden; background: linear-gradient(135deg, #2c2e34 0%, #202228 55%, #1b1d22 100%); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1); cursor: pointer; isolation: isolate; }
        /* 图标：常态轻漂浮；悬停时弹起放大并出光；按下回弹。光效 = 背后光晕 + 斜向扫光 */
        :global(.page__deco) { position: absolute; left: auto; right: 14px; top: auto; bottom: 4px; z-index: 2; animation: decoFloat 3.6s ease-in-out infinite; transition: transform .38s cubic-bezier(.34, 1.56, .64, 1), filter .3s ease; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, .35)); }
        .card:hover :global(.page__deco) { transform: translateY(-9px) scale(1.08) rotate(-2deg); filter: drop-shadow(0 0 14px rgba(57, 255, 182, .65)) brightness(1.15); }
        .card:active :global(.page__deco) { transform: translateY(2px) scale(.94); transition-duration: .1s; }
        .card::before { content: ''; position: absolute; right: -10px; bottom: -30px; width: 230px; height: 200px; z-index: 1; border-radius: 50%; background: radial-gradient(circle, rgba(57, 255, 182, .38), rgba(57, 255, 182, 0) 65%); opacity: .35; transition: opacity .35s ease, transform .35s ease; pointer-events: none; }
        .card:hover::before { opacity: 1; transform: scale(1.15); }
        .card::after { content: ''; position: absolute; top: -20%; bottom: -20%; left: -40%; width: 30%; z-index: 3; background: linear-gradient(100deg, transparent, rgba(255, 255, 255, .22), transparent); transform: skewX(-18deg); pointer-events: none; opacity: 0; }
        .card:hover::after { opacity: 1; animation: cardShine .9s ease-out; }
        @keyframes decoFloat { 0%, 100% { translate: 0 0 } 50% { translate: 0 -3px } }
        @keyframes cardShine { from { left: -40% } to { left: 130% } }
        @media (prefers-reduced-motion: reduce) { :global(.page__deco) { animation: none } .card:hover::after { animation: none } }
        /* 主次：标签（白色粗体 16px，圆点）→ 金额（金色 30px 粗体）/ 说明（15px 灰） */
        .chip { z-index: 4; position: absolute; left: 16px; top: 14px; height: 34px; display: inline-flex; align-items: center; gap: 8px; padding: 0 16px 0 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); font-size: 16px; font-weight: 700; white-space: nowrap; }
        .chip .dot { width: 10px; height: 10px; border-radius: 50%; background: #e8eaee; box-shadow: 0 0 0 3px rgba(255, 255, 255, .18); }

        .sec { position: relative; }
        .sec-recent { margin-top: 24px; }
        .head { display: flex; align-items: center; justify-content: space-between; height: 32px; }
        .pill { height: 32px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .pill-online { width: 107px; background: rgba(255, 255, 255, 0.06); }
        .hr { display: flex; align-items: center; gap: 8px; margin-right: 0; }
        :global(.row5) { gap: 16px; margin-top: 14px; }
        :global(.row5 > .it) { width: calc((100% - 64px) / 5); min-width: 0; }
        :global(.row6) { gap: 17px; margin-top: 12px; }
        :global(.row6 > .it) { position: relative; width: calc((100% - 85px) / 6); min-width: 0; }
        .w64 { width: auto; padding: 0 12px; }
        .w90 { width: auto; padding: 0 12px; }
        .arw { width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; font-size: 18px; flex: none; cursor: pointer; }
          .card-amt { font-variant-numeric: tabular-nums; position: absolute; left: 18px; bottom: 16px; font-size: 22px; font-weight: 800; line-height: 1; color: #f6c96a; letter-spacing: 1px; text-shadow: 0 1px 8px rgba(246, 201, 106, .3); z-index: 4; white-space: nowrap; }
        .card-sub { z-index: 4; position: absolute; left: 18px; bottom: 12px; width: 62%; font-size: 14px; line-height: 1.4; color: #b4b9c4; }
        .sec-hot { margin-top: 25px; }
        .sec-hot .grid { margin-top: 14px; }
        .g5 { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .sec-feat { margin-top: 25px; }
        .g6 { grid-template-columns: repeat(6, 1fr); gap: 17px; margin-top: 12px; }

        /* ---------- 手机 375 ---------- */
        .mob { display: block; }
        .m-mbanner { margin: -8px -8px 0; height: 233px; }
        .m-mrow { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
        .m-mrow .m-mem-t { flex: 1; min-width: 0; }
        .m-mdep { flex: none; height: 38px; padding: 0 22px; border-radius: 10px; display: flex; align-items: center; background: var(--vp-grad); color: var(--vp-on-primary); font-size: 15px; font-weight: 600; cursor: pointer; }
        :global(.m-msoc) { justify-content: center; margin-top: 14px; }
        .m-hero { position: relative; height: 404px; margin: -12px -12px 0; }
        :global(.page__m-img) { position: absolute; left: 0; top: 0; }
        .m-ttl { position: absolute; left: 0; right: 0; top: 160px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
        .m-shade { position: absolute; left: 0; right: 0; top: 110px; height: 210px; background: linear-gradient(180deg, rgba(10,12,18,0) 0%, rgba(10,12,18,.72) 45%, rgba(10,12,18,.88) 100%); pointer-events: none; }
        .m-ttl .t { font-size: 18px; font-weight: 700; }
        .m-ttl .amt { font-size: clamp(20px, 7.4vw, 30px); font-weight: 800; line-height: 1.1; color: #00f56a; letter-spacing: .5px; white-space: nowrap; text-shadow: 0 0 12px rgba(0,245,106,.35), 0 2px 6px rgba(0,0,0,.8); }
        .m-ttl .sub { font-size: 14px; font-weight: 500; color: #eef0f4; }
        .m-ttl { top: 168px; text-shadow: 0 1px 6px rgba(0,0,0,.9); }
        .m-mem { position: absolute; left: 12px; right: 12px; top: 150px; display: flex; align-items: center; gap: 12px; }
        .m-mem-t { display: flex; flex-direction: column; gap: 4px; }
        .m-mem-t .nm { position: static; font-size: 16px; font-weight: 600; }
        .m-mem-t .lv { position: static; font-size: 12px; color: #8d93a0; }
        .m-btn { position: absolute; left: 16px; right: 16px; top: 262px; height: 46px; border-radius: 10px; background: var(--vp-grad); color: var(--vp-on-primary); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 500; cursor: pointer; }
        :global(.m-round) { position: absolute; left: 0; right: 0; top: 336px; justify-content: center; }

        /* 入口卡：深灰底 + 荧光绿渐变（对照原站手机首页） */
        .m-ent { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0; margin-top: 20px; }
        .m-ent-a, .m-ent-b { position: relative; height: 100px; border-radius: 14px; overflow: hidden; cursor: pointer;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(40, 60, 52, 0.9) 55%, rgba(0, 245, 120, 0.22) 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        .m-ent-a { clip-path: polygon(0 0, 100% 0, 96% 100%, 0 100%); border-radius: 14px 6px 6px 14px; }
        .m-ent-hd { position: absolute; left: 12px; top: 12px; display: flex; align-items: center; gap: 8px; }
        .m-ent-t { font-size: 17px; font-weight: 700; line-height: 1; }
        .m-ent-s { position: absolute; left: 12px; bottom: 12px; font-size: 13px; color: #aeb4bf; white-space: nowrap; }
        :global(.page__m-ent-ic) { position: absolute; right: 4px; bottom: 2px; }
        /* 入口图标动效：轻微上下漂浮 + 荧光呼吸，四个图标错开节奏 */
        :global(.page__m-ent-ic), :global(.page__m-ico) { animation: icFloat 3.4s ease-in-out infinite, icGlow 2.6s ease-in-out infinite; will-change: transform, filter; }
        .m-ent-b :global(.page__m-ent-ic) { animation-delay: -1.2s, -0.9s; }
        .m-full-a :global(.page__m-ico) { animation-delay: -2.1s, -1.6s; }
        .m-full-b :global(.page__m-ico) { animation-delay: -0.6s, -2.2s; }
        @keyframes icFloat { 0%, 100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-4px) rotate(2deg) } }
        @keyframes icGlow { 0%, 100% { filter: drop-shadow(0 0 2px rgba(57, 255, 182, 0.15)) } 50% { filter: drop-shadow(0 0 9px rgba(57, 255, 182, 0.55)) brightness(1.12) } }
        @media (prefers-reduced-motion: reduce) { :global(.page__m-ent-ic), :global(.page__m-ico) { animation: none } }

        .m-full { position: relative; display: flex; align-items: center; gap: 14px; height: 84px; margin: 12px 0 0; padding: 0 14px 0 14px; border-radius: 14px; cursor: pointer; box-sizing: border-box;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.07) 0%, rgba(38, 44, 42, 0.95) 60%, rgba(0, 245, 120, 0.16) 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        :global(.page__m-ico) { flex: none; }
        .m-full-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .m-full-row { display: flex; align-items: center; gap: 8px; }
        .m-full-t { font-size: 17px; font-weight: 700; line-height: 1.1; }
        .m-full-amt { font-variant-numeric: tabular-nums; font-size: 18px; font-weight: 800; letter-spacing: 1px; color: #f6c96a; white-space: nowrap; text-shadow: 0 1px 6px rgba(246, 201, 106, 0.25); }
        .m-full-tag { height: 22px; padding: 0 10px; border-radius: 999px; background: rgba(0, 220, 190, 0.16); color: #2de0c8; font-size: 13px; font-weight: 600; line-height: 22px; }
        .m-full-sub { font-size: 13px; color: #aeb4bf; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .m-arr { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: rgba(255, 255, 255, 0.14); color: #e6e8ee; }

        .m-recent { margin-top: 24px; padding: 0; }
        .m-head { display: flex; align-items: center; justify-content: space-between; height: 32px; }
        .m-recent .m-head { height: 26px; }
        .pill-m { width: 94px; height: 26px; border-radius: 999px; background: rgba(255, 255, 255, 0.06); display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .m-row { display: flex; gap: 0; margin: 12px 0 0; overflow: hidden; }

        .m-lobby { margin: 0 -12px; padding: 12px 12px 8px; }
        .m-head-hot { height: 32px; padding-right: 12px; }
        :global(.m-row2) { gap: 8px; margin-top: 12px; margin-right: -12px; padding-right: 12px; }
        .m-hc { width: 168px; flex: none; cursor: pointer; }
        .m-feat-row { margin-top: 12px; }
        .m-head-feat { margin-top: 24px; padding-right: 12px; }

        @media (min-width: 768px) {
          .desk { display: block; }
          .mob { display: none; }
          .ttl { font-size: 18px; }
        }
        /* 768-1023：外壳侧栏占位后内容区变窄，横幅与入口卡改为等分两列 */
        @media (min-width: 768px) and (max-width: 1023px) {
          .hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
          .card { width: 100%; min-width: 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）



