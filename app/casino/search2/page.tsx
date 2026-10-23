'use client'
// 游戏搜索（browse 组）：搜索框防抖 300ms 真搜索；分类 tab / 供应商 tile 真筛选；加载更多。版式同 Vue 骨架（CSS 原样）。
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { catName, type ApiCategory, type ApiProvider, DEBOUNCE_MS, phaseOf, PAGE_SIZE, type GamesResp, useHover, usePlay, useRemote } from '@/components/browse/browseData'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import SkStatus from '@/components/browse/SkStatus'
import type { ApiGame } from '@/lib/types'

/** 分类 tab 宽度（Vue 版前 5 个：全部 + 4 个分类） */
const catW = [72, 72, 101, 78, 72]
const SHOW = 36

export default function Page() {
  return <Suspense fallback={null}><SearchView /></Suspense>
}

function SearchView() {
  const st = useSearchParams().get('state') ?? ''
  const { lang, t } = useLanguage()
  const { back } = useGate()
  const play = usePlay()
  const { cls, on } = useHover()
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [prov, setProv] = useState('')
  const [shown, setShown] = useState(SHOW)

  useEffect(() => {
    const id = setTimeout(() => { setQ(input.trim()); setShown(SHOW) }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [input])

  const cats = useRemote<{ list: ApiCategory[] }>('/api/web/browse/categories', {})
  const provs = useRemote<{ list: ApiProvider[] }>('/api/web/browse/providers', {})
  const games = useRemote<GamesResp>('/api/web/site/games', { q, category: cat, provider: prov })

  const list: ApiGame[] = games.data?.list ?? []
  const active = !!(q || cat || prov)
  const pending = games.loading
  const phase = phaseOf(st, pending, games.error, !pending && list.length === 0)
  const tabs = [{ key: '', name: t('browse.all') }, ...(cats.data?.list ?? []).map(c => ({ key: c.key, name: catName(c, lang) }))].slice(0, catW.length)
  const provList = provs.data?.list ?? []
  const shownList = list.slice(0, shown)
  const cancel = () => back()

  return (
    <div className="sp">
      {/* 顶部：搜索行（移动端 55px，含取消）；网页端搜索框在内容区顶部 */}
      <div className="sp-top">
        <div className="sp-search">
          <span className="sp-search__ico" aria-hidden="true" />
          <input className="sp-search__input" value={input} placeholder={t('browse.search.placeholder')} onChange={e => setInput(e.target.value)} />
        </div>
        <span className="sp-cancel" role="button" tabIndex={0} onClick={cancel}>{t('browse.cancel')}</span>
      </div>

      {/* 分类 tab（横向滚动）：真筛选 */}
      <div className="sp-cats">
        {tabs.map((c, i) => (
          <span key={c.key} className={`sp-cat ${cat === c.key ? 'on' : ''}`} style={{ ['--w' as string]: `${catW[i]}px` }} role="button" tabIndex={0} onClick={() => { setCat(c.key); setShown(SHOW) }}>{c.name}</span>
        ))}
      </div>

      <div className="sp-body">
        {/* 左列：供应商（移动端固定 704 高，内部滚动）；真筛选 */}
        <aside className="sp-prov">
          <span className="sp-label">{t('browse.group.providers')}</span>
          <div className={`sp-prov__tile sp-prov__all ${prov === '' ? 'on' : ''}`} role="button" tabIndex={0} onClick={() => setProv('')}>{t('browse.all')}</div>
          {provList.map(p => (
            <div key={p.slug} className={`sp-prov__tile ${prov === p.name ? 'on' : ''}`} role="button" tabIndex={0} onClick={() => setProv(prov === p.name ? '' : p.name)}>
              {p.logo ? <img className="sp-prov__logo" src={`/assets/providers/${p.logo}.png`} alt={p.name} draggable={false} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.removeAttribute('hidden') }} /> : null}
              <span className="sp-prov__name" hidden={!!p.logo}>{p.name}</span>
            </div>
          ))}
        </aside>

        {/* 右列：游戏网格 */}
        <section className={`sp-main ${active ? 'sp-main--result' : ''}`}>
          {active && phase === 'ok' ? <p className="sp-count">{t('browse.search.count', { n: list.length })}</p> : null}

          {phase === 'loading' ? (
            <div className="sp-grid">
              {Array.from({ length: 12 }, (_, i) => <div key={i} className="sp-skel mo-shimmer" />)}
            </div>
          ) : phase === 'empty' ? (
            <SkStatus kind="empty" title={t('browse.search.noResult')} hint={t('browse.search.noResultHint')} h={200} className="casino_search2_pg__sp-status" />
          ) : phase === 'error' ? (
            <SkStatus kind="error" title={t('browse.error')} h={200} retryLabel={t('browse.retry')} onRetry={() => games.reload()} className="casino_search2_pg__sp-status" />
          ) : (
            <>
              <div className="sp-grid">
                {shownList.map((g) => (
                  <div key={g.id} className={cls('g' + g.id, 'sp-game')} {...on('g' + g.id)} onClick={() => play(g.slug)}>
                    <SkImg src={coverV(g.slug)} w="100%" ratio="82 / 113" radius={8} label={g.translations[lang as 'zh' | 'en']?.name ?? g.translations.zh?.name ?? g.slug} />
                  </div>
                ))}
              </div>
              {list.length > shown ? (
                <div className="sp-more"><span className="sp-more__btn" role="button" tabIndex={0} onClick={() => setShown(x => x + PAGE_SIZE)}>{t('browse.loadMore')}</span></div>
              ) : null}
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .sp { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .sp :global(*) { box-sizing: border-box; }

        /* ---- 移动端 375 ---- */
        .sp-top { display: flex; align-items: center; gap: 12px; height: 55px; padding: 9px 12px 0; box-sizing: border-box; }
        .sp-search { flex: 1 1 0; min-width: 0; max-width: 303px; height: 36px; box-sizing: border-box; display: flex; align-items: center; gap: 8px;
          padding: 0 10px 0 14px; border-radius: 8px; background: rgba(255, 255, 255, 0.08); color: #8d8d92; font-size: 12px; }
        .sp-search__ico { flex: none; width: 12px; height: 12px; border: 2px solid #8d8d92; border-radius: 50%; }
        .sp-search__input { flex: 1; min-width: 0; height: 100%; background: transparent; border: 0; outline: 0; color: #fff; font: inherit; font-size: 12px; }
        .sp-search__input::placeholder { color: #8d8d92; }
        .sp-cancel { color: var(--vp-primary); font-size: 14px; cursor: pointer; }

        .sp-cats { display: flex; gap: 8px; height: 53px; padding: 9px 12px 8px; box-sizing: border-box; overflow-x: auto; scrollbar-width: none; }
        .sp-cat { flex: none; width: var(--w); height: 36px; line-height: 36px; border-radius: 8px; background: rgba(255, 255, 255, 0.05);
          color: #c4c8d0; text-align: center; white-space: nowrap; cursor: pointer; }
        .sp-cat.on { background: rgba(5, 242, 106, 0.18); color: #fff; font-weight: 600; box-shadow: inset 0 0 0 1px var(--vp-primary); }

        .sp-body { display: flex; height: 704px; padding-left: 12px; box-sizing: border-box; }
        .sp-prov { flex: none; width: 73px; margin-right: 17px; overflow-y: auto; scrollbar-width: none; }
        .sp-label { display: block; height: 14px; margin: 8px 0 3px; color: #8d8d92; font-size: 12px; line-height: 14px; }
        .sp-prov__tile { width: 73px; height: 52px; margin-bottom: 8px; border-radius: 8px; background: #2a2a32;
          display: flex; align-items: center; justify-content: center; box-sizing: border-box; cursor: pointer; padding: 4px; }
        .sp-prov__logo { display: block; width: 100%; height: 100%; object-fit: contain; }
        .sp-prov__name { font-size: 11px; color: #c4c8d0; text-align: center; overflow: hidden; text-overflow: ellipsis; }
        .sp-prov__all { height: 40px; background: transparent; border: 1px solid var(--vp-primary); color: #fff; font-size: 12px; }
        .sp-prov__tile.on { box-shadow: inset 0 0 0 1px var(--vp-primary); }

        .sp-main { flex: 1; min-width: 0; padding: 24px 12px 0 0; box-sizing: border-box; overflow-y: auto; scrollbar-width: none; }
        .sp-main--result { padding-top: 8px; }
        .sp-count { height: 16px; margin: 0 0 8px; color: #8d8d92; font-size: 12px; line-height: 16px; }
        .sp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8.4px 7.5px; }
        .sp-skel { width: 100%; height: auto; aspect-ratio: 82 / 113; padding: 0; border-radius: 8px; }
        .sp-game { cursor: pointer; }
        :global(.casino_search2_pg__sp-status) { margin-top: 24px; }
        .sp-more { display: flex; justify-content: center; margin-top: 16px; }
        .sp-more__btn { height: 32px; padding: 0 16px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; cursor: pointer; }

        /* ---- 网页端 1280（推断：左列 200 + 右侧 6 列网格） ---- */
        @media (min-width: 768px) {
          .sp { background: transparent; }
          .sp-top { height: auto; padding: 12px 32px 0; }
          .sp-search { width: 360px; }
          .sp-cancel { display: none; }
          .sp-cats { height: auto; padding: 12px 32px; }
          .sp-cat { width: auto; padding: 0 16px; }
          .sp-body { height: auto; align-items: flex-start; padding: 0 32px 32px; }
          .sp-prov { width: 200px; max-height: 740px; margin-right: 24px; }
          .sp-prov__tile { width: 100%; }
          .sp-label { margin: 0 0 12px; }
          .sp-main { padding: 0; }
          .sp-main--result { padding-top: 0; }
          .sp-count { margin-bottom: 12px; }
          .sp-grid { grid-template-columns: repeat(6, 1fr); gap: 16px; }
          :global(.casino_search2_pg__sp-status) { margin-top: 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）

