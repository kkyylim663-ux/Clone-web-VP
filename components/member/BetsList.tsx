'use client'
// 投注记录（/bets）：标签 Casino / Sports + 日期范围（默认近 30 天，起止不能倒置，跨度 ≤ 31 天）。
// 空态默认（参考站取证）；数据：/api/web/member/bets（mock，?state=data 返回样例）。
// 桌面端左侧子菜单：去向为会员子页（推断，同个人中心入口）。
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import SkImg from '@/components/ui/SkImg'
import IconTile from '@/components/ui/IconTile'
import { EMPTY } from '@/lib/assets'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { useAgo, useMemberQuery, useMemberState, MemberFrame, MemberInputStyles } from './shared'

interface Row { id: string, game: string, amount: string, result: string, currency: string, minutesAgo: number }
type Tab = 'casino' | 'sports'
const DAY = 86400000
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
// YYYY-MM-DD → MM/DD/YYYY（纯字符串，不做时区换算）
const fmt = (s: string) => { const [y, m, d] = s.split('-'); return `${m}/${d}/${y}` }

export default function BetsList() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.bets.title')}><BetsBody /></MemberFrame>
}

function BetsBody() {
  const { t } = useLanguage()
  const ago = useAgo()
  const { st, member } = useMemberState()
  const [tab, setTab] = useState<Tab>('casino')
  const [range, setRange] = useState(() => { const now = new Date(); return { from: iso(new Date(now.getTime() - 30 * DAY)), to: iso(now) } })
  const [open, setOpen] = useState(false)
  const badRange = Date.parse(range.from) > Date.parse(range.to) || Date.parse(range.to) - Date.parse(range.from) > 31 * DAY
  const q = useMemberQuery<Row[]>('/api/web/member/bets', { tab, from: range.from, to: range.to, demo: st }, member && !badRange && st !== 'loading' && st !== 'error' && st !== 'empty')

  const body = (() => {
    if (!member) return null
    // error 时查询被禁用（data 恒为 null），必须排除，否则会误进加载分支
    if (st === 'loading' || (st !== 'error' && q.data === null && !q.failed && st !== 'empty' && !badRange)) return <SkBox h={120} state={t('member.common.loading')} className="member_betslist__bt-skel" />
    if (st === 'error' || q.failed) return <SkStatus kind="error" h={200} />
    if (st === 'empty' || !q.data?.length) return <div className="member_betslist__bt-empty"><SkImg src={EMPTY[0]} className="member_betslist__bt-img" w={102} h={102} radius={8} label="" /><SkStatus kind="empty" title={t('member.common.emptyTitle')} hint="" h={160} className="member_betslist__bt-empty-st" /></div>
    return (
      <div className="member_betslist__bt-list">
        {q.data.map((r) => (
          <div key={r.id} className="member_betslist__bt-row">
            <IconTile name="casino" size={36} radius={8} solid />
            <div className="member_betslist__bt-txt"><strong>{r.game}</strong><span>{r.amount} → {r.result} {r.currency} · {ago(r.minutesAgo)}</span></div>
          </div>
        ))}
      </div>
    )
  })()

  return (
    <div className="bt">
      <section className="bt-sec">
        <div className="bt-tabs" role="tablist">
          {(['casino', 'sports'] as Tab[]).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : undefined} onClick={() => setTab(k)}>{t(`member.bets.tab.${k}`)}</button>
          ))}
        </div>
        <div className="bt-date">
          <button type="button" className="bt-range" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{fmt(range.from)} - {fmt(range.to)}</button>
          {open && (
            <div className="bt-pick">
              <label><span>{t('member.bets.from')}</span><input type="date" value={range.from} max={range.to} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} /></label>
              <label><span>{t('member.bets.to')}</span><input type="date" value={range.to} min={range.from} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} /></label>
            </div>
          )}
        </div>
        {badRange && <p className="bt-err" role="alert">{t('member.err.dateRange')}</p>}
        {!member ? <div className="bt-gate"><p>{t('member.frame.gate')}</p></div> : body}
      </section>
      <MemberInputStyles />

      <style jsx>{`
        .bt { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; padding: 0 8px 24px; box-sizing: border-box; }
        .bt-tabs { display: flex; height: 40px; padding-top: 0; box-sizing: border-box; }
        .bt-tabs button { flex: 1; border: 0; background: transparent; color: #8d8d92; font-weight: 500; font-size: 14px; cursor: pointer; }
        .bt-tabs button.on { color: #fff; box-shadow: inset 0 -2px 0 var(--vp-primary, #5effac); }
        /* 版式按 MEMBER-GEOMETRY.md（/bets）：日期条 y95 高 52，范围文字 14/400 距左 8（y111）；点击后在条下方展开两个日期框 */
        .bt-date { position: relative; display: flex; align-items: center; height: 52px; box-sizing: border-box; }
        .bt-range { flex: 1; height: 100%; padding: 0; border: 0; background: transparent; color: #fff; font-size: 14px; font-weight: 400; text-align: left; cursor: pointer; }
        .bt-pick { position: absolute; left: 8px; right: 8px; top: 52px; z-index: 2; display: flex; gap: 8px; padding: 8px; box-sizing: border-box; border-radius: 8px; background: #26262d; }
        .bt-pick label { flex: 1; display: flex; flex-direction: column; gap: 4px; color: #8d8d92; font-size: 12px; }
        .bt-pick input { height: 36px; box-sizing: border-box; padding: 0 8px; border: 0; border-radius: 8px; background: #2a2d33; color: #fff; font-size: 13px; }
        .bt-err { margin: 8px 0 0; color: #f87171; font-size: 12px; }
        :global(.member_betslist__bt-skel) { width: 100%; margin-top: 12px; }
        :global(.member_betslist__bt-empty) { display: flex; flex-direction: column; align-items: center; }
        /* 空态：不套底色卡片；标题 17/500。推导：图 102 上距 40 → 图底 289；标题顶 393 → 状态块 margin-top 104；隐藏 SkStatus 图标与空 small（不占高） */
        :global(.member_betslist__bt-empty-st) { margin-top: 104px; background: transparent !important; border: 0 !important; padding: 0 !important; justify-content: flex-start !important; }
        :global(.member_betslist__bt-empty-st .ico), :global(.member_betslist__bt-empty-st small) { display: none !important; }
        :global(.member_betslist__bt-empty-st strong) { font-size: 17px !important; font-weight: 500 !important; }
        :global(.member_betslist__bt-img) { margin: 40px auto 0; }
        :global(.member_betslist__bt-list) { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        :global(.member_betslist__bt-row) { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; background: #22252b; }
        :global(.member_betslist__bt-txt) { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
        :global(.member_betslist__bt-txt span) { color: #8d8d92; font-size: 12px; }
        .bt-gate p { margin: 0; text-align: center; color: #8d8d92; padding: 40px 0; }
        @media (min-width: 768px) {
          .bt { background: transparent; padding: 0; }
          .bt-sec { min-height: 594px; padding: 24px 30px; box-sizing: border-box; border-radius: 28px; background: #262932; border: 1px solid #3a3d4a; }
          .bt-tabs { height: 32px; padding: 0; gap: 8px; }
          .bt-tabs button { flex: 0 0 75px; height: 32px; border-radius: 8px; background: #14151b; border: 1px solid #3f4351; color: #d5d9e4; }
          .bt-tabs button.on { box-shadow: inset 0 0 0 1px var(--vp-primary, #5effac); }
          :global(.member_betslist__bt-empty) { padding-top: 137px; }
          :global(.member_betslist__bt-img) { display: none; }
        }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
