'use client'
// 体育（对应 vp-web/app/pages/sports.vue）。容器逻辑见 components/promo/SportsContainer.tsx。
import { Suspense } from 'react'
import SportsContainer from '@/components/promo/SportsContainer'

export default function Page() {
  return <Suspense fallback={null}><SportsContainer /></Suspense>
}
