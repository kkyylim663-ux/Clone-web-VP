import { Suspense } from 'react'
import NotificationsList from '@/components/member/NotificationsList'

// 通知（bare 外壳，需登录）
export default function Page() { return <Suspense fallback={null}><NotificationsList /></Suspense> }
