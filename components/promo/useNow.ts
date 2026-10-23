'use client'
import { useEffect, useState } from 'react'

/** 客户端时钟，默认每秒刷新。服务端渲染与首次渲染返回 null，避免水合不一致 */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/** 剩余毫秒 → 两位数字串。parts=3：时/分/秒；parts=4：日/时/分/秒 */
export function splitRemain(ms: number, parts: 3 | 4): string[] {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return parts === 4 ? [pad(d), pad(h), pad(m), pad(sec)] : [pad(h + d * 24), pad(m), pad(sec)]
}
