'use client'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { ApiError } from '@/lib/api'
import { PASSWORD_MIN, isEmail, isPhone } from '@/lib/mock/auth'

// 登录 / 注册表单：网页弹窗（variant=modal）与手机整页（variant=page）共用一份结构与逻辑。
// state（?state= 演示参数）：email 初始切到邮箱 | codeOpen 初始展开区号 | error 初始显示一条校验错误 | loading 初始为提交中
// 去向：登录⇄注册 tab → /login、/register；忘记密码 → /forgot；条款/隐私 → /terms-and-conditions、/privacy-policy。
//       来源：实测（clicks-public /login：Forgot password 跳 /forgot；/user Register 跳 /register）+ 文档（handlers-static §5）。
// 提交：登录 → useAuth().login；注册 → useAuth().register；成功 → useAuth().goAfterLogin()（回跳 originRouteName / redirect / 首页，replace）。
// 第三方登录占位：不跳转。来源：骨架（T 接后端）。

type Kind = 'phone' | 'email'
type Errs = Partial<Record<'account' | 'password' | 'agree', string>>
const CC_LIST = ['+60', '+86', '+65', '+62', '+1']
const API_ERR: Record<number, string> = { 1001: 'auth.err.1001', 1002: 'auth.err.1002', 1003: 'auth.err.1003', 1004: 'auth.err.1004' }

export default function AuthFormPanel({ mode, variant, state }: { mode: 'login' | 'register', variant: 'modal' | 'page', state: string }) {
  const { t } = useLanguage()
  const { login, register, goAfterLogin } = useAuth()
  const isLogin = mode === 'login'

  const [kind, setKind] = useState<Kind>(state === 'email' ? 'email' : 'phone')
  const [cc, setCc] = useState('+60')
  const [ccOpen, setCcOpen] = useState(state === 'codeOpen')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [referral, setReferral] = useState('')
  const [refOpen, setRefOpen] = useState(false)
  const [agree, setAgree] = useState(false)
  const [errs, setErrs] = useState<Errs>(state === 'error' ? { account: 'auth.err.account' } : {})
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy] = useState(false)
  const loading = busy || state === 'loading'

  // 登录⇄注册切换时（组件不卸载）：清掉校验提示与同意勾选，避免带到另一个表单
  useEffect(() => { setErrs({}); setFormErr(''); setAgree(false); setCcOpen(false) }, [mode])

  const switchKind = (k: Kind) => { setKind(k); setAccount(''); setErrs({}); setCcOpen(false) }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    const acc = account.trim()
    const next: Errs = {}
    if (kind === 'phone' ? !isPhone(acc) : !isEmail(acc)) next.account = kind === 'phone' ? 'auth.err.phone' : 'auth.err.email'
    if (password.length < PASSWORD_MIN) next.password = 'auth.err.password'
    if (!isLogin && !agree) next.agree = 'auth.err.agree'
    setErrs(next)
    setFormErr('')
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      const full = kind === 'phone' ? `${cc}${acc}` : acc
      if (isLogin) await login(full, password)
      else await register(full, password, agree)
      goAfterLogin()
    } catch (err) {
      setBusy(false)
      setFormErr(API_ERR[err instanceof ApiError ? err.code : 0] ?? 'auth.err.generic')
    }
  }

  return (
    <form className={`afp ${variant} ${mode}`} onSubmit={onSubmit} noValidate>
      <div className="sw">
        {/* 登录⇄注册 tab 用 replace（参考站 intercept.md：/login、/register 标签 replace） */}
        <Link className={`auth_authformpanel__sw-item${isLogin ? ' on' : ''}`} href="/login" replace>{t('auth.tab.login')}</Link>
        <Link className={`auth_authformpanel__sw-item${isLogin ? '' : ' on'}`} href="/register" replace>{t('auth.tab.register')}</Link>
        <span className="chip"><b>+MYR 2.00</b> {t('auth.chip')}</span>
      </div>

      <div key={mode} className="swap">
      {/* 手机/邮箱切换只在登录页（参考站注册页无此切换，桌面 1280 实测）；注册页手机整页用标题行代替 */}
      {isLogin ? (
        <div className="seg" role="group">
          <button type="button" className={`seg-item${kind === 'phone' ? ' on' : ''}`} aria-pressed={kind === 'phone'} onClick={() => switchKind('phone')}>{t('auth.seg.phone')}</button>
          <button type="button" className={`seg-item${kind === 'email' ? ' on' : ''}`} aria-pressed={kind === 'email'} onClick={() => switchKind('email')}>{t('auth.seg.email')}</button>
        </div>
      ) : variant === 'page' ? (
        <div className="heading">{kind === 'email' ? t('auth.field.email') : t('auth.field.phone')}</div>
      ) : null}

      <div className="fields">
        <div className={`fld${errs.account ? ' err' : ''}`}>
          {kind === 'phone' ? (
            <>
              <button type="button" className="cc" aria-haspopup="listbox" aria-expanded={ccOpen} onClick={() => setCcOpen((o) => !o)}>{cc}<svg className="cc-arr" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
              <span className="bar" />
              <input className="inp" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={t('auth.field.phone')} aria-label={t('auth.field.phone')}
                value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ''))} aria-invalid={!!errs.account} />
            </>
          ) : (
            <input className="inp" type="email" autoComplete="email" placeholder={t('auth.field.email')} aria-label={t('auth.field.email')}
              value={account} onChange={(e) => setAccount(e.target.value)} aria-invalid={!!errs.account} />
          )}
          {errs.account ? <p className="err-msg">{t(errs.account)}</p> : null}
          {ccOpen && kind === 'phone' ? (
            <div className="cc-list" role="listbox" aria-label={t('auth.cc.label')}>
              {CC_LIST.map((c) => (
                <button key={c} type="button" role="option" aria-selected={c === cc} className={`cc-item${c === cc ? ' on' : ''}`}
                  onClick={() => { setCc(c); setCcOpen(false) }}>{c}</button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={`fld${errs.password ? ' err' : ''}`}>
          <input className="inp" type={showPw ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder={isLogin ? t('auth.field.password') : t('auth.field.newPassword')} aria-label={isLogin ? t('auth.field.password') : t('auth.field.newPassword')}
            value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errs.password} />
          <button type="button" className="eye" aria-label={showPw ? t('auth.hidePwd') : t('auth.showPwd')} onClick={() => setShowPw((v) => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12Z" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.800" />{showPw ? null : <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" />}</svg>
          </button>
          {errs.password ? <p className="err-msg">{t(errs.password)}</p> : null}
        </div>

        {isLogin ? (
          <Link className="auth_authformpanel__fgt" href="/forgot" replace>{t('auth.forgotLink')}</Link>
        ) : (
          // 推荐码：点击一行展开 / 收起输入框（箭头向下 = 收起，向上 = 展开）
          <>
            <button type="button" className="ref-row" aria-expanded={refOpen} onClick={() => setRefOpen((o) => !o)}>
              <span>{t('auth.field.referral')}</span>
              <svg className={refOpen ? 'up' : ''} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {refOpen ? (
              <label className="fld ref-fld">
                <input className="inp" autoComplete="off" placeholder={t('auth.field.referralPh')} aria-label={t('auth.field.referralPh')}
                  value={referral} onChange={(e) => setReferral(e.target.value)} />
              </label>
            ) : null}
          </>
        )}
      </div>

      <div className="cta-wrap">
        <button className="cta" type="submit" disabled={loading}>
          {loading ? <span className="spin" /> : null}
          <span className="btn-slide-text">{loading ? t('auth.submit.loading') : isLogin ? t('auth.submit.login') : t('auth.submit.register')}</span>
        </button>
        {!isLogin ? <span className="cta-chip"><b>+MYR 2.00</b> {t('auth.chip')}</span> : null}
      </div>
      {formErr ? <p className="form-err" role="alert">{t(formErr)}</p> : null}

      {/* 注册：同意条款行（真复选框）。第一个链接 → /terms-and-conditions，第二个 → /privacy-policy。来源：推断（任务书指定；参考站未实测） */}
      {!isLogin ? (
        <div className="agree-wrap">
          <label className="agree">
            <input className="cb" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={!!errs.agree} />
            <span className="ln">
              {t('auth.agree.pre')} <Link className="auth_authformpanel__lk" href="/terms-and-conditions">{t('auth.agree.terms')}</Link> {t('auth.agree.and')} <Link className="auth_authformpanel__lk" href="/privacy-policy">{t('auth.agree.privacy')}</Link>
            </span>
          </label>
          {errs.agree ? <p className="agree-err">{t(errs.agree)}</p> : null}
        </div>
      ) : null}

      <div className="or"><span>{t('auth.or')}</span></div>

      {/* 第三方登录占位（T 接后端），点击不跳转 */}
      <div className="soc">
        <span className="sbtn"><svg width="26" height="26" viewBox="0 0 24 24" aria-label="Telegram"><circle cx="12" cy="12" r="12" fill="#229ED9" /><path fill="#fff" d="M5.4 11.9l11.1-4.3c.5-.2 1 .1.8.9l-1.9 8.9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.4-.1l-6.7 4.2-2.9-.9c-.6-.2-.6-.6.1-.9z" /></svg></span>
        <span className="sbtn"><svg width="26" height="26" viewBox="0 0 48 48" aria-label="Google"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-17.2z" /><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.9 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg></span>
      </div>

      </div>

      <style jsx>{`
        .swap { animation: swap-in .22s ease-out both; }
        @keyframes swap-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .afp { position: relative; z-index: 2; box-sizing: border-box; width: 100%; padding: 0 14px; color: #e6e7ea; font-size: 14px; }
        .afp.modal { padding-top: 58px; }
        .afp.modal .sw { height: 47px; }
        .afp.modal .seg { height: 36px; margin-top: 17px; }
        .afp.modal :global(.auth_authformpanel__sw-item) { height: 47px; }
        .afp.page { padding-top: 74px; }

        /* 登录 / 注册切换 */
        .sw { position: relative; display: flex; margin: 0 -14px; height: 46px; }
        .afp.page .sw { height: 50px; }
        :global(.auth_authformpanel__sw-item) { flex: 1; display: flex; align-items: center; justify-content: center; color: #8d9099; font-size: 16px; font-weight: 600; text-decoration: none; }
        :global(.auth_authformpanel__sw-item) { transition: color .2s ease, background .2s ease; }
        :global(.auth_authformpanel__sw-item).on { color: #fff; background: linear-gradient(180deg, #34353c 0%, #26272d 100%); border-radius: 18px 18px 0 0; }
        /* 折页式标签：当前项的内侧边做斜切（参考站同款），左项右斜、右项左斜 */
        :global(.auth_authformpanel__sw-item).on:first-child { clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 100%, 0 100%); }
        :global(.auth_authformpanel__sw-item).on:nth-child(2) { clip-path: polygon(22px 0, 100% 0, 100% 100%, 0 100%); }
        .chip { position: absolute; right: 12px; top: -12px; z-index: 3; padding: 2px 8px; border-radius: 6px; background: #f5a24b; color: #2a1d08; font-size: 12px; font-weight: 600; pointer-events: none; }

        /* 手机 / 邮箱切换（登录、注册共用）。桌面与手机同一结构 */
        .seg { display: flex; height: 40px; margin-top: 18px; padding: 4px; box-sizing: border-box; border-radius: 12px; background: rgba(0, 0, 0, 0.28); }
        .afp.page .seg { height: 44px; margin: 16px -2px 0; }
        .seg-item { flex: 1; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: 9px; background: transparent; color: #8d9099; font: inherit; font-weight: 600; cursor: pointer; transition: background .2s ease, color .2s ease, border-color .2s ease; }
        .seg-item.on { background: linear-gradient(180deg, #4d4e55, #3b3c42); border-color: rgba(255, 255, 255, 0.14); color: #fff; }

        /* 注册（手机整页）标题行：参考站 heading 高 20、上边距 20 */
        .heading { height: 20px; margin-top: 20px; padding-left: 8px; color: #fff; font-size: 16px; font-weight: 600; line-height: 20px; }

        /* 输入区 */
        .fields { display: flex; flex-direction: column; }
        .modal.login .fields { margin-top: 20px; gap: 17px; }
        .modal.register .fields { margin-top: 17px; gap: 14px; }
        .afp.page.login .fields { margin-top: 24px; gap: 16px; }
        .afp.page.register .fields { margin-top: 34px; gap: 16px; }
        .fld { position: relative; display: flex; align-items: center; gap: 8px; box-sizing: border-box; height: 52px; padding: 0 16px; border: 1px solid #2a2b31; border-radius: 16px; background: #16171c; color: #8d9099; }
        .afp.page .fld { height: 60px; }
        .fld.err { border-color: #e5484d; }
        .ref-row { display: flex; align-items: center; gap: 8px; width: 100%; height: 16px; padding: 0; border: 0; background: none; color: #9a9da6; font: inherit; font-size: 14px; text-align: left; cursor: pointer; }
        .ref-row svg { transition: transform .2s ease; }
        .ref-row svg.up { transform: rotate(180deg); }
        .ref-fld { margin-top: 16px; }
        .inp { flex: 1; min-width: 0; width: 100%; height: 100%; padding: 0; border: 0; outline: none; background: transparent; color: #fff; font: inherit; font-size: 16px; }
        .inp::placeholder { color: #6b6e77; }
        .cc { display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; color: #e6e7ea; white-space: nowrap; font: inherit; cursor: pointer; }
        .bar { width: 1px; height: 16px; background: #3a3b41; }
        .eye { position: relative; flex: none; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: 0; background: none; color: #6b6e77; cursor: pointer; }
        .err-msg { position: absolute; left: 2px; top: 100%; margin: 2px 0 0; color: #f87171; font-size: 12px; white-space: nowrap; }
        .cc-list { position: absolute; left: 0; top: 100%; z-index: 5; display: flex; flex-direction: column; width: 160px; margin-top: 4px; padding: 6px 0; border-radius: 8px; background: #23242b; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45); }
        .cc-item { padding: 6px 12px; border: 0; background: none; color: #c4c8d0; font-size: 13px; text-align: left; cursor: pointer; }
        .cc-item.on { color: var(--vp-primary); }
        .modal.login :global(.auth_authformpanel__fgt) { margin-top: -7px; }
        :global(.auth_authformpanel__fgt) { display: block; height: 18px; line-height: 18px; text-align: right; color: #8d9099; font-size: 14px; text-decoration: none; }
        .afp.page :global(.auth_authformpanel__fgt) { height: 16px; line-height: 16px; font-size: 13px; margin-top: 0; }

        /* 主按钮。文字 .btn-slide-text：hover 过渡 var(--mo-btn-slide)（实测 interactions.md 桌面 c） */
        .cta-wrap { position: relative; }
        .cta { box-shadow: var(--vp-glow); display: flex; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box; width: 100%; height: 56px; margin-top: 25px; border: 0; border-radius: 30px; background: var(--vp-grad-btn); color: var(--vp-on-btn); font-size: 16px; font-weight: 500; cursor: pointer; }
        .afp.page .cta { height: 60px; margin-top: 24px; font-size: 18px; }
        .modal.register .cta { margin-top: 27px; }
        .afp.page.register .cta { margin-top: 27px; }
        .cta:disabled { opacity: 0.6; cursor: default; }
        .btn-slide-text { display: inline-block; transition: transform var(--mo-btn-slide); }
        .spin { width: 14px; height: 14px; border: 2px solid rgba(0, 0, 0, 0.3); border-top-color: #111; border-radius: 50%; }
        .cta-chip { position: absolute; right: 12px; top: -10px; padding: 1px 8px; border-radius: 6px; background: #f5a24b; color: #2a1d08; font-size: 12px; font-weight: 600; }
        .form-err { margin: 10px 0 0; color: #f87171; font-size: 13px; text-align: center; }

        /* 注册：同意条款行 */
        .agree-wrap { margin-top: 13px; }
        .agree { display: flex; align-items: flex-start; gap: 8px; color: #9a9da6; font-size: 12px; line-height: 1.5; }
        .cb { flex: none; width: 14px; height: 14px; margin: 2px 0 0; accent-color: #2fbf71; }
        .ln { flex: 1; }
        :global(.auth_authformpanel__lk) { color: var(--vp-primary); text-decoration: none; }
        .agree-err { margin: 4px 0 0; color: #f87171; font-size: 12px; }

        /* 分隔与第三方 */
        .or { display: flex; align-items: center; gap: 10px; height: 16px; margin-top: 19px; color: #8d9099; font-size: 12px; }
        .or::before, .or::after { content: ''; flex: 1; height: 1px; background: #3a3b41; }
        .modal.register .or { margin-top: 18px; }
        .afp.page .or { margin-top: 28px; }
        .soc { display: flex; gap: 14px; height: 56px; margin-top: 19px; }
        .afp.page .soc { height: 60px; margin-top: 20px; }
        .sbtn { flex: 1; display: flex; align-items: center; justify-content: center; border: 1px solid #3a3b41; border-radius: 14px; background: linear-gradient(180deg, #34353b, #25262b); cursor: pointer; transition: filter .2s ease; }
        .sbtn:hover { filter: brightness(1.15); }
      `}</style>
    </form>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
