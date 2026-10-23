'use client'
// 分组页（browse 组）：/group/category/<key> 按分类、/group/provider/<slug> 按供应商真筛选；「加载更多」前端分页。
import { Suspense, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import type { ApiGame } from '@/lib/types'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import SkStatus from '@/components/browse/SkStatus'
import { casinoSub } from '@/data/nav'
import { type ApiCategory, type ApiProvider, type GamesResp, PAGE_SIZE, catName, phaseOf, useHover, usePlay, useRemote } from '@/components/browse/browseData'

const SHOW = 36

export default function Page() {
  return <Suspense fallback={null}><GroupView /></Suspense>
}

function GroupView() {
  const { slugType, slug } = useParams<{ slugType: string, slug: string }>()
  const st = useSearchParams().get('state') ?? ''
  const { lang, t } = useLanguage()
  const { loggedIn } = useAuth()
  const { back, enterLogin, enterRegister, go } = useGate()
  const play = usePlay()
  const { cls, on } = useHover()
  const [shown, setShown] = useState(SHOW)
  const [sel, setSel] = useState<string[]>([])
  const [provOpen, setProvOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>([])

  const member = st === 'member' || (st !== 'guest' && loggedIn)
  const cats = useRemote<{ list: ApiCategory[] }>('/api/web/browse/categories', {})
  const provs = useRemote<{ list: ApiProvider[] }>('/api/web/browse/providers', {})

  // 分组条件：分类用 key；供应商用 slug 反查名称（名称未到时用不匹配值，避免先显示全部）
  const byProvider = slugType === 'provider'
  const provName = provs.data?.list.find(p => p.slug === slug)?.name ?? ''
  // /group/slug/<slug>（侧栏赌场子菜单）：按子菜单映射到本站分类 key；没有数据的分类 → 空态
  const sub = slugType === 'slug' ? casinoSub.find((c) => c.slug === slug) : undefined
  const catKey = slugType === 'slug' ? (sub?.cat ?? `__${slug}`) : slug
  const popular = slugType === 'slug' && slug === 'popular' // 热门：不限分类
  const filter = byProvider ? { provider: provName || '-' } : popular ? {} : { category: catKey }
  const games = useRemote<GamesResp>('/api/web/site/games', filter)
  const title = popular ? t('browse.group.popular') : byProvider ? (provName || t('browse.group.title')) : sub ? t(sub.k) : (catName(cats.data?.list.find(c => c.key === slug), lang) || t('browse.group.title'))

  const all: ApiGame[] = games.data?.list ?? []
  const EXTRA = ['fishing', 'mini', 'table', 'featured', 'buyin']
  const base: ApiGame[] = popular ? all.filter((g) => !EXTRA.includes(g.category)) : all
  const list: ApiGame[] = sel.length ? base.filter((g) => sel.includes(g.provider)) : base
  const countOf = (name: string) => base.filter((g) => g.provider === name).length
  const openProv = () => { setDraft(sel); setProvOpen(true) }
  const toggle = (name: string) => setDraft((d) => (d.includes(name) ? d.filter((n) => n !== name) : [...d, name]))
  const views = (slug: string) => 300 + (slug.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 11000)
  const pending = games.loading || (byProvider && provs.loading)
  const phase = phaseOf(st, pending, games.error, !pending && list.length === 0)
  const more = list.length > shown

  return (
    <div className="gp">
      <header className="gp-bar">
        <span className="gp-back" role="button" tabIndex={0} aria-label={t('browse.back')} onClick={back}>‹</span>
        <h1 className="gp-title">{title}</h1>
        {!member ? (
          <div className="gp-auth">
            <span className="gp-btn gp-btn--ghost" role="button" tabIndex={0} onClick={() => enterLogin('header')}>{t('browse.fav.login')}</span>
            <span className="gp-btn gp-btn--main" role="button" tabIndex={0} onClick={() => enterRegister('header')}>{t('browse.register')}</span>
          </div>
        ) : (
          <SkImg src={avatarImg(1)} w={32} h={32} round label="" className="group_slugtype_slug_pg__gp-avatar" />
        )}
      </header>

      <div className="gp-tools">
        <span className="gp-prov" role="button" tabIndex={0} onClick={openProv}>
          {t('browse.group.providers')}
          {sel.length ? <em className="gp-prov__n">{sel.length}</em> : null}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7" /></svg>
        </span>
        <span className="gp-search" role="button" tabIndex={0} onClick={() => go('/casino/search2')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          {t('browse.group.search')}
        </span>
      </div>

      <div className="gp-body">
        {phase === 'empty' ? (
          <SkStatus kind="empty" title={t('browse.group.emptyTitle')} hint={t('browse.group.emptyHint')} h={240} className="group_slugtype_slug_pg__gp-status" />
        ) : phase === 'error' ? (
          <SkStatus kind="error" title={t('browse.error')} h={240} retryLabel={t('browse.retry')} onRetry={() => games.reload()} className="group_slugtype_slug_pg__gp-status" />
        ) : phase === 'loading' ? (
          <div className="gp-grid">
            {Array.from({ length: 18 }, (_, i) => <div key={i} className="gp-cell mo-shimmer" />)}
          </div>
        ) : (
          <>
            <div className="gp-grid">
              {list.slice(0, shown).map(g => (
                <div key={g.slug} data-gslug={g.slug} className={cls('g' + g.slug, 'gp-img')} {...on('g' + g.slug)} onClick={() => play(g.slug)}>
                  <SkImg src={coverV(g.slug)} w="100%" h="100%" radius={8} label={g.translations[lang]?.name ?? g.slug} />
                  <span className="gp-views"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>{views(g.slug)}</span>
                </div>
              ))}
            </div>
            {more ? (
              <div className="gp-more"><span className="gp-more__btn" role="button" tabIndex={0} onClick={() => setShown(x => x + PAGE_SIZE)}>{t('browse.loadMore')}</span></div>
            ) : null}
          </>
        )}
      </div>

      {provOpen ? (
        <div className="gp-mask" onClick={() => setProvOpen(false)}>
          <div className="gp-pop" role="dialog" aria-modal="true" aria-label={t('browse.group.providers')} onClick={(e) => e.stopPropagation()}>
            <div className="gp-pop__hd"><b>{t('browse.group.providers')}</b><span role="button" tabIndex={0} aria-label="close" onClick={() => setProvOpen(false)}>✕</span></div>
            <div className="gp-pop__grid">
              {(provs.data?.list ?? []).map((p) => (
                <span key={p.slug} className={`gp-pop__tile${draft.includes(p.name) ? ' on' : ''}`} role="button" tabIndex={0} onClick={() => toggle(p.name)}>
                  {p.logo ? <img className="gp-pop__logo" src={`/assets/providers/${p.logo}.png`} alt={p.name} /> : <strong>{p.name}</strong>}<i>{countOf(p.name)}</i>
                </span>
              ))}
            </div>
            <div className="gp-pop__ft">
              <button type="button" className="gp-pop__reset" onClick={() => setDraft([])}>{t('browse.group.reset')}</button>
              <button type="button" className="gp-pop__ok" onClick={() => { setSel(draft); setShown(SHOW); setProvOpen(false) }}>{t('browse.group.confirm')}</button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .gp { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .gp :global(*) { box-sizing: border-box; }

        /* ---- 移动端 375：顶栏 55，工具行 36（距顶 8），网格 3 列 112×155，间距 8 ---- */
        .gp-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .gp-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .gp-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gp-auth { display: flex; gap: 8px; }
        .gp-btn { display: block; width: 76px; height: 32px; line-height: 30px; border-radius: 8px; border: 1px solid var(--vp-primary);
          font-size: 13px; font-weight: 500; text-align: center; cursor: pointer; }
        .gp-btn--ghost { color: var(--vp-primary); }
        .gp-btn--main { color: var(--vp-on-primary); background: var(--vp-grad); }
        :global(.group_slugtype_slug_pg__gp-avatar) { flex: none; }
        .gp-chips { display: none; }
        .gp-tools { display: flex; gap: 16px; padding: 8px 12px; box-sizing: border-box; }
        .gp-prov { display: flex; align-items: center; gap: 6px; flex: none; height: 36px; padding: 0 10px; box-sizing: border-box; border-radius: 8px; background: #26262c; color: #c4c8d0; font-size: 13px; cursor: pointer; }
        .gp-prov__n { font-style: normal; font-size: 11px; padding: 1px 6px; border-radius: 999px; background: rgba(90, 250, 104, .16); color: var(--vp-primary); }
        .gp-search { flex: 1; display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; box-sizing: border-box; border-radius: 8px; background: #26262c; color: #6b7078; font-size: 13px; cursor: pointer; }
        .gp-body { padding: 3px 12px 0; box-sizing: border-box; }
        .gp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .gp-img { position: relative; aspect-ratio: 112 / 155; cursor: pointer; }
        .gp-views { position: absolute; left: 6px; top: 6px; display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 999px; background: rgba(0, 0, 0, .55); color: #fff; font-size: 11px; font-weight: 600; pointer-events: none; }
        .gp-mask { position: fixed; inset: 0; z-index: 90; display: flex; align-items: flex-end; justify-content: center; background: rgba(0, 0, 0, .6); animation: gp-fade .2s ease-out; }
        .gp-pop { width: 100%; max-height: 80vh; display: flex; flex-direction: column; padding: 16px 12px 12px; box-sizing: border-box; border-radius: 20px 20px 0 0; background: #1d1f26; animation: gp-up .28s cubic-bezier(.2, .8, .2, 1); }
        .gp-pop__hd { position: relative; display: flex; align-items: center; justify-content: center; height: 32px; margin-bottom: 12px; }
        .gp-pop__hd b { font-size: 16px; font-weight: 600; }
        .gp-pop__hd span { position: absolute; right: 0; top: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255, 255, 255, .1); font-size: 13px; cursor: pointer; }
        .gp-pop__grid { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; align-content: start; }
        .gp-pop__tile { display: flex; align-items: center; justify-content: space-between; gap: 4px; height: 52px; padding: 0 10px; box-sizing: border-box; border-radius: 10px; background: #2a2d35; border: 1px solid transparent; cursor: pointer; }
        .gp-pop__tile strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 700; }
        .gp-pop__logo { flex: 1; min-width: 0; height: 28px; object-fit: contain; object-position: left center; }
        .gp-pop__tile i { flex: none; font-style: normal; font-size: 12px; color: #7d828c; }
        .gp-pop__tile.on { border-color: var(--vp-primary); background: rgba(90, 250, 104, .1); }
        .gp-pop__ft { display: flex; gap: 10px; margin-top: 12px; }
        .gp-pop__ft button { flex: 1; height: 48px; border: 0; border-radius: 999px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
        .gp-pop__reset { background: #2a2d35; color: #c4c8d0; }
        .gp-pop__ok { background: var(--vp-grad); color: var(--vp-on-primary); }
        @keyframes gp-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gp-up { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .gp-img :global(.sk-img) { height: 100%; }
        .gp-cell { width: auto; height: auto; aspect-ratio: 112 / 155; padding: 0; border-radius: 8px; }
        :global(.group_slugtype_slug_pg__gp-status) { margin-top: 40px; }
        .gp-more { display: flex; justify-content: center; margin-top: 16px; }
        .gp-more__btn { height: 32px; padding: 0 16px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; cursor: pointer; }

        /* ---- 网页端 1280：顶栏由外壳提供，工具行 48 高（距顶 60），6 列 148×203，列距 16、行距 24 ---- */
        @media (min-width: 768px) {
          .gp { background: transparent; }
          .gp-bar { display: flex; max-width: 1320px; margin: 8px auto 0; padding: 0; }
          .gp-auth { display: none; }
          .gp-title { font-size: 20px; font-weight: 700; }
          .gp-tools { max-width: 1320px; margin: 20px auto 0; padding: 0; height: 48px; gap: 8px; }
          .gp-prov { height: 48px; padding: 0 16px; border-radius: 12px; font-size: 14px; background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .1); }
          .gp-search { height: 48px; border-radius: 12px; font-size: 14px; }
          .gp-mask { align-items: center; }
          .gp-pop { width: 560px; max-height: 86vh; padding: 20px 20px 16px; border-radius: 16px; animation: gp-fade .2s ease-out; }
          .gp-pop__tile { height: 66px; justify-content: center; }
          .gp-pop__tile i { display: none; }
          .gp-pop__tile strong { font-size: 15px; }
          .gp-pop__logo { height: 36px; object-position: center; }
          .gp-body { max-width: 1320px; margin: 0 auto; padding: 16px 0 32px; }
          .gp-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px 12px; }
          .gp-img, .gp-cell { aspect-ratio: 148 / 203; }
          :global(.group_slugtype_slug_pg__gp-status) { margin-top: 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）

