'use client'
// 免费体育预测（对应 vp-web/app/pages/sports-betting/index.vue，参考站 /sports-betting，需登录）。
// 版式取自参考站手机截图（368 宽）：页内顶栏 → 横幅（规则 / 记录两个按钮叠在右上）→ 日期条（‹ 日期 › 今天）→ 空赛程。
// 未登录：GuestGate（来源 sport → /login?page=sport）。?state=guest|member|loading|error|data；无参数 = 空赛程
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useGate } from '@/lib/useGate'
import SkImg from '@/components/ui/SkImg'
import { EMPTY } from '@/lib/assets'
import GuestGate from '@/components/shared/GuestGate'
import RecordStates from '@/components/shared/RecordStates'

export default function Page() {
  return <Suspense fallback={null}><SportsBettingPage /></Suspense>
}

const DAY = 86400000
const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${String(d.getMonth() + 1).padStart(2, '0')} ${d.getFullYear()}`

function SportsBettingPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { loggedIn } = useAuth()
  const { back, go } = useGate()
  const member = st !== 'guest' && (st !== '' || loggedIn)
  const isEmpty = !['loading', 'error', 'data'].includes(st)
  // 日期条：‹ › 逐日切换，「今天」回到当天（日期只存前端，赛程数据接入后按日期取接口）
  const [day, setDay] = useState(0)
  const date = new Date(Date.now() + day * DAY)

  return (
    <div className="sb">
      <header className="sb-nav">
        <span className="sb-back" role="button" tabIndex={0} aria-label="back" onClick={back}>‹</span>
        <span className="sb-title">{t('sportsBetting.fsp.title')}</span>
      </header>
      <section className="sb-banner">
        <SkImg className="sports_betting_pg__sb-img" w="100%" h="100%" radius={0} label="" />
        <div className="sb-btns">
          <span className="sb-btn" role="button" tabIndex={0} onClick={() => go('/sports-betting/record')}><i />{t('sportsBetting.fsp.rules')}</span>
          <span className="sb-btn" role="button" tabIndex={0} onClick={() => go('/sports-betting/record')}><i />{t('sportsBetting.fsp.record')}</span>
        </div>
      </section>
      <div className="sb-body">
        {!member ? <GuestGate source="sport" /> : (
          <>
            <div className="sb-date">
              <span className="sb-arrow" role="button" tabIndex={0} aria-label="prev" onClick={() => setDay(day - 1)}>‹</span>
              <span className="sb-cur"><i />{fmt(date)}</span>
              <span className="sb-arrow" role="button" tabIndex={0} aria-label="next" onClick={() => setDay(day + 1)}>›</span>
              <span className="sb-today" role="button" tabIndex={0} onClick={() => setDay(0)}>{t('sportsBetting.fsp.today')}</span>
            </div>
            {isEmpty ? (
              <div className="sb-empty"><SkImg src={EMPTY[1]} w={102} h={102} radius={0} label="" /><p>{t('sportsBetting.fsp.empty')}</p></div>
            ) : <RecordStates state={st} />}
          </>
        )}
      </div>

      <style jsx global>{`
        .sb { min-height: 100vh; min-height: 100dvh; background: #1d222b; color: #fff; font-size: 14px; }
        .sb-nav { height: 55px; display: flex; align-items: center; gap: 14px; padding: 0 12px; box-sizing: border-box; background: #1a1c22; }
        .sb-back { width: 22px; font-size: 30px; line-height: 1; cursor: pointer; }
        .sb-title { font-size: 16px; font-weight: 500; }
        .sb-banner { position: relative; height: 118px; overflow: hidden; background: #0e3a66; }
        :global(.sports_betting_pg__sb-img) { position: absolute; inset: 0; opacity: .5; }
        .sb-btns { position: absolute; right: 10px; top: 10px; z-index: 2; display: flex; gap: 8px; }
        .sb-btn { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 6px; background: rgba(60, 80, 105, .75); font-size: 13px; font-weight: 700; cursor: pointer; }
        .sb-btn i { width: 14px; height: 14px; border-radius: 3px; background: #c9d6ea; }
        .sb-body { position: relative; margin-top: -2px; padding: 12px 12px 120px; border-radius: 16px 16px 0 0; background: #1d222b; }
        .sb-date { display: flex; gap: 6px; height: 36px; }
        .sb-date > span { display: flex; align-items: center; justify-content: center; height: 36px; border-radius: 4px; background: #2d3743; cursor: pointer; font-weight: 700; }
        .sb-arrow { width: 59px; font-size: 24px; }
        .sb-cur { flex: 1; gap: 8px; font-size: 14px; } .sb-cur i { width: 16px; height: 16px; border-radius: 3px; border: 2px solid #dfe5ee; box-sizing: border-box; }
        .sb-today { width: 59px; font-size: 13px; }
        .sb-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 110px; color: #8d93a0; font-size: 15px; font-weight: 600; opacity: .9; }
        .sb-empty p { margin: 0; }
        /* 网页 ≥768：参考站手机宽度居中（推断） */
        @media (min-width: 768px) { .sb { max-width: 420px; margin: 0 auto; border-radius: 16px; overflow: hidden; } }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
