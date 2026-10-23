'use client'
// 登录设备（/sessions）：筛选 All / Active / Inactive；会话行：浏览器、时间、位置、IP（mock 为占位，不显示真实 IP）、状态。
// 列表末尾「No More Data」。数据：/api/web/member/sessions（mock）。
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import IconTile from '@/components/ui/IconTile'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { MemberFrame, MemberInputStyles, useAgo, useMemberQuery, useMemberState } from './shared'

interface Row { id: string, browser: string, minutesAgo: number, location: string, ip: string, status: 'current' | 'removed' }
type Tab = 'all' | 'active' | 'inactive'
const TABS: Tab[] = ['all', 'active', 'inactive']

export default function SessionsList() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.sessions.title')}><SessionsBody /></MemberFrame>
}

function SessionsBody() {
  const { t } = useLanguage()
  const ago = useAgo()
  const { st, member } = useMemberState()
  const [tab, setTab] = useState<Tab>('all')
  const q = useMemberQuery<Row[]>('/api/web/member/sessions', {}, member && st !== 'loading' && st !== 'error' && st !== 'empty')

  if (st === 'loading' || (q.data === null && !q.failed && st !== 'empty')) {
    return <div className="se-content">{[0, 1, 2].map((n) => <SkBox key={n} h={72} state={t('member.common.loading')} className="member_sessionslist__se-row" />)}</div>
  }
  if (st === 'error' || q.failed) return <div className="se-content"><SkStatus kind="error" h={280} /></div>
  if (st === 'empty') return <div className="se-content"><SkStatus kind="empty" title={t('member.sessions.noItems')} hint="" h={280} /></div>

  const all = q.data ?? []
  const rows = all.filter((r) => tab === 'all' || (tab === 'active' ? r.status === 'current' : r.status === 'removed'))

  return (
    <>
      <div className="se-tabs" role="tablist">
        {TABS.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`se-tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{t(`member.sessions.tab.${k}`)}</button>
        ))}
      </div>
      <div className="se-content">
        {rows.length === 0 ? (
          <SkStatus kind="empty" title={t('member.sessions.noItems')} hint="" h={280} />
        ) : (
          <>
            {rows.map((r) => (
              <div key={r.id} className="member_sessionslist__se-row">
                <IconTile name="devices" size={40} radius={8} />
                <div className="se-txt">
                  <strong>{r.browser}</strong>
                  <span>{ago(r.minutesAgo)} · {r.location} · {r.ip}</span>
                </div>
                <span className={`se-st ${r.status}`}>{t(`member.sessions.status.${r.status}`)}</span>
              </div>
            ))}
            <p className="se-end">{t('member.sessions.end')}</p>
          </>
        )}
      </div>

      <MemberInputStyles />
      <style jsx>{`
        .se-tabs { display: flex; height: 41px; border-bottom: 1px solid #2c2f36; }
        .se-tab { flex: 1; border: 0; background: transparent; color: #8d8d92; font-size: 14px; cursor: pointer; }
        .se-tab.on { color: var(--vp-primary); box-shadow: inset 0 -2px 0 var(--vp-primary); }
        /* 版式按 docs/research/vp/MEMBER-GEOMETRY.md（/sessions）：筛选条 41，首行 y111（距筛选条 15），行 343×59 无间距，状态标签 70×26 */
        .se-content { padding: 15px 16px 0; box-sizing: border-box; display: flex; flex-direction: column; gap: 0; }
        :global(.member_sessionslist__se-row) { display: flex; align-items: center; gap: 12px; padding: 0 0 0 12px; border-radius: 8px; background: transparent; box-sizing: border-box; height: 59px; width: 100%; max-width: 343px; }
        /* 06：状态标签贴行右缘（x289 + 70 = 359）；行右内边距为 0，左内边距保持图标 x28 */
        .se-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
        .se-txt span { color: #8d8d92; font-size: 12px; word-break: break-all; }
        .se-st { flex: none; width: 70px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 13px; background: rgba(255, 255, 255, .06); font-size: 12px; color: #8d8d92; }
        .se-st.current { color: var(--vp-primary); }
        .se-end { margin: 16px 0 0; text-align: center; color: #6b7078; font-size: 12px; }
      `}</style>
    </>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
