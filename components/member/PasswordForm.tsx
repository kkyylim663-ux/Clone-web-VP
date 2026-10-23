'use client'
// 修改密码（/update-password）：旧密码、新密码、确认新密码。
// 规则（lib/mock/member.ts checkPassword）：新密码 ≥8 位、含字母与数字；确认一致；新旧不能相同。
// 提交 → /api/web/member/password（mock：旧密码 wrong123 返回 1001）；成功后清空表单并 toast。
import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { post, ApiError } from '@/lib/api'
import { checkPassword } from '@/lib/mock/member'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { Field, MemberFrame, MemberInputStyles, inputClass, useErrText, useMemberState } from './shared'

export default function PasswordForm() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.password.title')}><PasswordBody /></MemberFrame>
}

function PasswordBody() {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const errText = useErrText()
  const { st } = useMemberState()
  const [v, setV] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  if (st === 'loading') return <SkBox h={338} state={t('member.common.loading')} className="member_passwordform__up-skel" />
  if (st === 'error') return <SkStatus kind="error" h={240} className="member_passwordform__up-st" />
  if (st === 'empty') return <SkStatus kind="empty" title={t('member.password.noItems')} hint="" h={240} className="member_passwordform__up-st" />

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrs((x) => ({ ...x, [k]: '' })) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const er: Record<string, string> = {}
    if (!v.oldPassword) er.oldPassword = 'required'
    if (!checkPassword(v.newPassword)) er.newPassword = 'password'
    else if (v.newPassword === v.oldPassword) er.newPassword = 'same'
    if (v.confirm !== v.newPassword) er.confirm = 'confirm'
    setErrs(er)
    if (Object.keys(er).length) return
    setBusy(true)
    try {
      await post('/api/web/member/password', { oldPassword: v.oldPassword, newPassword: v.newPassword })
      setV({ oldPassword: '', newPassword: '', confirm: '' })
      showToast(t('member.toast.saved'))
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 0
      setErrs(code === 1001 ? { oldPassword: 'wrongPassword' } : {})
      showToast(errText(code))
    } finally {
      setBusy(false)
    }
  }

  const ft = (c?: string) => (c ? t(`member.err.${c}`) : undefined)
  return (
    <section className="up-card">
      <h2 className="up-h2">{t('member.password.heading')}</h2>
      <form className="up-form" onSubmit={submit} noValidate>
        <Field label={t('member.password.old')} error={ft(errs.oldPassword)}>
          <input className={inputClass(errs.oldPassword)} type="password" autoComplete="current-password" value={v.oldPassword} onChange={set('oldPassword')} />
        </Field>
        <Field label={t('member.password.new')} error={ft(errs.newPassword)}>
          <input className={inputClass(errs.newPassword)} type="password" autoComplete="new-password" value={v.newPassword} onChange={set('newPassword')} />
        </Field>
        <Field label={t('member.password.confirm')} error={ft(errs.confirm)}>
          <input className={inputClass(errs.confirm)} type="password" autoComplete="new-password" value={v.confirm} onChange={set('confirm')} />
        </Field>
        <p className="up-rule">{t('member.password.rule')}</p>
        <button type="submit" className="m-btn up-btn" disabled={busy}>{busy ? t('member.common.saving') : t('member.password.submit')}</button>
      </form>

      <MemberInputStyles />
      <style jsx>{`
        :global(.member_passwordform__up-skel) { width: calc(100% - 16px); margin: 8px; }
        :global(.member_passwordform__up-st) { margin: 8px; }
        .up-card { margin: 0 8px; padding: 16px 8px 8px; box-sizing: border-box; }
        .up-h2 { height: 20px; margin: 0 0 16px; font-size: 16px; font-weight: 500; line-height: 20px; }
        .up-form { display: flex; flex-direction: column; gap: 16px; }
        .up-rule { margin: 0; color: #8d8d92; font-size: 12px; }
        .up-btn { margin-top: 8px; border-radius: 999px; }
      `}</style>
    </section>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
