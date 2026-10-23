'use client'
// 钱包主体（存款 / 提款 / 记录），面板与整页共用。
// view：deposit | withdraw | records
// state（?state=）：loading | error | empty（默认即空）| data（记录样例）
// flow（?flow=）：pick 预选首个网络 | verr 金额校验错误演示 | submitting 提交中 | success 成功 | fail 失败（仅演示结果块）
// 表单：币种/网络下拉、金额字符串校验（checkWallet，整数分比较）、快捷金额、提交 → /api/web/member/wallet/submit；成功/失败 toast。
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { post, ApiError } from '@/lib/api'
import { MEMBER_BALANCE, QUICK_AMOUNTS, WALLET_CURRENCIES, WALLET_LIMITS, WALLET_NETWORKS, checkWallet } from '@/lib/mock/member'
import IconTile from '@/components/ui/IconTile'
import DropSelect from '@/components/ui/DropSelect'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { useAgo, useErrText, useFieldText, useMemberQuery } from '@/components/member/shared'
import type { WalletView } from './WalletHead'

interface Props { view: WalletView, state?: string, flow?: string }
interface Rec { id: string, kind: 'deposit' | 'withdraw', currency: string, amount: string, status: 'success' | 'pending' | 'failed', minutesAgo: number }
// 错误块「重试」：回到不带 state 的同一页面（等于刷新状态，WalletPage 第 19 行规则下即正常态）
// 存款奖金档位（模拟数据）：第 n 笔存款享 pct%，最低存款 min，流水 x
const BONUSES = [
  { n: 1, pct: 50, min: 10, x: 15 },
  { n: 2, pct: 60, min: 100, x: 15 },
  { n: 3, pct: 70, min: 100, x: 15 },
]
const HREF: Record<WalletView, string> = { deposit: '/deposit', withdraw: '/withdraw', records: '/wallet/records' }

export default function WalletBody({ view, state, flow }: Props) {
  if (view === 'records') return <Records key="records" state={state ?? ''} />
  return <Money key={view} view={view} state={state ?? ''} flow={flow ?? ''} />
}

/* ---------- 存款 / 提款表单 ---------- */
function Money({ view, state, flow }: { view: 'deposit' | 'withdraw', state: string, flow: string }) {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const errText = useErrText()
  const fieldText = useFieldText()
  const [cur, setCur] = useState<string>(WALLET_CURRENCIES[0])
  const [net, setNet] = useState<string>(WALLET_NETWORKS[WALLET_CURRENCIES[0]][0])
  const [amount, setAmount] = useState('')
  const [bonus, setBonus] = useState(1) // 0 = 不使用奖金；1.. = BONUSES 下标 + 1
  const [bonusOpen, setBonusOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>(flow === 'verr' ? { amount: 'amountFormat' } : {})
  const [busy, setBusy] = useState(flow === 'submitting')
  const [result, setResult] = useState<'' | 'ok' | 'bad'>(flow === 'success' ? 'ok' : flow === 'fail' ? 'bad' : '')
  const picked = flow !== ''
  const lim = WALLET_LIMITS[view]
  const router = useRouter()
  const retry = () => router.replace(HREF[view])

  const changeCur = (c: string) => { setCur(c); setNet(WALLET_NETWORKS[c][0]); setErrs({}) }
  const submit = async () => {
    if (busy) return
    const e = checkWallet(view, { currency: cur, network: net, amount, address })
    setErrs(e)
    setResult('')
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      await post('/api/web/member/wallet/submit', { kind: view, currency: cur, network: net, amount, address, bonus: bonus ? BONUSES[bonus - 1].n : 0 })
      setResult('ok'); setAmount(''); showToast(t('member.toast.submitted'))
    } catch (err) {
      setResult('bad'); showToast(errText(err instanceof ApiError ? err.code : 0))
    } finally {
      setBusy(false)
    }
  }

  // ?state=loading|empty|error：表单整块替换为加载 / 空 / 错误块（参考：docs/audit/haiku-tasks/24-wallet-page-states.md）
  if (state === 'loading' || state === 'empty' || state === 'error') {
    return (
      <div className={`wb is-${view}`}>
        {state === 'loading' && <SkBox state={t('member.common.loading')} className="skeleton_money_walletbody__wb-fskel" />}
        {state === 'empty' && <SkStatus kind="empty" title={t('member.wallet.noMethods')} hint={t('member.wallet.noMethodsHint')} h={200} className="skeleton_money_walletbody__wb-fstatus" />}
        {state === 'error' && <SkStatus kind="error" h={200} className="skeleton_money_walletbody__wb-fstatus" onRetry={retry} />}

        <style jsx>{`
          .wb { padding: 16px 0 0; color: #fff; font-size: 14px; }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`wb is-${view}`}>
      <div className="wb-row">
        <div className="wb-sel">
          <IconTile name="coins" size={24} round />
          <DropSelect ariaLabel={t('member.wallet.currency')} value={cur} options={[...WALLET_CURRENCIES]} onChange={changeCur} />
        </div>
        <div className="wb-bal"><b>{cur} {MEMBER_BALANCE}</b><IconTile name="refresh" size={20} round /></div>
      </div>

      {view === 'deposit' && (
        <>
          <span className="wb-label wb-label-b">{t('member.wallet.bonusTitle')}</span>
          <div className="wb-bwrap">
            <button type="button" className={`wb-bonus${bonus ? '' : ' none'}`} aria-haspopup="listbox" aria-expanded={bonusOpen} onClick={() => setBonusOpen((o) => !o)}>
              <div className="wb-bonus-t">
                <b>{bonus ? t('member.wallet.bonusTier', { n: BONUSES[bonus - 1].n, pct: BONUSES[bonus - 1].pct }) : t('member.wallet.bonusNone')}</b>
                <small>{bonus ? t('member.wallet.bonusMinN', { min: BONUSES[bonus - 1].min, x: BONUSES[bonus - 1].x }) : t('member.wallet.bonusPick')}</small>
              </div>
              <span className="wb-more">{t('member.wallet.bonusMore')}<svg className={bonusOpen ? 'up' : undefined} width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </button>
            {bonusOpen && (
              <ul className="wb-blist" role="listbox">
                <li role="option" aria-selected={bonus === 0} className={bonus === 0 ? 'on' : undefined} onClick={() => { setBonus(0); setBonusOpen(false) }}>
                  <span className="wb-bl-t"><b>{t('member.wallet.bonusNone')}</b></span>
                  {bonus === 0 ? <i className="wb-ck">✓</i> : null}
                </li>
                {BONUSES.map((o, i) => (
                  <li key={o.n} role="option" aria-selected={bonus === i + 1} className={bonus === i + 1 ? 'on' : undefined} onClick={() => { setBonus(i + 1); setBonusOpen(false) }}>
                    <span className="wb-bl-t"><b>{t('member.wallet.bonusTier', { n: o.n, pct: o.pct })}</b><small>{t('member.wallet.bonusMinN', { min: o.min, x: o.x })}</small></span>
                    {bonus === i + 1 ? <i className="wb-ck">✓</i> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <label className="wb-label" htmlFor={`wb-amt-${view}`}>{t('member.wallet.amount')}</label>
      <div className={`wb-field${errs.amount ? ' err' : ''}`}>
        <input id={`wb-amt-${view}`} inputMode="decimal" autoComplete="off" placeholder={t('member.wallet.amountPh')} value={amount} onChange={(e) => { setAmount(e.target.value); setErrs((x) => ({ ...x, amount: '' })) }} />
      </div>
      {errs.amount && <p className="wb-err">{fieldText(errs.amount, { min: lim.min, max: lim.max })}</p>}

      {view === 'deposit' && (
        <div className="wb-quick">
          {QUICK_AMOUNTS.map((q) => (
            <button key={q} type="button" className={`wb-q${amount === q ? ' on' : ''}`} onClick={() => setAmount(q)}><span>{q}</span>{bonus && Number(q) >= BONUSES[bonus - 1].min ? <i className="wb-bd">+{BONUSES[bonus - 1].pct}%</i> : null}</button>
          ))}
        </div>
      )}

      <div className="wb-methods">
        <div className="wb-m">
          <span className="wb-l1">{t('member.wallet.network')}</span>
          <DropSelect ariaLabel={t('member.wallet.network')} value={net} options={[...WALLET_NETWORKS[cur]]} onChange={setNet} align="right" className="wb-ds-r" />
        </div>
        {view === 'withdraw' && (
          <label className={`wb-m wb-m-in${errs.address ? ' err' : ''}`}>
            <input aria-label={t('member.wallet.address')} placeholder={t('member.wallet.addressPh')} value={address} onChange={(e) => { setAddress(e.target.value); setErrs((x) => ({ ...x, address: '' })) }} />
          </label>
        )}
      </div>
      {view === 'withdraw' && errs.address && <p className="wb-err">{fieldText(errs.address)}</p>}

      {result === 'ok' && <div className="wb-result ok" role="status">{t('member.wallet.resultOk')}</div>}
      {result === 'bad' && <div className="wb-result bad" role="alert">{t('member.wallet.resultBad')}</div>}
      <button type="button" className={`wb-submit${picked || amount ? ' on' : ''}${busy ? ' busy' : ''}`} disabled={busy} onClick={submit}>
        {busy ? t('member.common.submitting') : t(`member.wallet.submit.${view}`)}
      </button>

      <style jsx>{`
        /* 与参考站面板实测对齐：内容起点 y=16（面板主体起 140），币种行 136×42，金额框 350×48，快捷金额 4 列 × 2 行，格 85×50 */
        .wb { padding: 16px 0 0; color: #fff; font-size: 14px; }
        .wb-row { display: flex; align-items: center; justify-content: space-between; height: 42px; }
        .wb-sel { display: flex; align-items: center; gap: 8px; width: 140px; height: 46px; padding: 0 10px; box-sizing: border-box; border-radius: 12px; background: linear-gradient(180deg, #2c2d35, #24252c); border: 1px solid rgba(255, 255, 255, .06); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); }
        .wb-bal b { font-size: 20px; font-weight: 800; }
        .wb-sel-in { flex: 1; display: flex; }
        .wb-sel-in select, .wb-m select, .wb-m input { width: 100%; border: 0; background: transparent; color: #fff; font-size: 14px; outline: none; }
        .wb-sel-in select option, .wb-m select option { color: #000; }
        .wb-bal { display: flex; align-items: center; gap: 8px; }
        .wb-label-b { margin: 22px 0 10px; }
        .wb-bwrap { position: relative; }
        .wb-bonus { width: 100%; font-family: inherit; color: #fff; text-align: left; cursor: pointer; display: flex; align-items: center; justify-content: space-between; height: 70px; padding: 0 12px 0 14px; box-sizing: border-box; border-radius: 12px; background: linear-gradient(120deg, #1e3a2c 0%, #1c5a3a 55%, #19803f 100%); border: 1px solid rgba(90, 250, 104, .25); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .15); }
        .wb-bonus-t { display: flex; flex-direction: column; gap: 6px; }
        .wb-bonus-t b { font-size: 16px; font-weight: 800; color: #ffd978; }
        .wb-bonus-t small { font-size: 13px; color: #d5e8dc; }
        .wb-bonus.none { background: linear-gradient(180deg, #2b2c34, #23242b); border-color: rgba(255, 255, 255, .08); }
        .wb-bonus.none .wb-bonus-t b { color: #e6e8ee; }
        .wb-more svg { margin-left: 4px; vertical-align: -1px; transition: transform .2s ease; }
        .wb-more svg.up { transform: rotate(180deg); }
        .wb-blist { position: absolute; left: 0; right: 0; top: calc(100% + 8px); z-index: 20; margin: 0; padding: 6px; list-style: none; border-radius: 12px; background: #24252c; border: 1px solid rgba(255, 255, 255, .1); box-shadow: 0 12px 30px rgba(0, 0, 0, .55), inset 0 1px 0 rgba(255, 255, 255, .08); animation: wbIn .16s ease-out; }
        .wb-blist li { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
        .wb-blist li:hover { background: rgba(255, 255, 255, .07); }
        .wb-blist li.on { background: rgba(90, 250, 104, .1); }
        .wb-bl-t { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .wb-bl-t b { font-size: 15px; font-weight: 700; color: #ffd978; }
        .wb-blist li:first-child .wb-bl-t b { color: #e6e8ee; }
        .wb-bl-t small { font-size: 12px; color: #9aa0ac; }
        .wb-ck { flex: none; font-style: normal; font-weight: 800; color: var(--vp-primary); }
        @keyframes wbIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
        .wb-more { padding: 6px 12px; border-radius: 16px; background: rgba(255, 255, 255, .16); font-size: 13px; font-weight: 600; white-space: nowrap; }
        .wb-label { display: block; margin: 20px 0 12px; height: 16px; line-height: 16px; font-size: 13px; color: #8d8d92; }
        .wb.is-withdraw .wb-label { margin-top: 28px; }
        .wb-field { display: flex; align-items: center; height: 56px; padding: 0 14px; box-sizing: border-box; border-radius: 12px; background: #1c1d23; border: 1px solid rgba(255, 255, 255, .07); box-shadow: inset 0 2px 6px rgba(0, 0, 0, .35); }
        .wb-field input { width: 100%; border: 0; background: transparent; color: #fff; font-size: 20px; font-weight: 700; outline: none; }
        .wb-field input::placeholder { color: #55585f; font-weight: 700; }
        .wb-field.err { box-shadow: inset 0 0 0 1px #f87171; }
        .wb-err { margin: 6px 0 0; font-size: 12px; color: #f87171; }
        .wb-quick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 12px; }
        .wb-q { position: relative; display: flex; align-items: center; justify-content: center; height: 50px; border: 1px solid rgba(255, 255, 255, .06); border-radius: 10px; background: linear-gradient(180deg, #2b2c34, #23242b); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; }
        .wb-q.on { border-color: var(--vp-primary); box-shadow: inset 0 0 0 1px var(--vp-primary), 0 0 12px rgba(90, 250, 104, .25); }
        .wb-bd { position: absolute; top: 0; right: 0; padding: 2px 6px; border-radius: 0 10px 0 8px; background: rgba(255, 140, 40, .22); color: #ffa24d; font-size: 10px; font-style: normal; font-weight: 700; }
        .wb-methods { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .wb-m { display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 12px; box-sizing: border-box; border-radius: 12px; background: linear-gradient(180deg, #2b2c34, #23242b); border: 1px solid rgba(255, 255, 255, .06); color: #8d8d92; }
        .wb-m.err { box-shadow: inset 0 0 0 1px #f87171; }
        :global(.wb-ds-r) { height: 100%; }
        :global(.wb-ds-r) :global(.ds-btn) { justify-content: flex-end; }
        .wb-m-in input { padding: 0; }
        .wb-result { margin-top: 12px; height: 52px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 14px; }
        .wb-result.ok { background: rgba(94, 255, 172, .12); color: #5effac; }
        .wb-result.bad { background: rgba(248, 113, 113, .12); color: #f87171; }
        .wb-submit { display: flex; align-items: center; justify-content: center; width: 100%; height: 50px; margin-top: 24px; border: 0; border-radius: 12px; background: #2a2d33; color: #6b7078; font-size: 16px; font-weight: 500; cursor: pointer; }
        .wb-submit.on { background: var(--vp-grad); color: var(--vp-on-primary); font-weight: 700; box-shadow: inset 0 1px 0 rgba(255, 255, 255, .55), 0 4px 14px rgba(0, 245, 120, .3); }
        .wb-submit.busy, .wb-submit:disabled { opacity: .7; cursor: default; }
        /* 状态块（loading / empty / error）：加载块高度取表单区实测近似值 420（币种行到提交按钮） */
        :global(.skeleton_money_walletbody__wb-fskel) { width: 100%; height: 420px; box-sizing: border-box; }
        :global(.skeleton_money_walletbody__wb-fstatus) { margin-top: 40px; }
        .wb-l1 { color: #c4c8d0; }
      `}</style>
    </div>
  )
}

/* ---------- 钱包记录 ---------- */
function Records({ state }: { state: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const ago = useAgo()
  const rec = useMemberQuery<Rec[]>('/api/web/member/wallet/records', { demo: state }, state !== 'loading' && state !== 'error' && state !== 'empty')
  const kind = state === 'loading' || (rec.data === null && !rec.failed && state !== 'empty') ? 'loading'
    : state === 'error' || rec.failed ? 'error'
    : !rec.data?.length || state === 'empty' ? 'empty' : 'data'

  return (
    <div className="wb is-records">
      {kind === 'loading' && Array.from({ length: 4 }, (_, n) => <SkBox key={n} state={t('member.common.loading')} className="skeleton_money_walletbody__wb-skel" />)}
      {kind === 'error' && <SkStatus kind="error" h={200} className="skeleton_money_walletbody__wb-status" onRetry={() => router.replace(HREF.records)} />}
      {kind === 'empty' && <SkStatus kind="empty" title={t('member.wallet.emptyRecords')} hint="" h={200} className="skeleton_money_walletbody__wb-status" />}
      {kind === 'data' && (
        <div className="wb-recs">
          {rec.data!.map((r) => (
            <div key={r.id} className="wb-rec">
              <IconTile name="receipt" size={36} round />
              <div className="wb-rec-t">
                <span className="wb-l1">{t(`member.wallet.kind.${r.kind}`)} · {r.currency}</span>
                <span className="wb-l2">{r.amount} · {ago(r.minutesAgo)}</span>
              </div>
              <span className="wb-rec-st">{t(`member.wallet.status.${r.status}`)}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .wb { padding: 16px 0 0; color: #fff; font-size: 14px; }
        .wb-l1 { color: #c4c8d0; }
        .wb-l2 { color: #8d8d92; font-size: 12px; }
        .wb-recs { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .wb-rec { display: flex; align-items: center; gap: 10px; height: 64px; padding: 0 12px; box-sizing: border-box; border-radius: 8px; background: #26262d; }
        .wb-rec-t { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .wb-rec-st { color: #6b7078; font-size: 12px; }
        :global(.skeleton_money_walletbody__wb-skel) { width: 100%; height: 64px; margin-top: 12px; box-sizing: border-box; }
        :global(.skeleton_money_walletbody__wb-status) { margin-top: 40px; }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
