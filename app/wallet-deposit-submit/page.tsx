import { Suspense } from 'react'
import DepositSubmit from '@/components/member/DepositSubmit'

// 存款提交页（三步卡片）
export default function Page() { return <Suspense fallback={null}><DepositSubmit /></Suspense> }
