'use client'
// 空投奖池金额（滚动数字）：以接口金额为起点，每 1.8–3.2s 随机 +0.01~+2.99（慢、涨幅小），格式 11,448.96。
// 直接改文字节点、不走 React 状态：每次跳动不触发任何重渲染（之前用 setState 会连带整页重渲染并报 Maximum update depth）。
// 当前值存在模块里：首页、赌场页之间切换时数字接着涨，不回到起点。
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
let live = 0

export default function JackpotAmount({ base }: { base?: string }) {
  const { t } = useLanguage()
  const el = useRef<HTMLSpanElement>(null)
  const tRef = useRef(t)
  tRef.current = t
  const start = Number((base ?? '').replace(/,/g, ''))

  useEffect(() => {
    if (!Number.isFinite(start) || start <= 0) return
    let cur = Math.max(live, start)
    const write = () => { if (el.current) el.current.textContent = tRef.current('browse.home.airdropAmt', { amt: fmt(cur) }) }
    write()
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      cur += Math.round((0.01 + Math.random() * 2.98) * 100) / 100
      live = cur
      write()
      timer = setTimeout(tick, 1800 + Math.random() * 1400)
    }
    timer = setTimeout(tick, 1800)
    return () => clearTimeout(timer)
  }, [start])

  return <span ref={el} suppressHydrationWarning>{t('browse.home.airdropAmt', { amt: '0.00' })}</span>
}
