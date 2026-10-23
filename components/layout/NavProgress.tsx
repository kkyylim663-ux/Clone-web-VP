'use client'
// 顶部切页进度条：点击站内链接 / 调用 startNav() 后 150ms 才显示（快页面不闪），缓动到 80%；
// 路径或查询变化时补满并淡出；无超时上限。
import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { onNavStart, startNav } from '@/lib/navProgress'

export default function NavProgress() {
  const pathname = usePathname()
  const sp = useSearchParams().toString()
  const [w, setW] = useState(0)
  const [show, setShow] = useState(false)
  const timers = useRef<number[]>([])
  const active = useRef(false)

  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = [] }
  const finish = () => {
    clear()
    if (!active.current) return
    active.current = false
    setW(100)
    timers.current.push(window.setTimeout(() => { setShow(false); setW(0) }, 250))
  }

  useEffect(() => onNavStart(() => {
    clear()
    active.current = true
    setW(0)
    timers.current.push(window.setTimeout(() => { setShow(true); setW(30) }, 150))
    timers.current.push(window.setTimeout(() => setW(60), 600))
    timers.current.push(window.setTimeout(() => setW(80), 1800))
    // 不设超时：加载多久都继续等，页面一到才收尾
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  // 站内 <a> 点击 → 开始（外链、新标签页、带修饰键、当前网址不触发）
  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.href || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
      const u = new URL(a.href, location.href)
      if (u.origin !== location.origin || u.pathname + u.search === location.pathname + location.search) return
      startNav()
    }
    document.addEventListener('click', click, true)
    return () => document.removeEventListener('click', click, true)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { finish() }, [pathname, sp])
  useEffect(() => clear, [])

  return (
    <div className="npg" aria-hidden="true" style={{ opacity: show ? 1 : 0 }}>
      <i style={{ width: `${w}%`, transition: w === 100 ? 'width .2s ease-out' : w === 0 ? 'none' : 'width 1.2s ease-out' }} />
      <style jsx>{`
        .npg { position: fixed; left: 0; right: 0; top: 0; height: 3px; z-index: 9999; pointer-events: none; transition: opacity .25s; }
        .npg i { display: block; height: 100%; background: var(--vp-primary, #05f26a); box-shadow: 0 0 8px var(--vp-primary, #05f26a); }
      `}</style>
    </div>
  )
}
