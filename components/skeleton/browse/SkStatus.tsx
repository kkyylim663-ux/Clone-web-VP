'use client'
// 空态 / 错误占位块（骨架用，文字中性，不放图片）。用法：<SkStatus kind="empty" title="无结果" h={200} />
// 默认文案走语言文件 base.status.*（英文模式不再显示中文）。onRetry 传了才显示「重试」按钮，点击调用 onRetry；不传则不显示按钮。
import { useLanguage } from '@/context/LanguageContext'

interface Props { kind: 'empty' | 'error', title?: string, hint?: string, h?: number, className?: string, onRetry?: () => void }

export default function SkStatus({ kind, title, hint, h, className, onRetry }: Props) {
  const { t } = useLanguage()
  const isErr = kind === 'error'
  const ttl = title ?? t(isErr ? 'base.status.errorTitle' : 'base.status.emptyTitle')
  const hi = hint ?? t(isErr ? 'base.status.errorHint' : 'base.status.emptyHint')
  return (
    <div className={`st ${kind}${className ? ` ${className}` : ''}`} style={{ minHeight: h ? `${h}px` : undefined }}>
      <span className="ico" aria-hidden="true">{isErr ? '!' : '○'}</span>
      <strong>{ttl}</strong>
      <small>{hi}</small>
      {onRetry ? <button type="button" className="retry" onClick={onRetry}>{t('base.status.retry')}</button> : null}

      <style jsx>{`
        .st { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box;
          padding: 24px 16px; border: 1px dashed #3a3d44; border-radius: 12px; background: #1d1f23; color: #8d8d92; text-align: center; }
        .ico { width: 40px; height: 40px; border-radius: 50%; background: #2a2d33; display: flex; align-items: center; justify-content: center; color: #c4c8d0; font-size: 18px; }
        .st strong { color: #c4c8d0; font-size: 14px; }
        .st small { font-size: 12px; }
        .st.error .ico { color: var(--vp-danger); }
        .retry { margin-top: 4px; padding: 6px 16px; border-radius: 999px; border: 1px solid #3a3d44; background: transparent; color: #c4c8d0; font-family: inherit; font-size: 12px; cursor: pointer; }
      `}</style>
    </div>
  )
}
