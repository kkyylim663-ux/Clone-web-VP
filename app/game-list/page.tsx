'use client'
// 全部游戏（对应参考站 /game-list，AllGames）：3 列游戏卡网格，手机卡 112×155、列距 7.5、行距 8，顶栏 55。
// 无分页，接口返回多少显示多少；点卡进 /casino/games/<slug>。封面用 SkImg 占位。
// 左上角观看人数是按游戏 id 推算的 mock 数字（后端提供后替换）。?state=loading | empty | error
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import SkStatus from '@/components/browse/SkStatus'
import { type GamesResp, gameName, phaseOf, useRemote } from '@/components/browse/browseData'

export default function Page() {
  return <Suspense fallback={null}><GameListPage /></Suspense>
}

const viewers = (id: number) => String(1000 + ((id * 2749) % 9000))

function GameListPage() {
  const st = useSearchParams().get('state') ?? ''
  const { lang, t } = useLanguage()
  const { back } = useGate()
  const games = useRemote<GamesResp>('/api/web/site/games', {})
  const list = games.data?.list ?? []
  const phase = phaseOf(st, games.loading, games.error, !games.loading && list.length === 0)

  return (
    <div className="gl">
      <header className="gl-bar">
        <span className="gl-back" role="button" tabIndex={0} aria-label={t('browse.back')} onClick={back}>‹</span>
        <h1 className="gl-title">{t('browse.gameList.title')}</h1>
      </header>

      <div className="gl-body">
        {phase === 'empty' ? (
          <SkStatus kind="empty" title={t('browse.group.emptyTitle')} hint={t('browse.group.emptyHint')} h={240} className="game_list_pg__gl-status" />
        ) : phase === 'error' ? (
          <SkStatus kind="error" title={t('browse.error')} h={240} retryLabel={t('browse.retry')} onRetry={() => games.reload()} className="game_list_pg__gl-status" />
        ) : phase === 'loading' ? (
          <div className="gl-grid">
            {Array.from({ length: 18 }, (_, i) => <div key={i} className="gl-cell mo-shimmer" />)}
          </div>
        ) : (
          <div className="gl-grid">
            {list.map((g) => (
              <Link key={g.slug} href={`/casino/games/${g.slug}`} className="game_list_pg__gl-card" aria-label={gameName(g, lang)}>
                <SkImg src={coverV(g.slug)} w="100%" h="100%" radius={8} label={gameName(g, lang)} />
                <span className="gl-view">{viewers(g.id)}</span>
                <span className="gl-prov">{g.provider}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .gl { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; }
        .gl :global(*) { box-sizing: border-box; }

        /* ---- 移动端 375：顶栏 55，网格从 55 开始，3 列 112×155 ---- */
        .gl-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; }
        .gl-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .gl-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }
        .gl-body { padding: 0 12px; }
        .gl-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 7.5px; row-gap: 8px; }
        .gl-cell { width: 112px; height: 155px; border-radius: 8px; background: #23262b; }
        :global(.game_list_pg__gl-card) { position: relative; display: block; width: 100%; height: auto; aspect-ratio: 112 / 155; border-radius: 8px; overflow: hidden; cursor: pointer; }
        :global(.game_list_pg__gl-status) { margin-top: 40px; }
        .gl-view { position: absolute; top: 6px; left: 6px; z-index: 1; height: 18px; padding: 0 6px; border-radius: 999px; background: rgba(0, 0, 0, .55); color: #fff; font-size: 11px; line-height: 18px; }
        .gl-prov { position: absolute; left: 0; right: 0; bottom: 6px; text-align: center; color: #fff; font-size: 11px; opacity: .85; }

        /* ---- 网页端 ≥768：内容区居中，列数自适应 ---- */
        @media (min-width: 768px) {
          .gl { background: transparent; max-width: 968px; margin: 0 auto; }
          .gl-bar { height: auto; padding: 0 0 20px; }
          .gl-back { display: none; }
          .gl-title { font-size: 20px; }
          .gl-body { padding: 0; }
          .gl-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); column-gap: 16px; row-gap: 24px; }
          .gl-cell { width: 100%; height: auto; aspect-ratio: 112 / 155; }
          :global(.game_list_pg__gl-card) { width: 100%; height: auto; aspect-ratio: 112 / 155; }
        }
      `}</style>
    </div>
  )
}
