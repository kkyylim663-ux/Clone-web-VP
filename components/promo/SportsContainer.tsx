'use client'
import { useSearchParams } from 'next/navigation'
import { usePromoData } from '@/components/promo/usePromoData'
import SkSportsFrame from '@/components/promo/SkSportsFrame'

// 体育容器（sports / sports-page 共用）。?state=: 空 = 启动会话（post sportsSession）| loading | ok | error
// 会话失败时显示「重试」，重试即重新请求（对应参考站会话启动失败态）。
export default function SportsContainer() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { data, error, reload } = usePromoData<{ ready: boolean }>('/api/web/promo/sportsSession')
  const state: 'loading' | 'ok' | 'error' = st === 'loading' ? 'loading'
    : st === 'ok' ? 'ok'
      : st === 'error' ? 'error'
        : error ? 'error'
          : data ? 'ok' : 'loading'
  return <SkSportsFrame state={state} onRetry={reload} />
}
