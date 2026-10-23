'use client'
// 体育（分页版，对应 vp-web/app/pages/sports-page.vue）：与 /sports 结构相同，?state 含义同 /sports。
import { Suspense } from 'react'
import SportsContainer from '@/components/promo/SportsContainer'

export default function Page() {
  return <Suspense fallback={null}><SportsContainer /></Suspense>
}
