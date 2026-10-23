'use client'
// 横向滑动行：原生滚动 + scroll-snap；鼠标可按住拖动；左右箭头按「一屏」平滑滚动，到头自动置灰。
// AllPill / ArrowBtns 是全站统一的「全部 >」胶囊与 ‹ › 按钮。
import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent as RPE } from 'react'

export function useHScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const [st, setSt] = useState({ prev: false, next: true })
  const drag = useRef({ on: false, x: 0, left: 0, moved: false })

  const sync = useCallback(() => {
    const el = ref.current
    if (!el) return
    const prev = el.scrollLeft > 2
    const next = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
    setSt((s) => (s.prev === prev && s.next === next ? s : { prev, next }))
  }, [])

  // 内容、尺寸、图片加载都会改变可滚动范围：每次渲染后、子节点变化、尺寸变化、图片加载完都重算一次
  useEffect(() => { sync() })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null
    ro?.observe(el)
    const mo = new MutationObserver(() => { sync(); ro && Array.from(el.children).forEach((c) => ro.observe(c)) })
    mo.observe(el, { childList: true })
    Array.from(el.children).forEach((c) => ro?.observe(c))
    el.addEventListener('load', sync, true)
    el.addEventListener('scrollend', sync)
    window.addEventListener('resize', sync)
    return () => { ro?.disconnect(); mo.disconnect(); el.removeEventListener('load', sync, true); el.removeEventListener('scrollend', sync); window.removeEventListener('resize', sync) }
  }, [sync])

  const by = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
    // 平滑滚动过程中 scroll 事件可能被节流：结束后再补算几次
    ;[250, 600, 1000].forEach((ms) => setTimeout(sync, ms))
  }

  const bind = {
    onScroll: sync,
    onPointerDown: (e: RPE<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !ref.current) return
      drag.current = { on: true, x: e.clientX, left: ref.current.scrollLeft, moved: false }
    },
    onPointerMove: (e: RPE<HTMLDivElement>) => {
      const d = drag.current
      if (!d.on || !ref.current) return
      const dx = e.clientX - d.x
      if (!d.moved && Math.abs(dx) > 4) { d.moved = true; ref.current.setAttribute('data-drag', '1') }
      if (d.moved) ref.current.scrollLeft = d.left - dx
    },
    onPointerUp: () => {
      const el = ref.current
      drag.current.on = false
      if (el) setTimeout(() => el.removeAttribute('data-drag'), 0)
    },
    onPointerLeave: () => {
      const el = ref.current
      drag.current.on = false
      if (el) el.removeAttribute('data-drag')
    },
    // 拖动结束后吞掉那一次 click，避免误点开游戏
    onClickCapture: (e: React.MouseEvent) => {
      if (drag.current.moved) { e.stopPropagation(); e.preventDefault(); drag.current.moved = false }
    },
  }
  return { ref, ...st, prev: () => by(-1), next: () => by(1), bind, canPrev: st.prev, canNext: st.next }
}

type HS = ReturnType<typeof useHScroll>

export function HScroll({ hs, className = '', children }: { hs: HS, className?: string, children: ReactNode }) {
  return (
    <div ref={hs.ref} className={`hscroll ${className}`} {...hs.bind}>
      {children}
      <style jsx>{`
        .hscroll { display: flex; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x proximity; scrollbar-width: none; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; cursor: grab; touch-action: pan-x pan-y; }
        .hscroll::-webkit-scrollbar { display: none; }
        .hscroll[data-drag] { cursor: grabbing; scroll-snap-type: none; user-select: none; }
        .hscroll[data-drag] :global(*) { pointer-events: none; }
        .hscroll > :global(*) { scroll-snap-align: start; flex: none; }
      `}</style>
    </div>
  )
}

const Chev = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'r' ? 'm6 3.5 4.5 4.5L6 12.5' : 'M10 3.5 5.5 8l4.5 4.5'} />
  </svg>
)

export function AllPill({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button type="button" className="allpill" onClick={onClick}>
      <span>{label}</span><Chev dir="r" />
      <style jsx>{`
        .allpill { display: inline-flex; align-items: center; gap: 4px; height: 36px; padding: 0 12px 0 16px; border: 0; border-radius: 12px; background: rgba(255, 255, 255, .1); color: #fff; font: 600 14px/1 inherit; white-space: nowrap; cursor: pointer; transition: background .2s, transform .15s; }
        .allpill:hover { background: rgba(255, 255, 255, .18); }
        .allpill:active { transform: scale(.96); }
        @media (max-width: 767px) { .allpill { height: 30px; padding: 0 8px 0 12px; border-radius: 10px; font-size: 12px; } }
      `}</style>
    </button>
  )
}

export function ArrowBtns({ hs }: { hs: HS }) {
  return (
    <>
      <button type="button" className="ab" aria-label="prev" disabled={!hs.canPrev} onClick={hs.prev}><Chev dir="l" /></button>
      <button type="button" className="ab" aria-label="next" disabled={!hs.canNext} onClick={hs.next}><Chev dir="r" /></button>
      <style jsx>{`
        .ab { width: 36px; height: 36px; border: 0; border-radius: 12px; background: rgba(255, 255, 255, .1); color: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s, opacity .2s, transform .15s; }
        .ab:hover:not(:disabled) { background: rgba(255, 255, 255, .18); }
        .ab:active:not(:disabled) { transform: scale(.92); }
        .ab:disabled { opacity: .35; cursor: default; }
      `}</style>
    </>
  )
}
