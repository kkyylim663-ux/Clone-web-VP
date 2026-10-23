'use client'
import { useEffect, useState } from 'react'

// 模拟 Vue <Transition name="mo-modal">（类名见 app/motion.css 的 .mo-modal-enter-*）。
// 打开：先挂 enter-from（缩放 .92、透明），下一帧去掉 → 150ms 渐显；
// 关闭：保持挂载 150ms 后卸载，期间淡出。
export function useModalMotion(open: boolean) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setShown(true)) })
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), 150)
    return () => clearTimeout(t)
  }, [open])
  return { mounted, shown }
}
