'use client'
// 通知（/notifications，需登录）：列表（多语言内容 translations 按当前语言挑，缺则回退 zh）；未读点；点击标已读。
// 参考站账号为空（默认空态）；数据：/api/web/member/notifications（mock，?state=data 返回样例）。
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { pickLang, type Translations } from '@/lib/pickLang'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { useMemberQuery, useMemberState } from '@/components/member/shared'
import GuestGate from '@/components/skeleton/money/GuestGate'
import { MemberInputStyles } from './shared'

interface Row { id: string, time: string, unread: boolean, translations: Translations<{ title: string, body: string }> }

export default function NotificationsList() {
  const { t, lang } = useLanguage()
  const { st, member } = useMemberState()
  const [read, setRead] = useState<string[]>([])
  const q = useMemberQuery<Row[]>('/api/web/member/notifications', { demo: st }, member && st !== 'loading' && st !== 'error' && st !== 'empty')

  const shell = (node: React.ReactNode) => (
    <div className="nt">
      <header className="nt-nav"><span className="nt-title">{t('member.notify.title')}</span></header>
      <div className="nt-main">{node}</div>
      <MemberInputStyles />
      <style jsx>{`
        .nt { min-height: 100%; background: #1a1a21; color: #fff; font-size: 14px; }
        .nt-nav { height: 55px; display: flex; align-items: center; padding: 0 12px; box-sizing: border-box; }
        .nt-title { font-size: 16px; font-weight: 600; }
        .nt-main { padding: 8px 8px 24px; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; }
        .nt-row { display: flex; align-items: center; gap: 10px; width: 100%; height: 72px; padding: 0 12px; box-sizing: border-box; border: 0; border-radius: 8px; background: #22252b; color: #fff; text-align: left; cursor: pointer; }
        .nt-row.unread { background: #242a33; }
        .nt-dot { width: 8px; height: 8px; margin-top: 6px; flex: none; border-radius: 50%; background: transparent; }
        .nt-row.unread .nt-dot { background: var(--vp-primary, var(--vp-primary)); }
        .nt-txt { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .nt-body { color: #8d8d92; font-size: 12px; }
        .nt-time { flex: none; color: #6b7078; font-size: 12px; }
        @media (min-width: 768px) {
          .nt { background: transparent; }
          .nt-nav { display: none; }
          .nt-main { padding: 20px 0 32px; }
        }
      `}</style>
    </div>
  )

  if (!member) return shell(<GuestGate />)
  if (st === 'loading' || (q.data === null && !q.failed && st !== 'empty')) return shell([0, 1, 2, 3].map((n) => <SkBox key={n} state={t('member.common.loading')} h={72} />))
  if (st === 'error' || q.failed) return shell(<SkStatus kind="error" h={200} />)
  if (st === 'empty' || !q.data?.length) return shell(<SkStatus kind="empty" title={t('member.notify.noItems')} hint="" h={200} />)

  return shell(q.data.map((n) => {
    const isUnread = n.unread && !read.includes(n.id)
    const c = pickLang(n.translations, lang)
    return (
      <button key={n.id} type="button" className={`nt-row${isUnread ? ' unread' : ''}`} onClick={() => setRead((r) => [...r, n.id])}>
        <span className="nt-dot" />
        <span className="nt-txt"><strong>{c?.title ?? ''}</strong><span className="nt-body">{c?.body ?? ''}</span></span>
        <span className="nt-time">{n.time}</span>
      </button>
    )
  }))
}
