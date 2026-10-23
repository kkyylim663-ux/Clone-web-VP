import { Suspense } from 'react'
import BlacklistList from '@/components/member/BlacklistList'

// 黑名单（bare 外壳）
export default function Page() { return <Suspense fallback={null}><BlacklistList /></Suspense> }
