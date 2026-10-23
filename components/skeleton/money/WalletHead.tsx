'use client'
// 钱包头部 + 存款/提款 tab。mode=panel：右侧面板（带关闭）；mode=page：整页（带返回）。
// 参考站：面板顶行高 55；tab 距顶 12，高 61，两个 tab 各 171 宽，间距 9。
import { useGate } from '@/lib/useGate'
import { useLanguage } from '@/context/LanguageContext'

export type WalletView = 'deposit' | 'withdraw' | 'records'
interface Props { view: WalletView, mode: 'panel' | 'page', onView?: (v: WalletView) => void, onClose?: () => void }

export default function WalletHead({ view, mode, onView, onClose }: Props) {
  const { back } = useGate()
  const { t } = useLanguage()
  return (
    <div className="wh">
      <div className="wh-bar">
        {mode === 'page' && <span className="wh-back" role="button" tabIndex={0} aria-label={t('member.frame.back')} onClick={() => back()}>‹</span>}
        <strong className="wh-title">{t(`member.wallet.title.${view}`)}</strong>
        <button type="button" className={`wh-pill${view === 'records' ? ' on' : ''}`} onClick={() => onView?.('records')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></svg>{t('member.wallet.records')}</button>
        {mode === 'panel' && <button type="button" className="wh-x" aria-label={t('member.frame.close')} onClick={() => onClose?.()}>✕</button>}
      </div>
      <div className="wh-tabs">
        <button type="button" className={view === 'deposit' ? 'on' : undefined} onClick={() => onView?.('deposit')}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M12 2v6M9.5 5.5 12 8l2.5-2.5" /></svg><span>{t('member.wallet.tab.deposit')}</span></button>
        <button type="button" className={view === 'withdraw' ? 'on' : undefined} onClick={() => onView?.('withdraw')}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M12 8V2M9.5 4.5 12 2l2.5 2.5" /></svg><span>{t('member.wallet.tab.withdraw')}</span></button>
      </div>

      <style jsx>{`
        .wh { color: #fff; }
        .wh-bar { display: flex; align-items: center; gap: 8px; height: 55px; padding: 0 12px; box-sizing: border-box; }
        .wh-back { width: 16px; font-size: 26px; line-height: 1; cursor: pointer; }
        .wh-title { flex: 1; font-size: 16px; font-weight: 600; }
        .wh-pill { display: flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 16px; border: 1px solid rgba(255, 255, 255, .08); border-radius: 20px; background: linear-gradient(180deg, #34353d, #26272e); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 2px 6px rgba(0, 0, 0, .3); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
        .wh-pill.on { border-color: var(--vp-primary); }
        .wh-x { width: 31px; height: 31px; border: 0; border-radius: 50%; background: rgba(255, 255, 255, .1); color: #fff; font-size: 12px; cursor: pointer; }
        .wh-tabs { display: flex; gap: 10px; padding: 12px 12px 12px; box-sizing: border-box; }
        .wh-tabs button { flex: 1; height: 72px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1px solid rgba(255, 255, 255, .05); border-radius: 12px; background: #1f2026; color: #6f747d; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s ease; }
        .wh-tabs button.on { color: #fff; border-color: rgba(90, 250, 104, .55); background: linear-gradient(180deg, #34363e, #25262d); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .12), 0 4px 14px rgba(0, 0, 0, .35); }
        .wh-tabs button.on svg { color: var(--vp-primary); }
      `}</style>
    </div>
  )
}
