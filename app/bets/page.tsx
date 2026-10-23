import { Suspense } from 'react'
import BetsList from '@/components/member/BetsList'

// 投注记录（bare 外壳）：Casino / Sports 标签 + 日期范围
export default function Page() { return <Suspense fallback={null}><BetsList /></Suspense> }
