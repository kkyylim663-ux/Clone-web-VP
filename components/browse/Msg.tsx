'use client'
// 列表区文字占位块（对应 Vue 版 .msg）：加载失败时带「重试」。
interface Props { text: string, h: number, retryLabel?: string, onRetry?: () => void }

export default function Msg({ text, h, retryLabel, onRetry }: Props) {
  return (
    <div className="msg" style={{ height: h }}>
      <span>{text}</span>
      {onRetry ? <span className="retry" role="button" tabIndex={0} onClick={onRetry}>{retryLabel}</span> : null}
      <style jsx>{`
        .msg { display: flex; align-items: center; justify-content: center; gap: 12px; border: 1px dashed #3a3d44; border-radius: 12px; color: #8d93a0; font-size: 14px; margin-top: 12px; }
        .retry { padding: 4px 12px; border-radius: 999px; border: 1px solid #3a3d44; color: #c4c8d0; font-size: 12px; cursor: pointer; }
      `}</style>
    </div>
  )
}
