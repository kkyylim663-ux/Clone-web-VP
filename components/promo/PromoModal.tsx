'use client'
// 活动详情弹窗（参考站 /promotion 点「更多」弹出，375 宽居中）：标题栏 + 关闭、横幅、倒计时、说明、分页签、明细表、底部主按钮。
// 内容为自有占位：标题与描述取自活动数据，表格为通用「区间 / 比例 / 流水」占位行。
import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useModalMotion } from '@/lib/useModalMotion'
import SkImg from '@/components/ui/SkImg'
import type { PromoContent } from '@/components/promo/promoContent'

interface Props { open: boolean, title: string, desc: string, onClose: () => void, onCta: () => void, content?: PromoContent }
type Tab = 'bonus' | 'games' | 'rules'
const ROWS = ['10 – 20', '20 – 50', '50 – 100', '100+']

export default function PromoModal({ open, title, desc, onClose, onCta, content }: Props) {
  const { t } = useLanguage()
  const { mounted, shown } = useModalMotion(open)
  const [tab, setTab] = useState<Tab>('bonus')

  useEffect(() => { if (open) setTab('bonus') }, [open])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])

  const tabs: Tab[] = content && !content.games ? ['bonus', 'rules'] : ['bonus', 'games', 'rules']
  return (
    <div className={`back mo-overlay${open ? ' on' : ''}`} onClick={onClose}>
      {mounted && (
        <div className={`box mo-modal-enter-active${shown ? '' : ' mo-modal-enter-from'}`} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
          <header className="hd">
            <h3>{title}</h3>
            <span className="x" role="button" tabIndex={0} aria-label={t('promotion.modal.close')} onClick={onClose}>✕</span>
          </header>
          <div className="body">
            {content ? <img className="ban" src={`/assets/promotion/${content.img}.webp`} alt="" /> : <SkImg ratio="343 / 130" radius={12} label="" />}
            <div className="tabs" role="tablist">
              {tabs.map((k) => (
                <span key={k} role="tab" tabIndex={0} aria-selected={tab === k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{t(`promotion.modal.${k}`)}</span>
              ))}
            </div>

            {tab === 'bonus' ? (
              <>
                <h4>{t('promotion.modal.details')}</h4>
                {content ? null : <p className="desc">{desc}</p>}
                <table>
                  <thead><tr>{(content?.head ?? [t('promotion.modal.range'), t('promotion.modal.ratio'), t('promotion.modal.turnover')]).map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{(content?.rows ?? ROWS.map((r, i) => [r, `${(i + 1) * 10}%`, 'x1'])).map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
                </table>
              </>
            ) : null}
            {tab === 'games' ? (
              <>
                <h4>{t('promotion.modal.games')}</h4>
                <div className="games">{Array.from({ length: 6 }, (_, n) => <SkImg key={n} src={`/assets/bonus/ico-${n % 5 + 1}.webp`} ratio="1 / 1" radius={8} label="" />)}</div>
              </>
            ) : null}
            {tab === 'rules' ? (
              <>
                <h4>{t('promotion.modal.rules')}</h4>
                <ol className="rules">{(content?.rules ?? [1, 2, 3].map((n) => t('promotion.modal.rulePh', { n }))).map((r, i) => <li key={i}>{r}</li>)}</ol>
              </>
            ) : null}
          </div>
          <footer className="ft"><button type="button" onClick={onCta}>{content?.cta ?? t('promotion.modal.cta')}</button></footer>
        </div>
      )}

      <style jsx>{`
        .back { position: fixed; inset: 0; z-index: 90; background: rgba(0, 0, 0, .6); display: flex; align-items: center; justify-content: center; padding: 12px; }
        .back:not(.on) { pointer-events: none; }
        .box { display: flex; flex-direction: column; width: min(100%, 375px); max-height: min(100%, 720px); overflow: hidden; border-radius: 16px; background: #1d1f26; border: 1px solid rgba(255, 255, 255, .1); color: #fff; }
        .hd { position: relative; display: flex; align-items: center; justify-content: center; height: 48px; flex: none; }
        h3 { margin: 0; padding: 0 44px; font-size: 15px; font-weight: 700; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .x { position: absolute; right: 8px; top: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px; color: #c4c8d0; cursor: pointer; }
        .x:hover { background: rgba(255, 255, 255, .1); }
        .body { flex: 1; min-height: 0; overflow-y: auto; padding: 0 16px 12px; }
        .ban { display: block; width: 100%; aspect-ratio: 343 / 130; object-fit: cover; border-radius: 12px; }
        .tabs { display: flex; gap: 4px; margin-top: 14px; padding: 3px; border-radius: 10px; background: rgba(255, 255, 255, .06); }
        .tab { flex: 1; height: 30px; line-height: 30px; text-align: center; border-radius: 8px; font-size: 12px; color: #aeb2bb; cursor: pointer; }
        .tab.on { background: rgba(255, 255, 255, .14); color: #fff; font-weight: 600; }
        h4 { margin: 16px 0 8px; font-size: 14px; color: #ffb74d; }
        .desc { margin: 0 0 12px; font-size: 12px; line-height: 1.6; color: #c4c8d0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: center; }
        th, td { padding: 8px 4px; border: 1px solid rgba(255, 255, 255, .08); }
        th { background: rgba(255, 255, 255, .08); font-weight: 600; color: #c4c8d0; }
        .games { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .rules { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.8; color: #c4c8d0; }
        .ft { flex: none; padding: 8px 16px 16px; }
        .ft button { width: 100%; height: 44px; border: 0; border-radius: 12px; background: var(--vp-grad); color: var(--vp-on-primary); font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  )
}
