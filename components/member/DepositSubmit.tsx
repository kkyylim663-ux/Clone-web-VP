'use client'
// 存款提交页（/wallet-deposit-submit）三步卡片：
//  步骤一：选择币种与网络（下拉）；步骤二：收款信息（地址由后端下发，此处占位）；步骤三：金额、交易哈希、付款人姓名、备注 → mock 提交（kind=proof）。
// 校验：金额字符串（存款限额）、交易哈希 ≥10 位、付款人 ≥2 位。成功/失败 toast。
// ?state=guest|member|loading|error（同 Nuxt 版）；访客：GuestGate 点登录跳 /login?page=wallet。
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { post, ApiError } from '@/lib/api'
import { WALLET_CURRENCIES, WALLET_NETWORKS, checkWallet } from '@/lib/mock/member'
import SkImg from '@/components/ui/SkImg'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import GuestGate from '@/components/skeleton/money/GuestGate'
import { Field, inputClass, useErrText, useFieldText } from './shared'
import { useGate } from '@/lib/useGate'

export default function DepositSubmit() {
  const { t } = useLanguage()
  const { back } = useGate()
  const sp = useSearchParams()
  const { loggedIn } = useAuth()
  const st = sp.get('state') ?? ''
  const member = st !== 'guest' && (st !== '' || loggedIn)

  return (
    <div className="ds">
      <header className="ds-nav"><span className="ds-back" role="button" tabIndex={0} aria-label={t('member.frame.back')} onClick={() => back()}>‹</span><span className="ds-title">{t('member.depositSubmit.title')}</span></header>
      <div className="ds-wrap">
        <div className="ds-col">
          {!member ? <GuestGate /> : st === 'loading' ? (
            [0, 1, 2].map((n) => <SkBox key={n} state={t('member.common.loading')} className="member_depositsubmit__ds-skel" />)
          ) : st === 'error' ? (
            <SkStatus kind="error" h={240} className="member_depositsubmit__ds-status" />
          ) : (
            <DepositForm />
          )}
        </div>
      </div>

      <style jsx>{`
        .ds { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .ds-nav { height: 55px; display: flex; align-items: center; gap: 12px; padding: 0 12px; box-sizing: border-box; }
        .ds-back { width: 20px; font-size: 26px; line-height: 1; cursor: pointer; }
        .ds-title { font-size: 16px; font-weight: 600; }
        .ds-wrap { padding: 0 0 24px; box-sizing: border-box; }
        .ds-col { width: 100%; }
        :global(.member_depositsubmit__ds-skel) { width: 100%; height: 96px; margin-top: 21px; box-sizing: border-box; }
        :global(.member_depositsubmit__ds-status) { margin-top: 40px; }
        .ds-sub { height: 19px; margin: 27px 0 0; padding: 0 8px; font-size: 17px; font-weight: 500; line-height: 19px; color: #fff; }
        .ds-card { width: 359px; max-width: calc(100% - 16px); margin: 0 8px; box-sizing: border-box; border-radius: 8px; background: #22252b; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .ds-info { color: #c4c8d0; font-size: 13px; }
        .ds-row2 { display: flex; gap: 12px; align-items: center; }
        .ds-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 12px; row-gap: 12px; }
        .ds-addr { padding: 12px; box-sizing: border-box; border-radius: 6px; background: #1a1a21; color: #8d8d92; font-size: 12px; word-break: break-all; }
        .ds-err { margin: 0; color: #f87171; font-size: 12px; }
        .ds-btn { width: 359px; height: 44px; margin: 24px 8px 0; border: 0; border-radius: 4px; background: var(--vp-primary, #5effac); color: var(--vp-on-primary); font-size: 16px; font-weight: 500; cursor: pointer; }
        .ds-btn:disabled { opacity: .6; cursor: default; }
        @media (min-width: 768px) {
          .ds { background: transparent; }
          .ds-nav { display: none; }
          .ds-wrap { padding: 40px 32px 32px; }
          .ds-col { width: 359px; margin: 0 auto; }
          .ds-sub { display: none; }
          .ds-btn { margin: 24px auto 0; }
        }
      `}</style>
    </div>
  )
}

function DepositForm() {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const errText = useErrText()
  const fieldText = useFieldText()
  const [cur, setCur] = useState<string>(WALLET_CURRENCIES[0])
  const [net, setNet] = useState<string>(WALLET_NETWORKS[WALLET_CURRENCIES[0]][0])
  const [v, setV] = useState({ amount: '', txid: '', name: '', remark: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrs((x) => ({ ...x, [k]: '' })) }
  const changeCur = (c: string) => { setCur(c); setNet(WALLET_NETWORKS[c][0]) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const er = checkWallet('proof', { currency: cur, network: net, amount: v.amount, txid: v.txid, name: v.name })
    setErrs(er)
    if (Object.keys(er).length) return
    setBusy(true)
    try {
      await post('/api/web/member/wallet/submit', { kind: 'proof', currency: cur, network: net, amount: v.amount, txid: v.txid, name: v.name })
      setV({ amount: '', txid: '', name: '', remark: '' })
      showToast(t('member.toast.submitted'))
    } catch (err) {
      showToast(errText(err instanceof ApiError ? err.code : 0))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="ds-sub">{t('member.depositSubmit.step1')}</h2>
      <section className="ds-card">
        <div className="ds-grid">
          <Field label={t('member.wallet.currency')}>
            <select className={inputClass()} value={cur} onChange={(e) => changeCur(e.target.value)}>{WALLET_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </Field>
          <Field label={t('member.wallet.network')}>
            <select className={inputClass()} value={net} onChange={(e) => setNet(e.target.value)}>{WALLET_NETWORKS[cur].map((n) => <option key={n} value={n}>{n}</option>)}</select>
          </Field>
        </div>
        <div className="ds-row2">
          <SkImg w={148} h={148} radius={3} label={t('member.depositSubmit.qr')} />
          <p className="ds-info">{t('member.depositSubmit.tip')}</p>
        </div>
      </section>

      <h2 className="ds-sub">{t('member.depositSubmit.step2')}</h2>
      <section className="ds-card">
        <div className="ds-addr">{t('member.depositSubmit.addrHint')}</div>
        <SkImg w={108} h={108} radius={0} label={t('member.depositSubmit.qr')} />
      </section>

      <h2 className="ds-sub">{t('member.depositSubmit.step3')}</h2>
      <section className="ds-card">
        <div className="ds-grid">
          <Field label={t('member.wallet.amount')} error={fieldText(errs.amount, { min: 10, max: 50000 })}><input className={inputClass(errs.amount)} inputMode="decimal" value={v.amount} onChange={set('amount')} /></Field>
          <Field label={t('member.depositSubmit.txid')} error={fieldText(errs.txid)}><input className={inputClass(errs.txid)} value={v.txid} onChange={set('txid')} /></Field>
          <Field label={t('member.depositSubmit.payer')} error={fieldText(errs.name)}><input className={inputClass(errs.name)} value={v.name} onChange={set('name')} /></Field>
          <Field label={t('member.depositSubmit.remark')}><input className={inputClass()} value={v.remark} onChange={set('remark')} /></Field>
        </div>
      </section>

      <button type="submit" className="ds-btn" disabled={busy}>{busy ? t('member.common.submitting') : t('member.depositSubmit.submit')}</button>
      <DsInline />
    </form>
  )
}

// 与 .ds-btn 配套的表单控件基础样式（页面内 scoped，不影响其它页）
function DsInline() {
  return (
    <style jsx global>{`
      .m-inp { width: 100%; height: 36px; box-sizing: border-box; padding: 0 10px; border: 0; border-radius: 4px; background: #39434d; color: #fff; font-size: 12px; outline: none; }
      .m-inp.err { box-shadow: inset 0 0 0 1px #f87171; }
    `}</style>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
