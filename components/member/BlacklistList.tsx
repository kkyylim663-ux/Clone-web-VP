'use client'
// 黑名单（/blacklist，Ignored Users）：列表 + 移除。参考站取证为空态；数据：/api/web/member/blacklist（默认空，?state=data 为样例）。
// 移除：本地从列表去掉并 toast（接口未对接，T 接后端时改为真调用）。
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import IconTile from '@/components/ui/IconTile'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { MemberFrame, MemberInputStyles, useMemberQuery, useMemberState } from './shared'

interface Row { id: string, name: string }

export default function BlacklistList() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.blacklist.title')}><BlacklistBody /></MemberFrame>
}

function BlacklistBody() {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const { st, member } = useMemberState()
  const q = useMemberQuery<Row[]>('/api/web/member/blacklist', { demo: st }, member && st !== 'loading' && st !== 'error' && st !== 'empty')
  const [gone, setGone] = useState<string[]>([])

  const wrap = (node: React.ReactNode) => <div className="bl-wrap">{node}<MemberInputStyles /><style jsx>{`
    .bl-wrap { padding: 24px 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; }
    :global(.member_blacklistlist__bl-row) { display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 12px; border-radius: 8px; background: #22252b; box-sizing: border-box; }
    .bl-name { font-size: 14px; }
    .bl-btn { margin-left: auto; padding: 4px 12px; border: 1px solid #3a3d44; border-radius: 999px; background: transparent; font-size: 12px; color: #c4c8d0; cursor: pointer; }
  `}</style></div>

  if (st === 'loading' || (q.data === null && !q.failed && st !== 'empty')) return wrap([0, 1, 2].map((n) => <SkBox key={n} h={56} state={t('member.common.loading')} className="member_blacklistlist__bl-row" />))
  if (st === 'error' || q.failed) return wrap(<SkStatus kind="error" h={174} />)
  const rows = (q.data ?? []).filter((r) => !gone.includes(r.id))
  if (st === 'empty' || rows.length === 0) return wrap(<SkStatus kind="empty" title={t('member.blacklist.noItems')} hint="" h={174} />)

  return wrap(rows.map((r) => (
    <div key={r.id} className="member_blacklistlist__bl-row">
      <IconTile name="user" size={40} round />
      <span className="bl-name">{r.name}</span>
      <button type="button" className="bl-btn" onClick={() => { setGone((g) => [...g, r.id]); showToast(t('member.blacklist.removed')) }}>{t('member.blacklist.remove')}</button>
    </div>
  )))
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
