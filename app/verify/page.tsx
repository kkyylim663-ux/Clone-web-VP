'use client'
import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { ApiError, post } from '@/lib/api'
import { isEmail } from '@/lib/mock/auth'
import PageTopBar from '@/components/auth/PageTopBar'
import { MemberFrame } from '@/components/member/shared'
import PersonalAccount from '@/components/member/PersonalAccount'
import SkBox from '@/components/ui/SkBox'

// 账户验证页（bare 外壳）。两张卡：邮箱、验证码（高 146 / 162，圆角 8，内边距 16/12）+ 底部操作条（按钮 44）。
// ?state=loading 加载骨架；?state=error 加载失败（重试）。
// 提交 → POST /api/web/auth/verify（mock，验证码 123456）。退出登录 → useAuth().logout()（清 cookie vp_session，回首页）。
// 来源：骨架（两卡尺寸、底部操作条）；退出登录按钮：需求（任务书：verify 页 Logout 接线）。
export default function VerifyPage() {
  return <Suspense fallback={null}><Switch /></Suspense>
}

// 已登录 → 桌面 Personal 账户页（参考站 /verify）；未登录 → 原验证表单
function Switch() {
  const { loggedIn } = useAuth()
  const { t } = useLanguage()
  return loggedIn ? <MemberFrame title={t('member.personal.title')}><PersonalAccount /></MemberFrame> : <Inner />
}

function Inner() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const { showToast } = useLayout()
  const sp = useSearchParams()
  const st = sp.get('state') ?? ''

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [errs, setErrs] = useState<{ email?: string, code?: string }>({})
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const next: { email?: string, code?: string } = {}
    if (!isEmail(email.trim())) next.email = 'auth.err.email'
    if (code.length !== 6) next.code = 'auth.err.code'
    setErrs(next)
    setFormErr('')
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      await post('/api/web/auth/verify', { email: email.trim(), code })
      showToast(t('auth.verify.done'))
    } catch (err) {
      setFormErr(err instanceof ApiError && err.code === 1004 ? 'auth.err.1004' : err instanceof ApiError && err.code === 1002 ? 'auth.err.1002' : 'auth.err.generic')
    } finally {
      setBusy(false)
    }
  }

  const cards = [146, 162]
  return (
    <div className="vf">
      <PageTopBar kind="back" title={t('auth.verify.title')} />

      {st === 'loading' ? (
        <div className="wrap">
          {cards.map((h) => <SkBox key={h} h={h} state={t('auth.verify.loading')} className="verify_pg__skel" />)}
        </div>
      ) : st === 'error' ? (
        <div className="status">
          <p className="st-title">{t('auth.verify.errorTitle')}</p>
          <Link className="verify_pg__retry" href="/verify">{t('auth.verify.retry')}</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <section className="wrap">
            <div className="card" style={{ height: cards[0] }}>
              <span className="ct">{t('auth.verify.emailTitle')}</span>
              <div className={`fld${errs.email ? ' err' : ''}`}>
                <input className="inp" type="email" autoComplete="email" placeholder={t('auth.field.email')} aria-label={t('auth.field.email')}
                  value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} />
              </div>
              {errs.email ? <p className="err">{t(errs.email)}</p> : null}
            </div>
            <div className="card" style={{ height: cards[1] }}>
              <span className="ct">{t('auth.verify.codeTitle')}</span>
              <div className={`fld${errs.code ? ' err' : ''}`}>
                <input className="inp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder={t('auth.err.code')} aria-label={t('auth.verify.codeTitle')}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-invalid={!!errs.code} />
              </div>
              {errs.code ? <p className="err">{t(errs.code)}</p> : null}
            </div>
          </section>
          <div className="bottom">
            <button type="submit" className={`btn${busy ? ' busy' : ''}`} disabled={busy}>{busy ? t('auth.verify.submitting') : t('auth.verify.submit')}</button>
          </div>
          {formErr ? <p className="form-err" role="alert">{t(formErr)}</p> : null}
        </form>
      )}

      <div className="logout">
        <button type="button" className="logout-btn" onClick={logout}>{t('auth.verify.logout')}</button>
      </div>

      <style jsx>{`
        .vf { min-height: 812px; background: #1a1a21; color: #e6e7ea; font-size: 14px; }
        :global(.verify_pg__skel) { width: calc(100% - 16px); margin: 8px; }
        .status { padding: 24px 16px; text-align: center; }
        .st-title { margin: 0 0 12px; color: #fff; }
        :global(.verify_pg__retry) { color: var(--vp-primary); }
        .wrap { display: flex; flex-direction: column; gap: 16px; padding: 16px 8px 0; box-sizing: border-box; }
        .card { display: flex; flex-direction: column; gap: 8px; padding: 16px 12px; border-radius: 8px; background: #22252b; box-sizing: border-box; }
        .ct { color: #c4c8d0; font-size: 14px; font-weight: 600; }
        .fld { display: flex; align-items: center; box-sizing: border-box; height: 44px; padding: 0 12px; border: 1px solid #2a2b31; border-radius: 8px; background: #1a1a21; }
        .fld.err { border-color: #e5484d; }
        .inp { flex: 1; min-width: 0; padding: 0; border: 0; outline: none; background: transparent; color: #fff; font: inherit; font-size: 14px; }
        .err { margin: 0; color: #f87171; font-size: 12px; }
        .bottom { height: 75px; padding: 15px 8px; box-sizing: border-box; margin-top: 16px; }
        .btn { box-shadow: var(--vp-glow); display: flex; align-items: center; justify-content: center; width: 100%; height: 44px; border: 0; border-radius: 999px; background: var(--vp-grad); color: var(--vp-on-primary); font: inherit; font-size: 16px; font-weight: 500; cursor: pointer; }
        .btn.busy, .btn:disabled { opacity: 0.6; cursor: default; }
        .form-err { margin: 0 16px; color: #f87171; font-size: 13px; text-align: center; }
        .logout { padding: 8px 16px 24px; text-align: center; }
        .logout-btn { padding: 8px 12px; border: 0; background: none; color: #8d9099; font: inherit; text-decoration: underline; cursor: pointer; }
      `}</style>
    </div>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
