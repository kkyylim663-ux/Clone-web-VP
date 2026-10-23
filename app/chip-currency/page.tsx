import { Suspense } from 'react'
import ChipCurrencyForm from '@/components/member/ChipCurrencyForm'

// 筹码与货币（bare 外壳）
export default function Page() { return <Suspense fallback={null}><ChipCurrencyForm /></Suspense> }
