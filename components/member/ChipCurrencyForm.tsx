'use client'
// 筹码与货币（/chip-currency）：当前币种 + 可选币种（单选）+ 保存；Reset To USDT 直接改为 USDT。
// 去向：保存/重置 → /api/web/member/chip（mock）。当前值从同接口读取（不传 currency）。
import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { post, ApiError } from '@/lib/api'
import { CHIP_CURRENCIES, RESET_CHIP } from '@/lib/mock/member'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { MemberFrame, MemberInputStyles, useErrText, useMemberState } from './shared'

export default function ChipCurrencyForm() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.chip.title')}><ChipBody /></MemberFrame>
}

function ChipBody() {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const errText = useErrText()
  const { st } = useMemberState()
  const [current, setCurrent] = useState<string | null>(null)
  const [pick, setPick] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (st === 'loading' || st === 'error' || st === 'empty') return
    let alive = true
    post<{ currency: string }>('/api/web/member/chip', {})
      .then((r) => { if (alive) { setCurrent(r.currency); setPick(r.currency) } })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [st])

  if (st === 'loading') return <SkBox h={341} state={t('member.common.loading')} className="member_chipcurrencyform__cc-skel" />
  if (st === 'empty') return <SkStatus kind="empty" title={t('member.chip.noItems')} hint="" h={240} className="member_chipcurrencyform__cc-st" />
  if (st === 'error' || failed) return <SkStatus kind="error" h={240} className="member_chipcurrencyform__cc-st" />
  if (current === null) return null

  const save = async (currency: string) => {
    if (busy) return
    setBusy(true)
    try {
      const r = await post<{ currency: string }>('/api/web/member/chip', { currency })
      setCurrent(r.currency); setPick(r.currency)
      showToast(t('member.toast.saved'))
    } catch (err) {
      showToast(errText(err instanceof ApiError ? err.code : 0))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="cc-card">
      <div className="cc-title"><strong>{t('member.chip.heading')}</strong></div>
      <div className="cc-current">
        <span className="cc-k">{t('member.chip.current')}</span>
        <strong className="cc-v">{current}</strong>
        <p className="cc-note">{t('member.chip.note')}</p>
      </div>
      <div className="cc-list" role="radiogroup" aria-label={t('member.chip.heading')}>
        {CHIP_CURRENCIES.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={pick === c} className={`cc-chip${pick === c ? ' on' : ''}`} onClick={() => setPick(c)}>{c}</button>
        ))}
      </div>
      <button type="button" className="m-btn cc-btn" disabled={busy || pick === current} onClick={() => save(pick)}>{busy ? t('member.common.saving') : t('member.common.save')}</button>
      <button type="button" className="cc-reset" disabled={busy || current === RESET_CHIP} onClick={() => save(RESET_CHIP)}>{t('member.chip.reset', { c: RESET_CHIP })}</button>

      <MemberInputStyles />
      <style jsx>{`
        :global(.member_chipcurrencyform__cc-skel) { width: calc(100% - 16px); margin: 8px; }
        :global(.member_chipcurrencyform__cc-st) { margin: 8px; }
        .cc-card { margin: 8px; padding: 12px; border-radius: 8px; background: #22252b; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; }
        .cc-title { height: 19px; display: flex; align-items: center; font-size: 14px; }
        .cc-current { display: flex; flex-direction: column; gap: 6px; height: 105px; padding: 12px; box-sizing: border-box; border-radius: 8px; background: #2a2d33; }
        .cc-k { color: #8d8d92; font-size: 12px; }
        .cc-v { font-size: 20px; color: #fff; }
        .cc-note { margin: 0; color: #8d8d92; font-size: 12px; }
        .cc-list { display: flex; gap: 8px; }
        .cc-chip { flex: 1; height: 42px; border: 1px solid #3a3d44; border-radius: 8px; background: transparent; color: #c4c8d0; font-size: 13px; cursor: pointer; }
        .cc-chip.on { border-color: var(--vp-primary); color: var(--vp-primary); }
        .cc-btn { border-radius: 999px; height: 48px; font-weight: 700; }
        .cc-reset { border: 0; background: transparent; color: #8d8d92; font-size: 13px; text-decoration: underline; cursor: pointer; }
        .cc-reset:disabled { opacity: .5; cursor: default; }
      `}</style>
    </section>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
