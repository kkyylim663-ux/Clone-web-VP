import { Suspense } from 'react'
import WalletPage from '@/components/member/WalletPage'

// 提款（整页版钱包）
export default function Page() { return <Suspense fallback={null}><WalletPage view="withdraw" /></Suspense> }
