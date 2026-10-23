'use client'
import type { CSSProperties, ReactNode } from 'react'

// 通用区块占位：带背景、圆角、虚线边和标题，尺寸对齐参考站。内容放 children。
// 用法：<SkBox label="热门游戏" h={135} radius={12} />
interface Props { label?: string, w?: number | string, h?: number | string, minH?: number | string, radius?: number | string, state?: string, className?: string, style?: CSSProperties, children?: ReactNode }
const css = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v)

export default function SkBox({ label, w, h, minH, radius = 12, state, className, style, children }: Props) {
  const st: CSSProperties = { width: css(w), height: css(h), minHeight: css(minH), borderRadius: css(radius), ...style }
  return (
    <div className={`sk-box ${className ?? ''}`} style={st}>
      {label ? <span className="lbl">{label}</span> : null}
      {state ? <span className="st">{state}</span> : null}
      {children}
      <style jsx>{`
        .sk-box { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 12px; box-sizing: border-box; max-width: 100%;
          background: #1d1f23; border: 1px dashed #3a3d44; color: #8d93a0; font-size: 13px; }
        .lbl { font-weight: 600; color: #c4c8d0; }
        .st { position: absolute; top: 8px; right: 10px; font-size: 10px; padding: 1px 6px; border-radius: 999px; background: #2a2d33; color: #f5b942; }
      `}</style>
    </div>
  )
}
