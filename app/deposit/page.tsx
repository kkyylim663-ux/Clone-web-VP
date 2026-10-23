import { Suspense } from 'react'
import WalletPage from '@/components/member/WalletPage'

// 存款（整页版钱包；真实入口为右侧面板，URL 不变）
export default function Page() { return <Suspense fallback={null}><WalletPage view="deposit" /></Suspense> }
