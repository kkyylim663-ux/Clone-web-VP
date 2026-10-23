'use client'
import { useEffect, useState } from 'react'

// 当前视口用哪一套版式：'d'（≥768 网页）/ 'm'（手机）/ null（服务端与首次渲染：两套都渲染，由 CSS 隐藏其一）。
// 挂载后只留一套 DOM：被 CSS 隐藏的那一套也要付渲染成本，手机上切页因此变慢。
// 水合完成后（站内切页）直接同步取值，一次渲染就是最终版式；首屏水合时先返回 null 以免与服务端不一致。
let ready = false
const now = (): 'd' | 'm' => (window.matchMedia('(min-width: 768px)').matches ? 'd' : 'm')

export function useViewport(): 'd' | 'm' | null {
  const [v, setV] = useState<'d' | 'm' | null>(() => (ready ? now() : null))
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setV(mq.matches ? 'd' : 'm')
    sync(); ready = true; mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return v
}
