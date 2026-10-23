'use client'
// 政策弹窗（Policies & Responsible Gambling）：标题 + 关闭、5 个分页签、可滚动正文、右下回到顶部。
// 正文为自有占位（待换成运营方自己的条款文本）。
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useModalMotion } from '@/lib/useModalMotion'

export const POLICY_TABS = ['aml', 'privacy', 'terms', 'responsible', 'complaint'] as const
export type PolicyTab = (typeof POLICY_TABS)[number]

interface Props { open: boolean, tab: PolicyTab, onTab: (t: PolicyTab) => void, onClose: () => void }

export default function PolicyModal({ open, tab, onTab, onClose }: Props) {
  const { t } = useLanguage()
  const { mounted, shown } = useModalMotion(open)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); setScrolled(false) }, [tab, open])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])

  const name = t(`base.footer.policy.${tab}`)
  return (
    <div className={`back mo-overlay${open ? ' on' : ''}`} onClick={onClose}>
      {mounted && (
        <div className={`box mo-modal-enter-active${shown ? '' : ' mo-modal-enter-from'}`} role="dialog" aria-modal="true" aria-label={t('base.footer.policy.title')} onClick={(e) => e.stopPropagation()}>
          <header className="hd">
            <h3>{t('base.footer.policy.title')}</h3>
            <span className="x" role="button" tabIndex={0} aria-label={t('base.shell.close')} onClick={onClose}>✕</span>
          </header>
          <nav className="tabs" role="tablist">
            {POLICY_TABS.map((k) => (
              <span key={k} role="tab" tabIndex={0} aria-selected={tab === k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => onTab(k)}>{t(`base.footer.policy.${k}`)}</span>
            ))}
          </nav>
          <div className="body" ref={bodyRef} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 120)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <section key={n}>
                <h4>{n}. {t('base.footer.policy.head', { n })}</h4>
                <p>{n}.1 {t('base.footer.policy.body', { name })}</p>
                <p>{n}.2 {t('base.footer.policy.body', { name })}</p>
              </section>
            ))}
          </div>
          {scrolled ? <span className="top" role="button" tabIndex={0} aria-label="top" onClick={() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>⌃</span> : null}
        </div>
      )}

      <style jsx>{`
        .back { position: fixed; inset: 0; z-index: 95; background: rgba(0, 0, 0, .6); display: flex; align-items: center; justify-content: center; padding: 12px; }
        .back:not(.on) { pointer-events: none; }
        .box { position: relative; display: flex; flex-direction: column; width: min(100%, 1080px); height: min(100%, 780px); overflow: hidden; border-radius: 16px; background: #1d1f26; border: 1px solid rgba(255, 255, 255, .1); color: #fff; }
        .hd { position: relative; display: flex; align-items: center; justify-content: center; height: 64px; flex: none; }
        h3 { margin: 0; font-size: 20px; font-weight: 700; }
        .x { position: absolute; right: 16px; top: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; cursor: pointer; }
        .tabs { display: flex; gap: 8px; flex: none; padding: 0 16px; border-bottom: 1px solid #2c2e34; overflow-x: auto; }
        .tab { flex: none; padding: 12px; font-size: 15px; font-weight: 500; color: #aeb2bb; cursor: pointer; white-space: nowrap; }
        .tab.on { color: var(--vp-primary); box-shadow: inset 0 -2px 0 var(--vp-primary); }
        .body { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 16px 40px; color: #aeb2bb; font-size: 14px; line-height: 1.8; }
        h4 { margin: 24px 0 8px; font-size: 20px; font-weight: 700; color: #fff; }
        p { margin: 0 0 8px; }
        .top { position: absolute; right: 20px; bottom: 20px; width: 56px; height: 56px; border-radius: 50%; background: #000; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; }
      `}</style>
    </div>
  )
}
