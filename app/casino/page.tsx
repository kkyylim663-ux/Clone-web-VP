'use client'
// 赌场（browse 组）：版式与 Vue 骨架一致（网页 1280 / 手机 375，CSS 原样）。分类 chip / 手机分类 tab 真筛选；
// 游戏行箭头整行平移 590px（380ms）；轮播 Swiper；「加载更多」前端分页。
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useViewport } from '@/lib/useViewport'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import { pickLang } from '@/lib/pickLang'
import type { ApiBanner, ApiGame, ApiHome } from '@/lib/types'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import SkSlider from '@/components/browse/SkSlider'
import JackpotAmount from '@/components/browse/JackpotAmount'
import Msg from '@/components/browse/Msg'
import { AllPill, ArrowBtns, HScroll, useHScroll } from '@/components/ui/HScroll'
import { type ApiCategory, type ApiProvider, type GamesResp, PAGE_SIZE, catName, fill, gameName, phaseOf, provSlug, useHover, usePlay, useRemote } from '@/components/browse/browseData'

/** 分类 chip 宽度（取自 Vue 版前 5 个：全部 + 4 个分类） */
const chipW = [115, 146, 91, 95, 131]
/** 原站供应商 Tab 上的简称 */
const PROV_SHORT: Record<string, string> = { nextspin: 'NEXTSPIN', 'pragmatic-play': 'PP', 'relax-gaming': 'Relax', 'hacksaw-gaming': 'Hacksaw' }
const CAT_ICON: Record<string, string> = { '': 'lobby', slots: 'slot', live: 'livecasino', crash: 'crash', fishing: 'fishing', mini: 'minigame', table: 'tablegame', buyin: 'featurebuyin', featured: 'featuredslot' }
const ph = (n: number) => Array.from({ length: n }, () => undefined as ApiGame | undefined)

export default function Page() {
  return <Suspense fallback={null}><CasinoView /></Suspense>
}

function CasinoView() {
  const st = useSearchParams().get('state') ?? ''
  const { lang, t } = useLanguage()
  const vp = useViewport()
  const { loggedIn, balance } = useAuth()
  const { go } = useGate()
  const play = usePlay()
  const { cls, on } = useHover()
  const [cat, setCat] = useState('')
  const [prov, setProv] = useState('')
  const rowHs = useHScroll()
  const chipHs = useHScroll()
  const tabHs = useHScroll()
  const useSub = useHScroll()
  const [shownB, setShownB] = useState(12)
  const [shownM, setShownM] = useState(18)

  const home = useRemote<ApiHome>('/api/web/site/home', {})
  const cats = useRemote<{ list: ApiCategory[] }>('/api/web/browse/categories', {})
  const provs = useRemote<{ list: ApiProvider[] }>('/api/web/browse/providers', {})
  const games = useRemote<GamesResp>('/api/web/site/games', { category: cat })

  const member = st === 'member' || (st !== 'guest' && loggedIn)
  const rawList = games.data?.list ?? []
  const list = prov ? rawList.filter((g) => g.provider === prov) : rawList
  const pending = home.loading || cats.loading || games.loading
  const phase = phaseOf(st, pending, games.error, !pending && list.length === 0)
  const showGrid = phase !== 'empty' && phase !== 'error'
  const showText = phase === 'ok'
  const msg = phase === 'error' ? t('browse.error') : t('browse.empty')
  const retry = () => { home.reload(); cats.reload(); games.reload() }

  const banners: (ApiBanner | undefined)[] = fill(home.data?.banners ?? [], 5)
  const slides = banners.map(b => ({ title: b ? pickLang(b.translations, lang)?.title ?? '' : '', to: b?.link }))
  const chipItems = [{ key: '', name: t('browse.all') }, ...(cats.data?.list ?? []).map(c => ({ key: c.key, name: catName(c, lang) }))].slice(0, chipW.length)
  const lobbyTitle = cat ? chipItems.find(c => c.key === cat)?.name ?? '' : t('browse.casino.lobbyTitle')
  const allGo = () => go(`/group/category/${cat || 'slots'}`)
  const jackpot = () => go('/jackpot')

  // 列表切片：无数据（加载中）用占位块
  const rowA = list.length ? list.slice(0, 40) : ph(8)
  const bItems = list.length ? list.slice(8, 8 + shownB) : ph(12)
  const bMore = list.length > 8 + shownB
  const mItems = list.length ? list.slice(0, 16) : ph(10)
  const mMore = list.length > 16 + shownM
  const mRest = list.length ? list.slice(16, 16 + shownM) : ph(18)
  const provTiles: (ApiProvider | undefined)[] = fill(provs.data?.list ?? [], 18)

  const card = (g: ApiGame | undefined, key: string, w: number | string, h: number, base: string) => (
    <div key={key} data-gslug={g?.slug} className={cls(key, base)} {...on(key)} onClick={() => g && play(g.slug)}>
      <SkImg src={typeof w === 'number' && typeof h === 'number' && h > w ? coverV(g?.slug ?? `${w}x${h}`) : coverH(g?.slug ?? `${w}x${h}`)} w={w} h={h} radius={8} label="" />
      {base === 'cs__gc' && h === 136 ? (
        <div className="cs__gm">
          {showText && g ? <span>{gameName(g, lang)}</span> : null}
          {showText && g ? <span>{g.provider}</span> : null}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="sk-page">
      {/* 网页 >= 768px */}
      {vp !== 'm' && <div className="desk">
        <section className="hero">
          <div className="slider">
            <SkSlider variant="desk" slides={slides} onSlide={go} />
          </div>
          {/* 信息卡：→ /jackpot（文档 clicks-public.md /casino 1280:27） */}
          <div className={`info ${member ? 'mem' : ''}`} role="button" tabIndex={0} onClick={jackpot}>
            <SkImg src="/assets/casino/info.webp" className="casino_pg__info-img fx-shake" w="100%" h="100%" radius={0} label="" />
            <i className="fx-glow" aria-hidden="true" /><i className="fx-burst" aria-hidden="true" />
            <div className="band">
              <span className="band-t">{t('browse.home.entryJackpot')}</span>
              <span className="band-a"><JackpotAmount base={home.data?.airdropAmount} /></span>
            </div>
          </div>
        </section>

        {/* 搜索条：文档 弹窗(Providers) → 推断 /providers */}
        <div className="sbrow">
        <div className="searchbar" role="button" tabIndex={0} onClick={() => go('/providers')}><svg className="s-ic" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6.500" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m15.500 15.500 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg><span className="s-ph">{t('browse.casino.searchPh')}</span></div>
          <button type="button" className="recent" onClick={() => go('/casino/recent')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            <span>{t('browse.casino.recent')}</span>
          </button>
        </div>

        {/* 供应商 chip（参考站同款）：大厅 + 供应商（带标识）+ 更多；选中项绿色描边。下方一行是分类小胶囊（全部 / 各分类），真筛选 */}
        <div className="chips">
          <HScroll hs={chipHs} className="chip-track">
            <div className={`chip pv${prov === '' ? ' on' : ''}`} role="button" tabIndex={0} onClick={() => setProv('')}>
              <img className="pv-logo" src="/assets/casino/cat-lobby.webp" alt="" draggable={false} /><span>{t('base.nav.sub.lobby')}</span>
            </div>
            {(provs.data?.list ?? []).map((p) => (
              <div key={p.slug} className={`chip pv${prov === p.name ? ' on' : ''}`} role="button" tabIndex={0} onClick={() => setProv(p.name)}>
                {p.logo ? <img className="pv-logo" src={`/assets/casino/prov-${p.logo}.webp`} alt="" draggable={false} /> : null}<span>{PROV_SHORT[p.logo ?? ''] ?? p.name}</span>
              </div>
            ))}
          </HScroll>
          <div className="chip-more" role="button" tabIndex={0} onClick={() => go('/providers')}>
            <img className="pv-logo" src="/assets/casino/more.webp" alt="" draggable={false} /><span>{t('browse.more')}</span>
          </div>
        </div>
        <HScroll hs={useSub} className="subcats">
          {chipItems.map((c) => (
            <span key={c.key} className={`sc${cat === c.key ? ' on' : ''}`} role="button" tabIndex={0} onClick={() => setCat(c.key)}>{c.name}</span>
          ))}
        </HScroll>

        {/* 游戏 A 行：标题 + 全部 + 上一页/下一页箭头；卡片整行平移 */}
        <section className="sec sec-a">
          <div className="head">
            <span className="ttl">{lobbyTitle}</span>
            <div className="hr hr-arr">
              <AllPill label={t('browse.all')} onClick={allGo} />
              <ArrowBtns hs={rowHs} />
            </div>
          </div>
          {showGrid ? (
            <HScroll hs={rowHs} className="row-track">
              {rowA.map((g, i) => card(g, 'a' + i, '100%', 136, 'cs__gc'))}
            </HScroll>
          ) : <Msg text={msg} h={184} retryLabel={t('browse.retry')} onRetry={retry} />}
        </section>

        <section className="sec sec-b">
          <div className="head">
            <span className="ttl">{t('browse.home.featTitle')}</span>
            <div className="hr"><AllPill label={t('browse.all')} onClick={allGo} /></div>
          </div>
          {showGrid ? (
            <>
              <div className="grid g6">{bItems.slice(0, 6).map((g, i) => card(g, 'b' + i, '100%', 202, 'cs__gc'))}</div>
              <div className="more-row">
                <AllPill label={bMore ? t('browse.loadMore') : t('browse.noMore')} onClick={() => bMore && setShownB(x => x + PAGE_SIZE)} />
              </div>
              <div className="grid g6 g6-second">{bItems.slice(6).map((g, i) => card(g, 'c' + i, '100%', 202, 'cs__gc'))}</div>
            </>
          ) : <Msg text={msg} h={202} retryLabel={t('browse.retry')} onRetry={retry} />}
        </section>
      </div>}

      {/* 手机 < 768px */}
      {vp !== 'd' && <div className="mob">
        <section className="m-banner">
          <SkSlider variant="mob" slides={slides} onSlide={go} />
          <span className="m-tag">{t('browse.casino.tag')}</span>
        </section>

        {/* 奖池条（访客）→ /jackpot；会员显示余额 */}
        <section className="m-strip">
          <div className="m-strip-in" role="button" tabIndex={0} onClick={jackpot}>
            <SkImg src="/assets/casino/jackpot-strip.webp" className="casino_pg__m-strip-img fx-shake" w="100%" h={68} radius={12} label="" />
            <i className="fx-glow" aria-hidden="true" /><i className="fx-burst" aria-hidden="true" />
            <span className="m-strip-t">{t('browse.home.entryJackpot')}</span>
            <span className="m-strip-a"><JackpotAmount base={home.data?.airdropAmount} /></span>
          </div>
        </section>

        <section className="m-tabs">
          <div className="m-search" role="button" tabIndex={0} onClick={() => go('/casino/search2')}><span className="s-ph">{t('browse.casino.searchPh')}</span></div>
          <HScroll hs={tabHs} className="m-tabrow">
            {chipItems.map(c => (
              <div key={c.key} className={`m-tab ${cat === c.key ? 'on' : ''}`} role="button" tabIndex={0} onClick={() => setCat(c.key)}>
                <img className="m-ci" src={`/assets/casino/cat-${CAT_ICON[c.key] ?? 'slot'}.webp`} alt="" draggable={false} />
                <span>{c.name}</span>
              </div>
            ))}
          </HScroll>
        </section>

        <section className="m-lobby">
          <div className="m-head">
            <span className="ttl">{t('browse.casino.popular')}</span>
            <AllPill label={t('browse.all')} onClick={allGo} />
          </div>
          {showGrid ? (
            <div className="m-grid m-g168 m-scroll">
              {mItems.map((g, i) => (
                <div key={'m' + i} className="m-c" onClick={() => g && play(g.slug)}>
                  <SkImg src={coverH(g?.slug ?? i)} w={168} h={125} radius={8} label="" />
                  <div className="m-gm">
                    {showText && g ? <span>{gameName(g, lang)}</span> : null}
                    {showText && g ? <span>{g.provider}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : <Msg text={msg} h={125} retryLabel={t('browse.retry')} onRetry={retry} />}

          <div className="m-head m-head-b">
            <span className="ttl">{t('browse.home.featTitle')}</span>
            <AllPill label={t('browse.all')} onClick={allGo} />
          </div>
          {showGrid ? (
            <div className="m-grid m-g110 m-scroll">
              {mRest.map((g, i) => (
                <div key={'n' + i} className="m-c2" onClick={() => g && play(g.slug)}>
                  <SkImg src={coverV(g?.slug ?? i)} w={110} h={153} radius={8} label="" />
                </div>
              ))}
            </div>
          ) : <Msg text={msg} h={125} retryLabel={t('browse.retry')} onRetry={retry} />}
          {showGrid && mMore ? (
            <div className="m-more"><span className="btn-s" role="button" tabIndex={0} onClick={() => setShownM(x => x + PAGE_SIZE)}>{t('browse.loadMore')}</span></div>
          ) : null}

          {/* 供应商 tile：→ 分组页（按供应商筛选） */}
          <div className="m-head m-head-p">
            <span className="ttl">{t('browse.casino.providersTitle')}</span>
            <AllPill label={t('browse.all')} onClick={() => go('/providers')} />
          </div>
          <div className="m-grid m-gprov m-scroll">
            {provTiles.map((p, i) => (
              <div key={'p' + i} className="m-p" role={p ? 'button' : undefined} tabIndex={p ? 0 : undefined} onClick={() => p && go(`/group/provider/${p.slug || provSlug(p.name)}`)}>
                {p?.logo ? <img className="m-plogo" src={`/assets/providers/${p.logo}.png`} alt={p.name} draggable={false} /> : <SkImg w={108} h={43} radius={8} label={p?.name ?? ''} />}
              </div>
            ))}
          </div>
        </section>
      </div>}

      <style jsx>{`
        .sk-page, .sk-page :global(*) { box-sizing: border-box; }
        .sk-page { color: var(--vp-text, #e6e8ec); font-size: 14px; }
        .ttl { font-size: 18px; font-weight: 600; white-space: nowrap; }
        :global(.cs__gm) { display: flex; flex-direction: column; height: 40px; margin-top: 8px; font-size: 13px; }
        :global(.cs__gm) span:first-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
        :global(.cs__gm) span:last-child { color: #8d93a0; font-size: 12px; }
        :global(.cs__gc) { position: relative; min-width: 0; cursor: pointer; }
        .s-ph { color: #8d93a0; font-size: 14px; }
        .grid { display: grid; }
        .head { display: flex; align-items: center; justify-content: space-between; height: 32px; }
        .hr { display: flex; align-items: center; gap: 8px; margin-right: 0; }
        .hr-arr { gap: 8px; margin-right: 0; }


        /* ---------- 网页 1280 ---------- */
        .desk { display: none; max-width: 1320px; margin: 0 auto; padding: 0 0 8px; }
        .hero { display: grid; grid-template-columns: minmax(0, 1.83fr) minmax(0, 1fr); gap: 18px; align-items: stretch; aspect-ratio: 968 / 234; min-height: 234px; }
        .slider { position: relative; min-width: 0; min-height: 234px; border-radius: 24px; overflow: hidden; }
        .info { position: relative; width: 100%; min-height: 234px; border-radius: 24px; overflow: hidden; background: rgba(26, 26, 27, 0.8); cursor: pointer; }
        :global(.casino_pg__info-img) { position: absolute; left: 1px; top: 1px; width: calc(100% - 2px); }
        .info.mem :global(.casino_pg__info-img) { opacity: 0.8; }
        :global(.casino_pg__info-img) { position: absolute; inset: 0; }
        .band { position: absolute; left: 0; bottom: 0; width: 100%; height: 96px; padding: 0 16px 18px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; background: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0)); }
        .band-t { font-size: 16px; font-weight: 600; letter-spacing: 1px; color: #f6c96a; }
        .band-a { font-variant-numeric: tabular-nums; font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.7); }

        .sbrow { display: flex; gap: 12px; margin-top: 20px; }
        .recent { flex: none; height: 48px; padding: 0 28px; border: 0; border-radius: 12px; background: rgba(255, 255, 255, 0.06); color: #e6e8ec; display: inline-flex; align-items: center; gap: 10px; font: 600 16px/1 inherit; cursor: pointer; transition: background .2s; }
        .recent:hover { background: rgba(255, 255, 255, 0.12); }
        .searchbar { position: relative; flex: 1; min-width: 0; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.06); display: flex; align-items: center; padding: 0 8px; cursor: pointer; }
        .chips { display: flex; align-items: flex-start; gap: 8px; height: 64px; padding-top: 16px; }
        .s-ic { flex: none; margin: 0 10px 0 6px; color: #cfd4e6; }
        :global(.subcats) { gap: 10px; padding: 4px 0 8px; }
        .sc { height: 44px; padding: 0 18px; display: inline-flex; align-items: center; border-radius: 12px; background: rgba(255, 255, 255, .06); border: 1px solid transparent; font-size: 16px; font-weight: 500; color: #cfd4e6; cursor: pointer; }
        .sc.on { border-color: var(--vp-primary); color: var(--vp-primary); background: transparent; }
        :global(.chip-track) { gap: 8px; flex: 1; min-width: 0; }
        :global(.pv-logo) { width: 32px; height: 32px; object-fit: contain; flex: none; }
        :global(.lobby-ic) { flex: none; }
        :global(.m-plogo) { width: 108px; height: 43px; object-fit: contain; border-radius: 8px; background: rgba(255, 255, 255, .06); padding: 6px 10px; box-sizing: border-box; }
        .chip { height: 48px; flex: none; border-radius: 12px; border: 1px solid transparent; background: rgba(255, 255, 255, 0.06); display: flex; align-items: center; gap: 6px; padding: 0 12px 0 8px; font-size: 14px; font-weight: 500; color: #aeb2bb; white-space: nowrap; cursor: pointer; }
        .chip:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
        .chip.on { background: rgba(5, 242, 106, 0.1); border-color: rgba(5, 242, 106, .6); color: var(--vp-primary); }
        .chip-more { height: 48px; padding: 0 16px 0 8px; flex: none; border-radius: 12px; background: rgba(255, 255, 255, 0.06); display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }

        .sec { position: relative; }
        .sec-a { margin-top: 1px; }
        /* 游戏行裁切框 + 轨道：轨道列宽 = (968-4×16)/5，与可见 5 张的 pitch 197 一致 */
        :global(.row-track) { margin-top: 13px; gap: 16px; }
        :global(.row-track > .cs__gc) { width: calc((100% - 64px) / 5); }
        .sec-b { margin-top: 25px; }
        .g6 { grid-template-columns: repeat(6, 1fr); gap: 17px; margin-top: 13px; }
        .more-row { display: flex; justify-content: flex-end; margin-top: 24px; margin-right: 76px; }
        .more-row .btn { cursor: pointer; }
        .g6-second { margin-top: 13px; }

        /* ---------- 手机 375 ---------- */
        .mob { display: block; background: #1a1a21; }
        .m-banner { position: relative; height: 233px; margin: -8px -8px 0; }
        .m-tag { position: absolute; left: 20px; top: 128px; z-index: 11; height: 38px; padding: 0 22px; border-radius: 28px; background: rgba(255, 255, 255, 0.18); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; letter-spacing: 1px; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6); pointer-events: none; }
        .m-strip { margin: 0 0 16px; height: 68px; }
        /* 奖池水晶光效：常态不规则闪烁；每 7s 突然爆发一次高亮绿光，并伴随轻微震动 */
        .fx-glow, .fx-burst { position: absolute; inset: 0; pointer-events: none; border-radius: inherit; mix-blend-mode: screen; }
        .fx-glow { background: radial-gradient(ellipse 55% 70% at 50% 45%, rgba(57, 255, 182, 0.38), rgba(0, 255, 122, 0) 70%); animation: fxFlick 2.6s steps(1, end) infinite; }
        .fx-burst { background: radial-gradient(ellipse 80% 90% at 50% 45%, rgba(190, 255, 225, 0.95), rgba(0, 255, 122, 0.55) 40%, rgba(0, 255, 122, 0) 75%); opacity: 0; animation: fxBurst 7s ease-out infinite; }
        :global(.fx-shake) { animation: fxShake 7s linear infinite; }
        @keyframes fxFlick { 0% { opacity: .35 } 8% { opacity: .9 } 14% { opacity: .5 } 22% { opacity: 1 } 31% { opacity: .4 } 45% { opacity: .8 } 52% { opacity: .55 } 63% { opacity: 1 } 74% { opacity: .45 } 86% { opacity: .85 } 93% { opacity: .5 } }
        @keyframes fxBurst { 0%, 84% { opacity: 0 } 86% { opacity: 1 } 88% { opacity: .35 } 90% { opacity: .95 } 100% { opacity: 0 } }
        @keyframes fxShake { 0%, 84%, 100% { transform: none; filter: none } 85% { transform: translate(1.5px, -1px); filter: brightness(1.7) saturate(1.3) } 86% { transform: translate(-1.5px, 1px) } 87% { transform: translate(1px, 1.5px); filter: brightness(1.4) } 88% { transform: translate(-1px, -1px) } 90% { transform: translate(.5px, 0); filter: brightness(1.2) } 93% { transform: none; filter: none } }
        @media (prefers-reduced-motion: reduce) { .fx-glow, .fx-burst, :global(.fx-shake) { animation: none } }
        .m-strip-in .fx-glow { background: radial-gradient(ellipse 40% 90% at 70% 62%, rgba(57, 255, 182, 0.38), rgba(0, 255, 122, 0) 70%); }
        .m-strip-in .fx-burst { background: radial-gradient(ellipse 55% 110% at 70% 62%, rgba(190, 255, 225, 0.95), rgba(0, 255, 122, 0.55) 40%, rgba(0, 255, 122, 0) 75%); }
        .m-strip-in { position: relative; height: 68px; cursor: pointer; }
        .m-strip-t { position: absolute; left: 14px; top: 14px; font-size: 14px; font-weight: 700; letter-spacing: 1px; color: #f6c96a; text-shadow: 0 1px 4px rgba(0,0,0,.6); }
        .m-strip-a { font-variant-numeric: tabular-nums; position: absolute; left: 14px; bottom: 12px; font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.7); white-space: nowrap; }
        :global(.casino_pg__m-strip-img) { display: block; cursor: pointer; }
        .m-mem { height: 68px; border-radius: 8px; background: rgba(255, 255, 255, 0.06); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
        .m-mem-t { font-size: 13px; color: #8d93a0; }
        .m-mem-v { font-size: 18px; font-weight: 700; }
        .m-tabs { height: 130px; margin: 0 -12px; padding: 11px 12px 0; border-radius: 10px 10px 0 0; background: #1a1a21; }
        /* 参考站：搜索条 30 高，放大镜在左 14，文字从 x≈55 开始（相对条左 43） */
        .m-search { position: relative; height: 30px; border-radius: 8px; background: rgba(255, 255, 255, 0.06); display: flex; align-items: center; padding: 0 8px 0 43px; cursor: pointer; }
        .m-search::before { content: ''; position: absolute; left: 14px; top: 8px; width: 10px; height: 10px; border: 2px solid #8d8d92; border-radius: 50%; }
        :global(.m-tabrow) { gap: 8px; margin-top: 2px; padding-top: 17px; }
        .m-scroll { overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; overscroll-behavior-x: contain; margin-right: -12px; padding-right: 12px; }
        .m-scroll::-webkit-scrollbar { display: none; }
        .m-scroll > :global(*) { scroll-snap-align: start; }
        /* 参考站：标签条 74×54，图标 28 在上、11px/500 小字在下，间距 6，距上 12 */
        .m-tab { width: 74px; min-width: 74px; max-width: 74px; height: 54px; margin-top: 12px; flex: none; box-sizing: border-box; border-radius: 8px; background: rgba(255, 255, 255, 0.06); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 11px; font-weight: 500; color: #d8d8dc; cursor: pointer; overflow: hidden; }
        .m-ci { width: 28px; height: 28px; object-fit: contain; }
        .m-tab span { max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .m-tab.on { background: rgba(34, 197, 94, 0.12); box-shadow: inset 0 0 0 1px #22c55e; color: #fff; }

        .m-lobby { margin: 0 -12px; padding: 8px 12px 8px; }
        .m-head { display: flex; align-items: center; justify-content: space-between; height: 32px; padding-right: 12px; }
        /* 标题：参考站 16px/600，文字中心 y≈508；首个标题相对骨架下移 3px，不影响后续布局 */
        .m-head .ttl { font-size: 16px; font-weight: 600; }
        .m-lobby > .m-head:first-child { position: relative; top: 3px; }
                .m-head-b { margin-top: 20px; }
        .m-head-p { margin-top: 20px; }
        .m-grid { display: grid; }
        .m-g168 { grid-auto-flow: column; grid-template-rows: repeat(2, auto); grid-auto-columns: 168px; column-gap: 8px; row-gap: 8px; margin-top: 16px; }
        .m-c { width: 168px; cursor: pointer; }
        .m-gm { display: flex; flex-direction: column; height: 51px; font-size: 12px; font-weight: 500; color: #d8d8dc; }
        .m-gm span:first-child { padding-top: 7px; }
        .m-gm span:last-child { align-self: flex-start; margin-top: 4px; padding: 2px 8px; border-radius: 4px; background: rgba(5, 242, 106, 0.12); color: var(--vp-primary); font-size: 11px; }
        .m-g110 { grid-auto-flow: column; grid-template-rows: repeat(2, 153px); grid-auto-columns: 110px; column-gap: 8px; row-gap: 8px; margin-top: 10px; }
        .m-c2 { width: 110px; cursor: pointer; }
        .m-more { display: flex; justify-content: center; margin-top: 16px; }
        .m-gprov { grid-auto-flow: column; grid-template-rows: repeat(2, 43px); grid-auto-columns: 108px; column-gap: 10px; row-gap: 8px; margin-top: 10px; }
        .m-p { width: 108px; cursor: pointer; }

        @media (min-width: 1280px) { :global(.row-track > .cs__gc) { width: calc((100% - 80px) / 6); } }
        @media (min-width: 768px) {
          .desk { display: block; }
          .mob { display: none; }
        }
        /* 768-1023：外壳侧栏占位后内容区变窄，轮播与信息卡改为等分两列 */
        @media (min-width: 768px) and (max-width: 1023px) {
          .hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
          .info { width: 100%; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）



