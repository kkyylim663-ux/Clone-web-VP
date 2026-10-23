'use client'
// 全站游戏卡悬停弹层（桌面）：任意带 data-gslug 的元素被鼠标悬停 → 在其位置放大显示 封面 / 游戏名 / 供应商 / RTP / Demo·Play。
// 事件委托 + position:fixed，不会被横向滑动行裁切。
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { post } from '@/lib/api'
import { coverH } from '@/lib/assets'
import { FAV_KEY, gameName, usePlay, useLocalList } from '@/components/browse/browseData'
import type { ApiGame } from '@/lib/types'

let cache: Map<string, ApiGame> | null = null
let loading: Promise<void> | null = null
const load = () => loading ?? (loading = post<{ list: ApiGame[] }>('/api/web/site/games', {}).then((d) => { cache = new Map(d.list.map((g) => [g.slug, g])) }).catch(() => { loading = null }))
const rtp = (s: string) => 94 + (Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0) % 50) / 10

interface Pos { slug: string, left: number, top: number, w: number, h: number }
const W = 276

export default function GameHoverPop() {
  const { lang, t } = useLanguage()
  const play = usePlay()
  const fav = useLocalList(FAV_KEY)
  const [pos, setPos] = useState<Pos | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inPop = useRef(false)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (min-width: 768px)').matches) return
    load()
    const clear = () => { if (timer.current) clearTimeout(timer.current) }
    const hide = () => { clear(); timer.current = setTimeout(() => { if (!inPop.current) setPos(null) }, 120) }
    const over = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-gslug]') as HTMLElement | null
      if (!el) return
      const slug = el.dataset.gslug!
      clear()
      timer.current = setTimeout(() => {
        const r = el.getBoundingClientRect()
        const left = Math.min(Math.max(8, r.left + r.width / 2 - W / 2), window.innerWidth - W - 8)
        setPos({ slug, left, top: Math.max(8, r.top - 22), w: r.width, h: r.height })
      }, 180)
    }
    const out = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-gslug]')
      if (el) hide()
    }
    const scroll = () => { clear(); setPos(null) }
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)
    window.addEventListener('scroll', scroll, true)
    return () => { document.removeEventListener('mouseover', over); document.removeEventListener('mouseout', out); window.removeEventListener('scroll', scroll, true); clear() }
  }, [])

  const g = pos ? cache?.get(pos.slug) : undefined
  if (!pos || !g) return null
  const faved = fav.list.includes(g.slug)
  return (
    <div className="ghp" style={{ left: pos.left, top: pos.top }} onMouseEnter={() => { inPop.current = true }} onMouseLeave={() => { inPop.current = false; setPos(null) }}>
      <div className="img" style={{ backgroundImage: `url(${coverH(g.slug)})` }}>
        <button type="button" className={`star${faved ? ' on' : ''}`} aria-label="favourite" onClick={() => fav.toggle(g.slug)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
        </button>
      </div>
      <div className="info">
        <div className="nm">{gameName(g, lang)}</div>
        <div className="tags"><span>{g.provider}</span><span>RTP:{rtp(g.slug).toFixed(0)}%</span></div>
        <div className="acts">
          <button type="button" className="demo" onClick={() => play(g.slug)}>{t('browse.demo')}</button>
          <button type="button" className="go" onClick={() => play(g.slug)}>{t('browse.play')}</button>
        </div>
      </div>
      <style jsx>{`
        .ghp { position: fixed; z-index: 90; width: ${W}px; border-radius: 16px; background: #25262b; box-shadow: 0 0 0 2px rgba(255, 255, 255, .85), 0 18px 40px rgba(0, 0, 0, .6); overflow: hidden; animation: ghp-in .22s cubic-bezier(.2, .8, .2, 1); transform-origin: 50% 20%; }
        @keyframes ghp-in { from { opacity: 0; transform: scale(.88); } to { opacity: 1; transform: scale(1); } }
        .img { position: relative; height: 154px; background-size: cover; background-position: center; }
        .star { position: absolute; right: 10px; top: 10px; width: 30px; height: 30px; border: 0; border-radius: 50%; background: rgba(0, 0, 0, .45); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .star.on { color: #ffc531; }
        .info { padding: 14px 16px 16px; }
        .nm { font-size: 15px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tags { display: flex; gap: 8px; margin-top: 10px; }
        .tags span { height: 24px; padding: 0 8px; border-radius: 6px; background: rgba(255, 255, 255, .08); color: #aeb2bb; font-size: 12px; display: inline-flex; align-items: center; }
        .acts { display: flex; gap: 12px; margin-top: 16px; }
        .acts button { flex: 1; height: 36px; border: 0; border-radius: 18px; font: 600 14px/1 inherit; cursor: pointer; transition: transform .15s, filter .2s; }
        .acts button:hover { filter: brightness(1.12); }
        .acts button:active { transform: scale(.96); }
        .demo { background: #14151a; color: var(--vp-primary, #05f26a); }
        .go { background: var(--vp-primary, #05f26a); color: #04120a; }
      `}</style>
    </div>
  )
}
