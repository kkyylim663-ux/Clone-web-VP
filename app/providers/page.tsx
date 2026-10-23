'use client'
// 供应商页（browse 组）：供应商 tile 点击 → 分组页（按供应商真筛选）。版式同 Vue 骨架（CSS 原样）。
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { avatarImg } from '@/lib/assets'
import { useGate } from '@/lib/useGate'
import SkImg from '@/components/ui/SkImg'
import SkStatus from '@/components/browse/SkStatus'
import { type ApiProvider, phaseOf, useHover, useRemote } from '@/components/browse/browseData'

export default function Page() {
  return <Suspense fallback={null}><ProvidersView /></Suspense>
}

function ProvidersView() {
  const st = useSearchParams().get('state') ?? ''
  const { t } = useLanguage()
  const { loggedIn, user } = useAuth()
  const { back, enterLogin, enterRegister, go } = useGate()
  const { cls, on } = useHover()
  const provs = useRemote<{ list: ApiProvider[] }>('/api/web/browse/providers', {})

  const member = st === 'member' || (st !== 'guest' && loggedIn)
  const list = provs.data?.list ?? []
  const phase = phaseOf(st, provs.loading, provs.error, !provs.loading && list.length === 0)

  return (
    <div className="pv">
      {/* 页内顶栏：移动端 55px；网页端由外壳提供，此处隐藏 */}
      <header className="pv-bar">
        <span className="pv-back" role="button" tabIndex={0} aria-label={t('browse.back')} onClick={back}>‹</span>
        <h1 className="pv-title">{t('browse.providers.title')}</h1>
        {!member ? (
          <div className="pv-auth">
            <span className="pv-btn pv-btn--ghost" role="button" tabIndex={0} onClick={() => enterLogin('header')}>{t('browse.fav.login')}</span>
            <span className="pv-btn pv-btn--main" role="button" tabIndex={0} onClick={() => enterRegister('header')}>{t('browse.register')}</span>
          </div>
        ) : (
          <SkImg src={avatarImg(user?.avatar ?? 1)} w={32} h={32} round label="" className="providers_pg__pv-avatar" />
        )}
      </header>

      <div className="pv-body">
        {phase === 'loading' ? (
          <div className="pv-grid">
            {Array.from({ length: 12 }, (_, i) => <div key={i} className="pv-skel mo-shimmer" />)}
          </div>
        ) : phase === 'empty' ? (
          <SkStatus kind="empty" title={t('browse.providers.emptyTitle')} hint={t('browse.providers.emptyHint')} h={240} className="providers_pg__pv-status" />
        ) : phase === 'error' ? (
          <SkStatus kind="error" title={t('browse.error')} h={240} retryLabel={t('browse.retry')} onRetry={() => provs.reload()} className="providers_pg__pv-status" />
        ) : (
          <>
            {/* 网页端：顶部 3 张大图位（1280 实测 312×124），无去向 */}
            <div className="pv-feat">
              {[1, 2, 3].map((n) => <SkImg key={n} src={`/assets/providers/feat-${n}.webp`} w="100%" h={124} radius={0} label="" />)}</div>
            <div className="pv-grid">
              {list.map(p => (
                <div key={p.slug} className={cls('p' + p.slug, 'pv-tile')} {...on('p' + p.slug)} role="button" tabIndex={0} onClick={() => go(`/group/provider/${p.slug}`)}>
                  {p.logo ? <img className="pv-logo" src={`/assets/providers/${p.logo}.png`} alt={p.name} draggable={false} /> : <SkImg w="100%" h="100%" radius={4} label={p.name} />}
                </div>
              ))}
            </div>
            <p className="pv-end">{t('browse.providers.end')}</p>
          </>
        )}
      </div>

      <style jsx>{`
        .pv { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .pv :global(*) { box-sizing: border-box; }

        /* ---- 移动端 375 ---- */
        .pv-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .pv-back { width: 24px; font-size: 26px; line-height: 1; color: #fff; cursor: pointer; }
        .pv-title { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }
        .pv-auth { display: flex; gap: 8px; }
        .pv-btn { display: block; width: 76px; height: 32px; line-height: 30px; border-radius: 8px; border: 1px solid var(--vp-primary);
          font-size: 13px; font-weight: 500; text-align: center; cursor: pointer; }
        .pv-btn--ghost { color: var(--vp-primary); background: transparent; }
        .pv-btn--main { color: var(--vp-on-primary); background: var(--vp-grad); }
        :global(.providers_pg__pv-avatar) { flex: none; }

        .pv-body { padding: 15px 8px 0; box-sizing: border-box; }
        .pv-feat { display: none; }
        .pv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 8.5px; }
        .pv-tile { aspect-ratio: 114 / 46; cursor: pointer; }
        .pv-tile { overflow: hidden; padding: 8px 12px; border-radius: 10px; background: linear-gradient(160deg, #2b2e36 0%, #22242a 100%); border: 1px solid #3a3e48; box-shadow: 0 2px 8px rgba(0, 0, 0, .35); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
        .pv-tile:hover { transform: translateY(-2px); border-color: var(--vp-primary); box-shadow: 0 6px 16px rgba(0, 0, 0, .5); }
        .pv-logo { display: block; width: 100%; height: 100%; object-fit: contain; }
        .pv-skel { width: 100%; height: auto; aspect-ratio: 114 / 46; padding: 0; border-radius: 4px; }
        .pv-end { display: flex; align-items: center; gap: 10px; margin: 20px 0 0; color: #8d8d92; font-size: 13px; }
        .pv-end::before, .pv-end::after { content: ''; flex: 1; height: 1px; background: #3a3d44; }
        :global(.providers_pg__pv-status) { margin-top: 40px; }

        /* ---- 网页端 1280（顶部大图位与 6 列网格来自实测） ---- */
        @media (min-width: 768px) {
          .pv { background: transparent; }
          .pv-bar { display: none; }
          .pv-auth, :global(.providers_pg__pv-avatar) { display: none; }
          .pv-body { padding: 46px 0 32px; }
          .pv-feat { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
          .pv-grid { grid-template-columns: repeat(6, 1fr); gap: 16px; }
          .pv-skel { aspect-ratio: 146 / 58; }
          :global(.providers_pg__pv-status) { margin-top: 0; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）

