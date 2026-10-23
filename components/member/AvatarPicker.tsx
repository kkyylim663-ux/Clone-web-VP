'use client'
// 编辑头像（/edit-avater）：默认头像网格（8 个不重复，单选）+ 提交。未选时显示校验错误。
// 头像图片一律占位（SkImg），不放真实图片。去向：提交 → /api/web/member/avatar（mock）。
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { post, ApiError } from '@/lib/api'
import { AVATAR_COUNT } from '@/lib/mock/member'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { MemberFrame, MemberInputStyles, useErrText, useMemberState } from './shared'

const GRID = Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1)

export default function AvatarPicker() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.avatar.title')}><AvatarBody /></MemberFrame>
}

function AvatarBody() {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const errText = useErrText()
  const { st } = useMemberState()
  const { user, setAvatar } = useAuth()
  const [pick, setPick] = useState<number | null>(() => { const n = Number(user?.avatar); return Number.isInteger(n) && n >= 1 && n <= AVATAR_COUNT ? n : null })
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)

  if (st === 'loading') return <><div className="ea-cover" /><div className="ea-grid">{GRID.map((n) => <div key={n} className="ea-skel" />)}</div></>
  if (st === 'empty') return <SkStatus kind="empty" title={t('member.avatar.noItems')} hint={t('member.avatar.noItemsHint')} h={320} />
  if (st === 'error') return <SkStatus kind="error" h={320} />

  const submit = async () => {
    if (busy) return
    if (pick === null) { setErr(true); return }
    setBusy(true)
    try {
      await post('/api/web/member/avatar', { avatarId: pick })
      setAvatar(pick)
      showToast(t('member.toast.saved'))
    } catch (e) {
      showToast(errText(e instanceof ApiError ? e.code : 0))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* 封面 150 高；头像 96 圆，距封面顶 26 */}
      <div className="ea-head">
        <SkImg src="/assets/avatar/cover.webp" h={150} radius={0} />
        <SkImg src={avatarImg(pick || 1)} className="member_avatarpicker__ea-av" w={96} h={96} round label="" />
      </div>
      <div className="ea-row"><strong>{t('member.avatar.heading')}</strong></div>

      {/* 4 列网格，格方形，间距 8，内边距 8 */}
      <div className="ea-grid" role="radiogroup" aria-label={t('member.avatar.heading')}>
        {GRID.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={pick === n} aria-label={`${t('member.avatar.heading')} ${n}`} className={`ea-pick${pick === n ? ' on' : ''}`} onClick={() => { setPick(n); setErr(false) }}>
            <SkImg src={avatarImg(n)} ratio="1 / 1" radius={8} label="" />
          </button>
        ))}
      </div>

      {err && <p className="ea-err" role="alert">{t('member.err.avatar')}</p>}

      {/* 底部操作条：高 75，内边距 16/12，按钮 44 */}
      <div className="ea-bottom">
        <button type="button" className="m-btn ea-btn" disabled={busy} onClick={submit}>{busy ? t('member.common.submitting') : t('member.common.submit')}</button>
      </div>

      <MemberInputStyles />
      <style jsx>{`
        .ea-cover { height: 150px; background: #22252b; }
        .ea-skel { width: 100%; aspect-ratio: 1 / 1; border-radius: 8px; background: #22252b; }
        .ea-head { position: relative; }
        :global(.member_avatarpicker__ea-av) { position: absolute; top: 26px; left: 50%; transform: translateX(-50%); border: 2px solid #1a1a21; box-sizing: border-box; }
        .ea-row { height: 41px; display: flex; align-items: center; padding: 0 12px; font-size: 14px; }
        .ea-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px 8px 0; box-sizing: border-box; }
        .ea-pick { padding: 0; border: 0; border-radius: 8px; background: transparent; cursor: pointer; }
        .ea-pick.on { box-shadow: inset 0 0 0 2px var(--vp-primary); border-radius: 8px; }
        .ea-err { margin: 8px 12px 0; color: #f87171; font-size: 12px; }
        .ea-bottom { height: 75px; padding: 16px 12px; box-sizing: border-box; margin-top: 16px; }
        .ea-btn { border-radius: 50px; }
      `}</style>
    </>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
