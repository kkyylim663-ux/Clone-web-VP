'use client'
import type { CSSProperties } from 'react'
import { useT } from '@/context/LanguageContext'

// 空态 / 错误占位块（骨架用，文字中性，不放图片）。用法：<SkStatus kind="empty" title="无结果" h={200} />
// 与 vp-web/app/components/skeleton/browse/SkStatus.vue 同版式；标题缺省时取 status.* 文案。
interface Props { kind: 'empty' | 'error', title?: string, hint?: string, h?: number, className?: string, onRetry?: () => void }

export default function SkStatus({ kind, title, hint, h, className, onRetry }: Props) {
  const t = useT()
  const ttl = title ?? (kind === 'error' ? t('status.errorTitle') : t('status.emptyTitle'))
  const sub = hint ?? (kind === 'error' ? t('status.errorHint') : t('status.emptyHint'))
  const style: CSSProperties | undefined = h ? { minHeight: `${h}px` } : undefined
  return (
    <div className={`st ${kind} ${className ?? ''}`.trim()} style={style}>
      <span className="ico" aria-hidden="true">{kind === 'error' ? '!' : '○'}</span>
      <strong>{ttl}</strong>
      <small>{sub}</small>
      {kind === 'error' ? <button type="button" className="retry" onClick={onRetry}>{t('status.retry')}</button> : null}
      <style jsx global>{`
        .st { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box;
          padding: 24px 16px; border: 1px dashed #3a3d44; border-radius: 12px; background: #1d1f23; color: #8d8d92; text-align: center; }
        .st .ico { width: 40px; height: 40px; border-radius: 50%; background: #2a2d33; display: flex; align-items: center; justify-content: center; color: #c4c8d0; font-size: 18px; }
        .st strong { color: #c4c8d0; font-size: 14px; }
        .st small { font-size: 12px; }
        .st.error .ico { color: #f87171; }
        .st .retry { margin-top: 4px; padding: 6px 16px; border-radius: 999px; border: 1px solid #3a3d44; background: transparent; color: #c4c8d0; font-size: 12px; font-family: inherit; cursor: pointer; }
      `}</style>
    </div>
  )
}
