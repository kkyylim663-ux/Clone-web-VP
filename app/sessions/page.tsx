import { Suspense } from 'react'
import SessionsList from '@/components/member/SessionsList'

// 登录设备（bare 外壳）
export default function Page() { return <Suspense fallback={null}><SessionsList /></Suspense> }
