'use client'
// 我的奖池奖金（对应 vp-web/app/pages/jackpot/mybouns.vue，参考站真实路径 /jackpot-mybouns）。
// 列表取自 post('/api/web/promo/jackpotMine')；默认无数据（参考站实测）。?state=: loading | data（演示行）
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { useAuth } from '@/context/AuthContext'
import { usePromoData } from '@/components/promo/usePromoData'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/shared/SkStatus'

export default function Page() {
  return <Suspense fallback={null}><JackpotMybounsPage /></Suspense>
}

interface MineRow { id: number | string, title: string, sub: string, amount: string, state: string }

function JackpotMybounsPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { back } = useGate()
  const { balance } = useAuth()
  const { data, error, reload } = usePromoData<{ list: MineRow[] }>('/api/web/promo/jackpotMine')
  const list = data?.list ?? []
  const rows: MineRow[] = st === 'data' && list.length === 0 ? [0, 1, 2].map((n) => ({ id: n, title: '—', sub: '—', amount: '0.00', state: '—' })) : list
  const loading = st === 'loading' || (data === null && !error)

  return (
    <div className="jm">
      <header className="jm-bar">
        <span className="jm-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="jm-title">{t('jackpot.mineTitle')}</h1>
        <span className="jm-wallet"><i className="jm-wi" /><b>{balance?.available ?? '0.00'}</b><i className="jm-wp">+</i></span>
      </header>

      {loading ? <SkBox className="jackpot_mybouns_pg__jm-skel" state={t('status.loading')} h={300} /> : null}
      {!loading && error ? <SkStatus kind="error" h={300} className="jackpot_mybouns_pg__jm-status" onRetry={reload} /> : null}

      {!loading && !error && rows.length > 0 ? (
        <div className="jm-list">
          {rows.map((r) => (
            <div key={r.id} className="jm-card">
              <SkImg src={`/assets/bonus/ico-${(Number(r.id) || 0) % 5 + 1}.webp`} w={56} h={56} radius={8} />
              <div className="jm-txt"><b>{r.title}</b><small>{r.sub}</small></div>
              <span className="jm-state">{r.state}</span>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && rows.length === 0 ? (
        <div className="jm-empty">
          <SkImg src="/assets/empty/empty-1.webp" w={102} h={102} radius={0} label={t('jackpot.illustration')} />
          <p className="jm-msg">{t('jackpot.mineEmpty')}</p>
        </div>
      ) : null}

      <style jsx global>{`
        .jm { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; padding-bottom: 80px; box-sizing: border-box; }
        .jm-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .jm-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .jm-title { flex: 1; margin: 0; font-size: 16px; font-weight: 500; }
        /* 参考站实测：钱包胶囊 139×31，右距 12，半透明白底，圆角 19 */
        .jm-wallet { flex: none; display: flex; align-items: center; gap: 8px; width: 139px; height: 31px; padding: 0 8px; box-sizing: border-box; border-radius: 19px; background: rgba(255, 255, 255, .1); }
        .jm-wallet b { flex: 1; text-align: center; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
        .jm-wi { width: 16px; height: 16px; border-radius: 50%; background: var(--vp-primary); }
        .jm-wp { width: 20px; height: 20px; border-radius: 50%; background: rgba(255, 255, 255, .12); text-align: center; line-height: 20px; font-style: normal; font-size: 14px; }

        /* ---- 移动端 375 ---- */
        :global(.jackpot_mybouns_pg__jm-skel), :global(.jackpot_mybouns_pg__jm-status) { margin: 24px 12px 0; }
        :global(.jackpot_mybouns_pg__jm-skel).sk-box { width: calc(100% - 24px); }
        .jm-list { display: flex; flex-direction: column; gap: 8px; padding: 24px 12px 0; box-sizing: border-box; }
        .jm-card { display: flex; align-items: center; gap: 10px; height: 76px; padding: 0 12px; box-sizing: border-box; border-radius: 10px; background: #202229; }
        .jm-card b { font-size: 14px; font-weight: 600; }
        .jm-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .jm-txt small { font-size: 12px; color: #8d8d92; }
        .jm-state { font-size: 12px; color: var(--vp-primary); }
        .jm-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-top: 160px; }
        .jm-msg { margin: 0; color: rgba(255, 255, 255, .85); font-size: 17px; font-weight: 500; }

        /* ---- 网页端 ≥768：参考站 1280 访问后回到首页，骨架保留手机宽度居中（推断） ---- */
        @media (min-width: 768px) {
          .jm { max-width: 375px; margin: 0 auto; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
