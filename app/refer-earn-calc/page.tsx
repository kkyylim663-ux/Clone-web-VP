'use client'
// 佣金计算器（对应 vp-web/app/pages/refer-earn-calc.vue，真公式）。
// 配置取自 post('/api/web/promo/calcConfig')；计算在前端完成（components/promo/referralCalc.ts，整数分），不请求后端。
// 公式与实测见 docs/logic-map.md §3：奖金 = 存款 × 5% + 投注 × 1% + 里程碑（已达档位的累计值）。
// ?state=: 空 = 初始 | result 已计算（用示例值） | error 输入错误（演示）
import { Suspense, useEffect, useState, type ChangeEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import { usePromoData } from '@/components/promo/usePromoData'
import { calcReferral, type CalcConfig, type CalcInput, type CalcResult } from '@/components/promo/referralCalc'
import { cx, fmtCents } from '@/components/promo/util'

export default function Page() {
  return <Suspense fallback={null}><ReferCalcPage /></Suspense>
}

const DEFAULT_FORM: CalcInput = { level: '9', category: 'Slot', deposit: '1000', bet: '10000' }
const CURRENCIES = ['MYR']

function ReferCalcPage() {
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''
  const { t } = useLanguage()
  const { back } = useGate()
  const { data: cfg } = usePromoData<CalcConfig & { categories: string[], levels: number[] }>('/api/web/promo/calcConfig')
  const [form, setForm] = useState<CalcInput>({ ...DEFAULT_FORM, deposit: '', bet: '' })
  const [currency, setCurrency] = useState('MYR')
  const [result, setResult] = useState<CalcResult | null>(null)
  const [invalid, setInvalid] = useState(false)
  const showErr = invalid || st === 'error'
  const levels = Array.from({ length: 9 }, (_, i) => String(i + 1))
  const categories = cfg?.categories ?? ['Slot', 'Live Casino', 'Sport']

  const compute = (input: CalcInput = form) => {
    if (!cfg) return
    const r = calcReferral(input, cfg)
    setInvalid(!r)
    setResult(r)
  }

  // 演示参数 ?state=result：用示例值直接算出结果（配置到达后执行一次）
  useEffect(() => {
    if (st === 'result' && cfg && !result) {
      setForm(DEFAULT_FORM)
      compute(DEFAULT_FORM)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, cfg])

  const set = (k: keyof CalcInput) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="rc">
      <header className="rc-bar">
        <span className="rc-back" aria-hidden="true" onClick={back}>‹</span>
        <h1 className="rc-page">{t('calc.title')}</h1>
      </header>

      <section className={cx('rc-card', showErr && 'rc-card--err')}>
        <h2 className="rc-title">{t('calc.cardTitle')}</h2>

        {/* 字段 1：代理等级（下拉） */}
        <div className="rc-row">
          <span>{t('calc.level')}</span>
          <select className="rc-sel" value={form.level} onChange={set('level')} aria-label={t('calc.level')}>
            {levels.map((n) => <option key={n} value={n}>{t('calc.levelOpt', { n })}</option>)}
          </select>
        </div>
        {/* 字段 2：货币（下拉） */}
        <div className="rc-row rc-row--gap">
          <span>{t('calc.currency')}</span>
          <select className="rc-sel" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label={t('calc.currency')}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* 字段 3：存款金额（输入） */}
        <div className={cx('rc-input rc-input--gap', showErr && 'rc-input--err')}>
          <span className="rc-unit">{currency}</span>
          <input className="rc-field" inputMode="decimal" value={form.deposit} onChange={set('deposit')} placeholder={t('calc.depositPh')} aria-label={t('calc.deposit')} />
        </div>
        {showErr ? <p className="rc-err">{t('calc.invalid')}</p> : null}
        {/* 字段 4：游戏类别（下拉） */}
        <div className="rc-row rc-row--gap2">
          <span>{t('calc.category')}</span>
          <select className="rc-sel" value={form.category} onChange={set('category')} aria-label={t('calc.category')}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* 字段 5：投注金额（输入） */}
        <div className="rc-input rc-input--gap">
          <span className="rc-unit">{currency}</span>
          <input className="rc-field" inputMode="decimal" value={form.bet} onChange={set('bet')} placeholder={t('calc.betPh')} aria-label={t('calc.bet')} />
        </div>

        {/* 结果区（仅已计算） */}
        {result ? (
          <div className="rc-result">
            <div className="rc-res-row"><span>{t('calc.resDeposit')}</span><b>{fmtCents(result.deposit)}</b></div>
            <div className="rc-res-row"><span>{t('calc.resBet')}</span><b>{fmtCents(result.bet)}</b></div>
            <div className="rc-res-row"><span>{t('calc.resMilestone')}</span><b>{fmtCents(result.milestone)}</b></div>
            <div className="rc-res-total"><span>{t('calc.resTotal')}</span><b>{fmtCents(result.total)}</b></div>
          </div>
        ) : null}
      </section>

      {/* 底部按钮（移动端固定在底部，网页端在输入下方） */}
      <div className="rc-foot">
        <button type="button" className="rc-btn" disabled={!cfg} onClick={() => compute()}>{t('calc.start')}</button>
      </div>

      <style jsx global>{`
        .rc { position: relative; min-height: 812px; background: #1a1a21; color: #fff; font-size: 14px; box-sizing: border-box; }

        /* ---- 移动端 375 ---- */
        .rc-bar { display: flex; align-items: center; gap: 12px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .rc-back { width: 24px; font-size: 26px; line-height: 1; cursor: pointer; }
        .rc-page { flex: 1; margin: 0; font-size: 17px; font-weight: 600; }

        .rc-card { margin: 16px 12px 0; padding: 16px 12px; box-sizing: border-box; border-radius: 8px; background: #202229; }
        .rc-title { margin: 0; height: 22px; font-size: 16px; font-weight: 600; line-height: 22px; }
        .rc-row { display: flex; align-items: center; justify-content: space-between; height: 40px; padding: 0 12px; box-sizing: border-box; border-radius: 8px; background: #2a2d33; color: #c4c8d0; }
        .rc-row--gap { margin-top: 38px; }
        .rc-row--gap2 { margin-top: 37px; }
        .rc-sel { background: transparent; border: 0; outline: none; color: #fff; font-family: inherit; font-size: 14px; font-weight: 500; text-align: right; cursor: pointer; }
        .rc-sel option { background: #2a2d33; color: #fff; }
        .rc-input { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; box-sizing: border-box; border-radius: 8px; border: 1px solid #3a3d44; background: #1d1f23; }
        .rc-input--gap { margin-top: 38px; }
        .rc-input--err { border-color: #f87171; }
        .rc-field { flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; color: #fff; font-family: inherit; font-size: 14px; }
        .rc-field::placeholder { color: #5b6069; }
        .rc-unit { color: #8d8d92; font-size: 13px; }
        .rc-err { margin: 4px 0 0; font-size: 12px; color: #f87171; }
        .rc-card--err { border: 1px solid #f87171; }

        .rc-result { margin-top: 16px; padding: 12px; box-sizing: border-box; border-radius: 8px; background: #2a2d33; }
        .rc-res-row, .rc-res-total { display: flex; justify-content: space-between; height: 28px; align-items: center; color: #c4c8d0; font-size: 13px; }
        .rc-res-total { border-top: 1px dashed #3a3d44; margin-top: 4px; color: #fff; font-weight: 600; }

        .rc-foot { position: absolute; left: 0; right: 0; top: 735px; height: 77px; box-sizing: border-box; padding: 16px 12px; }
        .rc-btn { display: block; width: 100%; height: 44px; line-height: 44px; border: 0; padding: 0; border-radius: 8px; text-align: center; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 16px; font-weight: 700; cursor: pointer; }
        .rc-btn:disabled { opacity: 0.5; cursor: default; }

        /* ---- 网页端 ≥768（1280 实测：卡片 968，字段 944，按钮在输入下方） ---- */
        @media (min-width: 768px) {
          .rc { background: transparent; max-width: 968px; margin: 0 auto; min-height: 0; padding-bottom: 40px; }
          .rc-bar { display: none; }
          .rc-card { margin: 40px 0 0; padding: 12px; }
          .rc-title { height: 40px; line-height: 40px; }
          .rc-row--gap { margin-top: 43px; }
          .rc-row--gap2 { margin-top: 43px; }
          .rc-input--gap { margin-top: 44px; }
          .rc-foot { position: static; height: auto; padding: 16px 0 0; }
          .rc-btn { height: 44px; }
          .rc-row, .rc-input { height: 40px; }
        }
      `}</style>
    </div>
  )
}
