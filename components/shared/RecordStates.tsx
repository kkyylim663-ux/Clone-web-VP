'use client'
import SkBox from '@/components/ui/SkBox'
import IconTile from '@/components/ui/IconTile'
import SkStatus from '@/components/shared/SkStatus'

// 记录列表四态：state=loading 骨架行 | error 错误 | data 数据行 | 其它（含默认）空态。
// items 缺省且 state=data 时显示占位行（参考站样式）。notice=true：通知样式（行高 72，左侧未读点）。
export interface RecordItem { id: number | string, title: string, sub?: string, status?: string, unread?: boolean }
interface Props { state?: string, notice?: boolean, items?: RecordItem[], onRetry?: () => void }

export default function RecordStates({ state, notice, items, onRetry }: Props) {
  const kind = state === 'loading' || state === 'error' || state === 'data' ? state : 'empty'
  const rows: RecordItem[] = items ?? [0, 1, 2].map((n) => ({ id: n, title: '—', sub: '0.00', status: '—' }))
  return (
    <div className="rs">
      {kind === 'loading' ? [0, 1, 2, 3].map((n) => <SkBox key={n} state="加载中" className="shared_recordstates__rs-skel" />) : null}
      {kind === 'error' ? <SkStatus kind="error" h={200} className="shared_recordstates__rs-status" onRetry={onRetry} /> : null}
      {kind === 'empty' ? <SkStatus kind="empty" h={200} className="shared_recordstates__rs-status" /> : null}
      {kind === 'data' ? rows.map((r, i) => (
        <div key={r.id} className={`rs-row${notice ? ' notice' : ''}${notice && (r.unread ?? i % 2 === 0) ? ' unread' : ''}`}>
          {notice ? <span className="rs-dot" /> : <IconTile name="receipt" size={36} round />}
          <div className="rs-t"><span className="rs-l1">{r.title}</span><span className="rs-l2">{r.sub}</span></div>
          <span className="rs-st">{r.status}</span>
        </div>
      )) : null}
      <style jsx global>{`
        .rs { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; color: #fff; font-size: 13px; }
        :global(.shared_recordstates__rs-skel) { width: 100%; height: 64px; box-sizing: border-box; }
        :global(.shared_recordstates__rs-status) { margin-top: 40px; }
        .rs-row { display: flex; align-items: center; gap: 10px; height: 64px; padding: 0 12px; box-sizing: border-box; border-radius: 8px; background: #22252b; }
        .rs-row.notice { height: 72px; background: #1d1f23; }
        .rs-row.unread { background: #242a33; }
        .rs-dot { width: 8px; height: 8px; flex: none; border-radius: 50%; background: transparent; }
        .rs-row.unread .rs-dot { background: var(--vp-primary, var(--vp-primary)); }
        .rs-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .rs-l1 { color: #c4c8d0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rs-l2 { color: #8d8d92; font-size: 12px; }
        .rs-st { color: #6b7078; font-size: 12px; }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
