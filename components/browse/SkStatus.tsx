'use client'
// 空态 / 错误占位块（对应 Vue 版 SkStatus）。文字由调用方用 t() 传入。
interface Props { kind: 'empty' | 'error', title: string, hint?: string, h?: number, retryLabel?: string, onRetry?: () => void, className?: string }

export default function SkStatus({ kind, title, hint, h, retryLabel, onRetry, className }: Props) {
  return (
    <div className={`st ${kind} ${className ?? ''}`} style={{ minHeight: h }}>
      <span className="ico" aria-hidden="true">{kind === 'error' ? '!' : '○'}</span>
      <strong>{title}</strong>
      {hint ? <small>{hint}</small> : null}
      {kind === 'error' ? <span className="retry" role="button" tabIndex={0} onClick={onRetry}>{retryLabel}</span> : null}
      <style jsx>{`
        .st { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box;
          padding: 24px 16px; border: 1px dashed #3a3d44; border-radius: 12px; background: #1d1f23; color: #8d8d92; text-align: center; }
        .ico { width: 40px; height: 40px; border-radius: 50%; background: #2a2d33; display: flex; align-items: center; justify-content: center; color: #c4c8d0; font-size: 18px; }
        .st strong { color: #c4c8d0; font-size: 14px; }
        .st small { font-size: 12px; }
        .st.error .ico { color: #f87171; }
        .retry { margin-top: 4px; padding: 6px 16px; border-radius: 999px; border: 1px solid #3a3d44; color: #c4c8d0; font-size: 12px; cursor: pointer; }
      `}</style>
    </div>
  )
}
