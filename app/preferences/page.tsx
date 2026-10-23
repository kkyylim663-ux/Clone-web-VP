import { Suspense } from 'react'
import PreferencesForm from '@/components/member/PreferencesForm'

// 偏好设置（bare 外壳）：三组各自 Save（localStorage vp_prefs）
export default function Page() { return <Suspense fallback={null}><PreferencesForm /></Suspense> }
