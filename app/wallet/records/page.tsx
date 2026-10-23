import { Suspense } from 'react'
import WalletPage from '@/components/member/WalletPage'

// 钱包记录（整页版钱包）
export default function Page() { return <Suspense fallback={null}><WalletPage view="records" /></Suspense> }
