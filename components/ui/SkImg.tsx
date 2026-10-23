'use client'
import type { CSSProperties } from 'react'

// 图片占位块：不放任何真实图片。用斜纹底 + 尺寸标注，位置与大小对齐参考站。
// 用法：<SkImg w={175} h={135} /> 固定尺寸；<SkImg ratio="16/9" /> 宽度撑满、按宽高比；round 表示圆形
interface Props { src?: string, w?: number | string, h?: number | string, ratio?: string, radius?: number | string, round?: boolean, label?: string, className?: string, style?: CSSProperties }
const css = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v)

export default function SkImg({ src, w, h, ratio, radius = 8, round, label, className, style }: Props) {
  const text = label ?? (typeof w === 'number' && typeof h === 'number' ? `${w}×${h}` : ratio ?? '')
  const st: CSSProperties = { width: css(w) ?? '100%', height: h !== undefined ? css(h) : undefined, aspectRatio: h === undefined ? ratio : undefined, borderRadius: round ? '50%' : css(radius), ...(src ? { background: 'none' } : null), ...style }
  return (
    <div className={`sk-img ${className ?? ''}`} style={st}>
      {src ? (/\.(mp4|webm)$/i.test(src) ? <video src={src} autoPlay muted loop playsInline /> : <img src={src} alt="" loading="lazy" />) : text ? <span>{text}</span> : null}
      <style jsx>{`
        .sk-img img, .sk-img video { display: block; width: 100%; height: 100%; object-fit: cover; }
        .sk-img { display: flex; align-items: center; justify-content: center; flex: none; max-width: 100%; overflow: hidden;
          background: repeating-linear-gradient(135deg, #23262b 0 10px, #1d2024 10px 20px); color: #6b7078; font-size: 11px; font-family: monospace; }
      `}</style>
    </div>
  )
}
