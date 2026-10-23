import { Suspense } from 'react'
import KycForm from '@/components/member/KycForm'

// 实名认证（bare 外壳）：Level 1 表单 + Level 2 锁定上传
export default function Page() { return <Suspense fallback={null}><KycForm /></Suspense> }
