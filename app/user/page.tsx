'use client'
import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserHome from '@/components/member/UserHome'
import { useViewport } from '@/lib/useViewport'
import { navReplace } from '@/lib/navProgress'

// 个人中心（bare 外壳）：手机版用这套“头部卡 + VIP 卡 + 入口宫格 + 统计”；网页版是左侧导航的 Personal 页（/verify），直接进来则转过去。
export default function Page() { return <Suspense fallback={null}><Home /></Suspense> }

function Home() {
  const mode = useViewport()
  const router = useRouter()
  useEffect(() => { if (mode === 'd') navReplace(router, '/verify') }, [mode, router])
  return mode === 'd' ? null : <UserHome />
}
