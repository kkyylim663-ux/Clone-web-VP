'use client'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AuthEntry from '@/components/auth/AuthEntry'

// 登录 / 注册共用外壳：放在路由组布局里，两个页面之间切换时外壳（弹窗、背景）不卸载，
// 只有标签与表单内容过渡，不再像换页面那样重新弹出。页面本身不渲染内容（由这里按路径决定模式）。
export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const mode = pathname.startsWith('/register') ? 'register' : 'login'
  return (
    <>
      <AuthEntry mode={mode} />
      {children}
    </>
  )
}
