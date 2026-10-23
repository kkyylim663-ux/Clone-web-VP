import { Suspense } from 'react'
import PasswordForm from '@/components/member/PasswordForm'

// 修改密码（bare 外壳）
export default function Page() { return <Suspense fallback={null}><PasswordForm /></Suspense> }
