'use client'
// 游戏详情（browse 组）：主图「开始游戏」真钱未登录先去登录（不执行）；收藏切换写本地（vp_fav）；相关游戏同分类。
import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import { pickLang } from '@/lib/pickLang'
import type { ApiGame } from '@/lib/types'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import SkStatus from '@/components/browse/SkStatus'
import { type ApiCategory, type GamesResp, FAV_KEY, addRecent, catName, phaseOf, useHover, useLocalList, usePlay, useRemote } from '@/components/browse/browseData'

export default function Page() {
  return <Suspense fallback={null}><GameView /></Suspense>
}

function GameView() {
  const { slug } = useParams<{ slug: string }>()
  const st = useSearchParams().get('state') ?? ''
  const router = useRouter()
  const { lang, t } = useLanguage()
  const { loggedIn } = useAuth()
  const { guard, back } = useGate()
  const { showToast } = useLayout()
  const play = usePlay()
  const { cls, on } = useHover()
  const fav = useLocalList(FAV_KEY)
  const games = useRemote<GamesResp>('/api/web/site/games', {})
  const cats = useRemote<{ list: ApiCategory[] }>('/api/web/browse/categories', {})

  const list: ApiGame[] = games.data?.list ?? []
  const game = list.find(g => g.slug === slug)
  const phase = phaseOf(st, games.loading, games.error, false)
  const missing = st === 'missing' || (!games.loading && !games.error && !!games.data && !game)
  const name = pickLang(game?.translations, lang)?.name ?? game?.slug ?? ''
  const cat = catName(cats.data?.list.find(c => c.key === game?.category), lang)
  const rel = game ? list.filter(g => g.category === game.category && g.slug !== game.slug).slice(0, 6) : []
  const isFav = fav.list.includes(slug)

  // 主图「开始游戏」：未登录 → 登录（来源 game，文档 handlers-static §4 pinia 游戏打开）；已登录 → 记入最近玩并提示（演示，不真正启动）
  const start = () => guard('game', () => { addRecent(slug); showToast(t('browse.game.launching')) })
  const toggleFav = () => {
    const on = fav.toggle(slug)
    showToast(on ? t('browse.game.favAdded') : t('browse.game.favRemoved'))
  }

  return (
    <div className="gd">
      <div className="gd-wrap">
        <header className="gd-bar">
          <span className="gd-back" role="button" tabIndex={0} aria-label={t('browse.back')} onClick={back}>‹</span>
          <span className="gd-spacer" />
          <span className="gd-ico gd-fav" role="button" tabIndex={0} aria-label={isFav ? t('browse.game.unfav') : t('browse.game.fav')} onClick={() => (st === 'member' ? toggleFav() : guard('game', toggleFav))}>{isFav ? '★' : '☆'}</span>
          <span className="gd-ico" />
        </header>

        {missing ? (
          <SkStatus kind="empty" title={t('browse.game.notFound')} hint={t('browse.game.notFoundHint')} h={420} className="casino_games_slug_pg__gd-status" />
        ) : phase === 'error' ? (
          <SkStatus kind="error" title={t('browse.error')} h={420} retryLabel={t('browse.retry')} onRetry={() => games.reload()} className="casino_games_slug_pg__gd-status" />
        ) : phase === 'loading' || !game ? (
          <>
            <div className="gd-hero mo-shimmer" />
            <div className="gd-info gd-info-loading" />
          </>
        ) : (
          <>
            <div className="gd-hero" role="button" tabIndex={0} onClick={start}>
              <SkImg src="/assets/casino/detail-bg.webp" w="100%" h="100%" radius="inherit" label="" style={{ background: 'var(--vp-bg)' }} />
            </div>

            <div className="gd-info">
              <SkImg w={64} h={64} radius={8} label="" className="casino_games_slug_pg__gd-thumb" style={{ background: 'var(--vp-bg)' }} />
              <div className="gd-meta">
                <span className="ph">{name}</span>
                <span className="ph ph--sub">{game.provider}{cat ? ` · ${cat}` : ''}</span>
              </div>
              <span className="gd-chev" aria-hidden="true">⌄</span>
            </div>

            <div className="gd-rec-t"><span className="ph">{t('browse.game.related')}</span></div>
            <div className="gd-rec">
              {rel.map(g => (
                <div key={g.slug} className={cls('r' + g.slug, 'gd-card')} {...on('r' + g.slug)} onClick={() => play(g.slug)}>
                  <SkImg src={coverV(g.slug)} w="100%" h="100%" radius={8} label={pickLang(g.translations, lang)?.name ?? g.slug} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .gd { min-height: 100%; background: #1a1a1b; color: #fff; font-size: 14px; }
        .gd :global(*) { box-sizing: border-box; }
        .gd-wrap { padding: 0 12px 24px; box-sizing: border-box; }
        .gd-bar { display: flex; align-items: center; gap: 8px; height: 55px; }
        .gd-back { width: 32px; font-size: 26px; line-height: 1; cursor: pointer; }
        .gd-hero { display: block; width: 100%; height: 200px; box-sizing: border-box; border-radius: 12px; cursor: pointer; overflow: hidden; }
        .gd-spacer { flex: 1; }
        .gd-ico { width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .gd-fav { cursor: pointer; color: #f5b942; }
        .gd-info { display: flex; align-items: center; gap: 12px; margin-top: 12px; padding: 12px; border-radius: 16px; background: #26262c; box-sizing: border-box; }
        .gd-info-loading { height: 88px; }
        :global(.casino_games_slug_pg__gd-thumb) { flex: none; }
        .gd-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .gd-chev { color: #8d93a0; font-size: 18px; }
        .ph { color: #c4c8d0; font-size: 14px; }
        .ph--sub { color: #8d93a0; font-size: 12px; }
        .gd-rec-t { margin: 16px 0 8px; }
        .gd-rec { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .gd-card { aspect-ratio: 112 / 155; cursor: pointer; }
        .gd-card :global(.sk-img) { height: 100%; }
        :global(.casino_games_slug_pg__gd-status) { margin-top: 40px; }

        /* ---- 网页端 1280（来自实测：968 宽内容卡，主图 545 高，推荐 6 列 147 宽，间距 17） ---- */
        @media (min-width: 768px) {
          .gd-wrap { max-width: 968px; margin: 0 auto; padding: 0 0 32px; }
          .gd-bar { height: 64px; padding: 0 16px; background: #26262c; border-radius: 16px 16px 0 0; box-sizing: border-box; }
          .gd-hero { height: 545px; border-radius: 0 0 24px 24px; }
          .gd-info { height: 96px; margin-top: 24px; padding: 16px; border-radius: 20px; }
          .gd-rec-t { margin-top: 42px; }
          .gd-rec { grid-template-columns: repeat(6, 147px); justify-content: space-between; gap: 17px; }
          .gd-card { aspect-ratio: 147 / 202; }
          :global(.casino_games_slug_pg__gd-status) { margin-top: 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）

