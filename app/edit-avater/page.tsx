import { Suspense } from 'react'
import AvatarPicker from '@/components/member/AvatarPicker'

// 编辑头像（bare 外壳）
export default function Page() { return <Suspense fallback={null}><AvatarPicker /></Suspense> }
