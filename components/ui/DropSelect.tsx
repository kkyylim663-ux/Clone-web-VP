'use client'
// 自绘下拉（替代原生 <select>）：深色实心菜单、当前项打勾、点外部 / Esc 关闭、上下键 + 回车可选。
import { useEffect, useRef, useState } from 'react'

interface Props { value: string, options: string[], onChange: (v: string) => void, ariaLabel?: string, align?: 'left' | 'right', className?: string }

export default function DropSelect({ value, options, onChange, ariaLabel, align = 'left', className }: Props) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open])

  const pick = (v: string) => { onChange(v); setOpen(false) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) { setHi(Math.max(0, options.indexOf(value))); setOpen(true) } else setHi((i) => Math.min(options.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter' && open) { e.preventDefault(); pick(options[hi]) }
  }

  return (
    <div className={`ds ${className ?? ''}`} ref={box} onKeyDown={onKey}>
      <button type="button" className="ds-btn" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}
        onClick={() => { setHi(Math.max(0, options.indexOf(value))); setOpen((o) => !o) }}>
        <span className="ds-v">{value}</span>
        <svg className={`ds-ch${open ? ' up' : ''}`} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul className={`ds-menu ${align}`} role="listbox" aria-label={ariaLabel}>
          {options.map((o, i) => (
            <li key={o} role="option" aria-selected={o === value} className={`${o === value ? 'on' : ''}${i === hi ? ' hi' : ''}`}
              onMouseEnter={() => setHi(i)} onClick={() => pick(o)}>
              <span>{o}</span>
              {o === value ? <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .ds { position: relative; flex: 1; min-width: 0; }
        .ds-btn { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; text-align: left; }
        .ds.right .ds-btn, .ds-btn { font-family: inherit; }
        .ds-ch { flex: none; color: #aeb4bf; transition: transform .2s ease; }
        .ds-ch.up { transform: rotate(180deg); }
        .ds-menu { position: absolute; top: calc(100% + 10px); z-index: 30; min-width: 150px; margin: 0; padding: 6px; list-style: none; border-radius: 12px; background: #24252c; border: 1px solid rgba(255, 255, 255, .1); box-shadow: 0 12px 30px rgba(0, 0, 0, .55), inset 0 1px 0 rgba(255, 255, 255, .08); animation: dsIn .16s ease-out; }
        .ds-menu.left { left: -44px; }
        .ds-menu.right { right: -8px; }
        .ds-menu li { display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 40px; padding: 0 12px; border-radius: 8px; color: #d4d8e0; font-size: 15px; font-weight: 600; cursor: pointer; }
        .ds-menu li.hi { background: rgba(255, 255, 255, .08); }
        .ds-menu li.on { color: var(--vp-primary); }
        @keyframes dsIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  )
}
