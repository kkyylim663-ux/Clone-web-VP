'use client'
// 收藏 / 最近玩（browse 组，对应 Vue 的 SkFavRecent）。数据来自本地存储（vp_fav / vp_recent），游戏信息来自站点游戏列表。
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import type { ApiGame } from '@/lib/types'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import SkStatus from '@/components/browse/SkStatus'
import { FAV_KEY, RECENT_KEY, type GamesResp, phaseOf, useHover, useLocalList, usePlay, useRemote } from '@/components/browse/browseData'

export default function FavRecent({ tab }: { tab: 'fav' | 'recent' }) {
  return <Suspense fallback={null}><FavRecentView tab={tab} /></Suspense>
}

function FavRecentView({ tab: initial }: { tab: 'fav' | 'recent' }) {
  const st = useSearchParams().get('state') ?? ''
  // 标签页内切换，不跳转路由（来源：parity-next.md「/casino/favourites-recent @375」：参考站点 Recent 留在收藏页）
  const [tab, setTab] = useState<'fav' | 'recent'>(initial)
  const { lang, t } = useLanguage()
  const { loggedIn } = useAuth()
  const { enterLogin, go } = useGate()
  const play = usePlay()
  const { cls, on } = useHover()
  const fav = useLocalList(FAV_KEY)
  const recent = useLocalList(RECENT_KEY)
  const games = useRemote<GamesResp>('/api/web/site/games', {})

  const member = st === 'member' || (st !== 'guest' && loggedIn)
  const slugs = tab === 'fav' ? fav.list : recent.list
  const gmap = new Map<string, ApiGame>((games.data?.list ?? []).map(g => [g.slug, g]))
  const items = slugs.map(s => gmap.get(s)).filter((g): g is ApiGame => !!g)
  const phase = phaseOf(st, games.loading, games.error, !games.loading && items.length === 0)
  const name = (g: ApiGame) => g.translations[lang]?.name ?? g.translations.zh?.name ?? g.slug

  return (
    <div className="fr">
      <div className="fr-tabs">
        <span className={`fr-tab ${tab === 'fav' ? 'on' : ''}`} role="button" tabIndex={0} onClick={() => setTab('fav')}>{t('browse.fav.tabFav')}</span>
        <span className={`fr-tab ${tab === 'recent' ? 'on' : ''}`} role="button" tabIndex={0} onClick={() => setTab('recent')}>{t('browse.fav.tabRecent')}</span>
      </div>

      <div className="fr-body">
        {!member ? (
          <div className="fr-gate">
            <span className="fr-gate-t">{t('browse.fav.gateTitle')}</span>
            <span className="fr-gate-s">{t('browse.fav.gateHint')}</span>
            <span className="fr-btn" role="button" tabIndex={0} onClick={() => enterLogin('header')}>{t('browse.fav.login')}</span>
          </div>
        ) : phase === 'error' ? (
          <SkStatus kind="error" title={t('browse.error')} h={240} retryLabel={t('browse.retry')} onRetry={() => games.reload()} className="browse_favrecent__fr-status" />
        ) : phase === 'empty' ? (
          <div className="fr-empty">
            <SkStatus kind="empty" title={tab === 'fav' ? t('browse.fav.emptyFav') : t('browse.fav.emptyRecent')} hint={tab === 'fav' ? t('browse.fav.emptyFavHint') : t('browse.fav.emptyRecentHint')} h={200} />
            <span className="fr-btn" role="button" tabIndex={0} onClick={() => go('/casino')}>{t('browse.fav.browse')}</span>
          </div>
        ) : phase === 'loading' ? (
          <div className="fr-grid">
            {Array.from({ length: 9 }, (_, i) => <div key={i} className="fr-cell mo-shimmer" />)}
          </div>
        ) : (
          <div className="fr-grid">
            {items.map(g => (
              <div key={g.slug} className={cls('g' + g.slug, 'fr-cell')} {...on('g' + g.slug)} onClick={() => play(g.slug)}>
                <SkImg src={coverV(g.slug)} w="100%" h="100%" ratio="112 / 155" radius={8} label={name(g)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .fr { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .fr :global(*) { box-sizing: border-box; }
        .fr-tabs { display: flex; height: 48px; border-bottom: 1px solid #2a2d33; }
        .fr-tab { flex: 1; display: flex; align-items: center; justify-content: center; color: #8d93a0; font-size: 15px; font-weight: 600; cursor: pointer; }
        .fr-tab.on { color: #fff; box-shadow: inset 0 -2px 0 var(--vp-primary); }
        .fr-body { padding: 12px 12px 0; box-sizing: border-box; }
        .fr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .fr-cell { width: auto; height: auto; aspect-ratio: 112 / 155; padding: 0; cursor: pointer; position: relative; }
        .fr-cell :global(.sk-img) { height: 100%; }
        .fr-gate { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 16px; text-align: center; }
        .fr-gate-t { font-size: 16px; font-weight: 600; }
        .fr-gate-s { color: #8d93a0; font-size: 13px; }
        .fr-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding-top: 40px; }
        :global(.browse_favrecent__fr-status) { margin-top: 40px; }
        .fr-btn { display: inline-block; height: 40px; line-height: 40px; padding: 0 20px; border-radius: 8px; background: var(--vp-grad); color: var(--vp-on-primary); font-weight: 600; font-size: 14px; cursor: pointer; }

        /* ---- 网页端（推断：沿用分组页的 6 列网格） ---- */
        @media (min-width: 768px) {
          .fr-tabs { max-width: 968px; margin: 0 auto; height: 56px; }
          .fr-body { max-width: 968px; margin: 0 auto; padding-top: 24px; }
          .fr-grid { grid-template-columns: repeat(6, 1fr); gap: 16px; }
          .fr-cell { aspect-ratio: 148 / 203; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）

