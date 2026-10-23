'use client'
// 体育投注记录（需登录，对应 vp-web/app/pages/sports-betting/record.vue）。
// 参考站实测（375）：导航 55；页面仅见空态插图 102×102 位于 y266（日期筛选条为推断，占 y55 高 52）。
// 记录取自 post('/api/web/promo/betRecords')；无记录显示空态。?state=guest|member|loading|error|data
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import { usePromoData } from '@/components/promo/usePromoData'
import { fmtStr } from '@/components/promo/util'
import SkImg from '@/components/ui/SkImg'
import { EMPTY } from '@/lib/assets'
import GuestGate from '@/components/shared/GuestGate'
import RecordStates, { type RecordItem } from '@/components/shared/RecordStates'

export default function Page() {
  return <Suspense fallback={null}><SportsBettingRecordPage /></Suspense>
}

interface BetRecord { id: number | string, title: string, amount: string, status: string }

function SportsBettingRecordPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { loggedIn } = useAuth()
  const { back } = useGate()
  const { data, error, reload } = usePromoData<{ list: BetRecord[] }>('/api/web/promo/betRecords')
  const member = st !== 'guest' && (st !== '' || loggedIn)
  const list = data?.list ?? []
  const items: RecordItem[] = list.map((r) => ({ id: r.id, title: r.title, sub: fmtStr(r.amount), status: r.status }))
  // 演示参数优先；否则有记录显示数据，无记录显示空态；加载失败显示错误态
  const kind = st || (error ? 'error' : data === null ? 'loading' : list.length ? 'data' : '')
  const isEmpty = !['loading', 'error', 'data'].includes(kind)

  return (
    <div className="sr">
      <header className="sr-nav"><span className="sr-back" onClick={back}>‹</span><span className="sr-title">{t('sportsRecord.title')}</span></header>
      <div className="sr-main">
        <div className="sr-filter"><span>—</span><span>—</span></div>
        {!member ? <GuestGate source="sport" /> : null}
        {member && isEmpty ? <div className="sr-empty"><SkImg src={EMPTY[1]} w={102} h={102} radius={8} /></div> : null}
        {member && !isEmpty ? <RecordStates state={kind} items={kind === 'data' ? items : undefined} onRetry={reload} /> : null}
      </div>

      <style jsx global>{`
        .sr { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .sr-nav { height: 55px; display: flex; align-items: center; gap: 12px; padding: 0 12px; box-sizing: border-box; }
        .sr-back { width: 20px; font-size: 26px; line-height: 1; cursor: pointer; }
        .sr-title { font-size: 16px; font-weight: 600; }
        .sr-main { padding: 0 8px 24px; box-sizing: border-box; }
        .sr-filter { display: flex; gap: 8px; height: 52px; padding-top: 0; box-sizing: border-box; }
        .sr-filter span { flex: 1; display: flex; align-items: center; height: 32px; padding: 0 12px; box-sizing: border-box; border-radius: 8px; background: #26262d; color: #8d8d92; }
        .sr-empty { display: flex; justify-content: center; margin-top: 159px; }
        @media (max-width: 767px) {
          .sr { position: fixed; inset: 0; z-index: 50; overflow-y: auto; }
        }

        /* 网页 1280：导航由外壳提供；内容区 968 宽 */
        @media (min-width: 768px) {
          .sr { background: transparent; }
          .sr-nav { display: none; }
          .sr-main { padding: 20px 0 32px; }
          .sr-filter { height: 41px; }
          .sr-filter span { height: 41px; }
          .sr-empty { margin-top: 159px; }
        }
      `}</style>
    </div>
  )
}
