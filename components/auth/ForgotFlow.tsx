'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import { ApiError, post } from '@/lib/api'
import { PASSWORD_MIN, isAccount } from '@/lib/mock/auth'
import AuthModalShell from './AuthModalShell'
import HomeBehind from './HomeBehind'
import PageTopBar from './PageTopBar'

// 忘记密码 3 步（mock）：1 填账号 → 发送验证码；2 填 6 位验证码 → 提交；3 设新密码 → 完成后 replace 到 /login。
// 来源：文档（handlers-static §0.5、§3）+ 需求（任务书：忘记密码 3 步 mock）。
// 去向：‹ 在第 2、3 步回上一步，第 1 步及遮罩 = useGate().back；验证码 59 秒后可重发。
// 演示验证码：123456（见 lib/mock/auth.ts）。

type Step = 1 | 2 | 3
const RESEND_SEC = 59
const ERR_KEY: Record<number, string> = { 1002: 'auth.err.1002', 1004: 'auth.err.1004' }

// 两种版式的绝对定位（与参考站骨架一致）。手机：文字 85、输入 148、按钮 219；网页弹窗 373×264：文字 72、输入 128、按钮 200。
// 第 3 步两个输入框：手机 148/212、按钮 276；网页 72/128、按钮 192。
function layoutFor(variant: 'page' | 'modal', step: Step) {
  if (variant === 'page') return { text: 85, f1: 148, f2: 212, btn: step === 3 ? 276 : 219, fl: 14, fw: 347, fh: 48, bh: 44, br: 999 }
  return { text: 72, f1: step === 3 ? 72 : 128, f2: 128, btn: step === 3 ? 192 : 200, fl: 16, fw: 341, fh: 48, bh: 48, br: 24 }
}

export default function ForgotFlow({ variant }: { variant: 'page' | 'modal' }) {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const { back } = useGate()
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [account, setAccount] = useState('')
  const [sent, setSent] = useState('')
  const [code, setCode] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (left <= 0) return
    const id = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [left])

  const goStep = (n: Step) => { setErr(''); setStep(n) }
  const onBack = () => (step > 1 ? goStep((step - 1) as Step) : back())

  // 统一的提交壳：忙碌态 + 接口错误映射（1002/1004 → 文案，其余 → 网络错误）
  const run = async (fn: () => Promise<void>) => {
    setErr(''); setBusy(true)
    try { await fn() } catch (e) { setErr(ERR_KEY[e instanceof ApiError ? e.code : 0] ?? 'auth.err.generic') } finally { setBusy(false) }
  }

  const sendCode = () => {
    const a = account.trim()
    if (!isAccount(a)) { setErr('auth.err.account'); return }
    run(async () => {
      await post('/api/web/auth/forgot/send', { account: a })
      setSent(a); setCode(''); setLeft(RESEND_SEC); goStep(2)
    })
  }
  const verifyCode = () => {
    if (code.length !== 6) { setErr('auth.err.code'); return }
    run(async () => {
      await post('/api/web/auth/forgot/verify', { account: sent, code })
      goStep(3)
    })
  }
  const resend = () => {
    if (left > 0) return
    run(async () => {
      await post('/api/web/auth/forgot/send', { account: sent })
      setLeft(RESEND_SEC)
    })
  }
  const reset = () => {
    if (pw.length < PASSWORD_MIN) { setErr('auth.err.password'); return }
    if (pw !== pw2) { setErr('auth.err.confirm'); return }
    run(async () => {
      await post('/api/web/auth/forgot/reset', { account: sent, code, password: pw })
      showToast(t('auth.fg.done'))
      router.replace('/login')
    })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (step === 1) sendCode()
    else if (step === 2) verifyCode()
    else reset()
  }

  const P = layoutFor(variant, step)
  const titleKey = `auth.fg.title${step}`
  const btnText = busy ? t('auth.submit.loading') : step === 1 ? t('auth.fg.send') : step === 2 ? t('auth.fg.verify') : t('auth.fg.reset')
  const btnDisabled = busy || (step === 2 && code.length !== 6)

  const body = (
    <form className={`fg-body ${variant}`} onSubmit={onSubmit} noValidate>
      {step === 1 ? (
        <>
          <p className="txt" style={{ top: P.text }}>{t('auth.fg.desc1')}</p>
          <div className="fld" style={{ top: P.f1, left: P.fl, width: P.fw, height: P.fh }}>
            <input className="inp" autoComplete="username" placeholder={t('auth.field.account')} aria-label={t('auth.field.account')}
              value={account} onChange={(e) => setAccount(e.target.value)} />
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <p className="txt" style={{ top: P.text }}>
            {t('auth.fg.desc2', { account: sent })}
            <span className="resend">
              {left > 0 ? t('auth.fg.resendIn', { s: left }) : <button type="button" className="link" onClick={resend}>{t('auth.fg.resend')}</button>}
            </span>
          </p>
          <div className="fld codes" style={{ top: P.f1, left: P.fl, width: P.fw, height: P.fh }}>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="code">{code[i] ?? ''}</span>
            ))}
            <input className="cover" inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label={t('auth.err.code')}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <div className="fld" style={{ top: P.f1, left: P.fl, width: P.fw, height: P.fh }}>
            <input className="inp" type="password" autoComplete="new-password" placeholder={t('auth.field.newPassword')} aria-label={t('auth.field.newPassword')}
              value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <div className="fld" style={{ top: P.f2, left: P.fl, width: P.fw, height: P.fh }}>
            <input className="inp" type="password" autoComplete="new-password" placeholder={t('auth.field.confirm')} aria-label={t('auth.field.confirm')}
              value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
        </>
      ) : null}

      <button type="submit" className="btn" disabled={btnDisabled}
        style={{ top: P.btn, left: P.fl, width: P.fw, height: P.bh, borderRadius: P.br }}>{btnText}</button>
      {err ? <p className="err" role="alert" style={{ top: P.btn + P.bh + 8, left: P.fl, width: P.fw }}>{t(err)}</p> : null}

      <style jsx>{`
        .fg-body { position: absolute; inset: 0; }
        /* 网页弹窗：说明文字更粗更白（参考站实测） */
        .fg-body.modal .txt { color: #fff; font-weight: 600; }
        .txt, .fld, .btn, .err { max-width: calc(100% - ${P.fl * 2}px); }
        .txt { position: absolute; left: ${P.fl}px; width: ${P.fw}px; margin: 0; color: #c4c8d0; font-size: 14px; line-height: 20px; }
        .resend { display: block; margin-top: 2px; }
        .link { padding: 0; border: 0; background: none; color: var(--vp-primary); font: inherit; cursor: pointer; }
        .fld { position: absolute; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid #2a2b31; border-radius: 8px; background: #1a1a21; }
        .inp { flex: 1; min-width: 0; width: 100%; padding: 0; border: 0; outline: none; background: transparent; color: #fff; font: inherit; font-size: 14px; }
        .codes { position: absolute; }
        .code { flex: 1; max-width: 40px; height: 36px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #26272d; border: 1px solid #3a3b41; color: #fff; font-size: 18px; }
        .cover { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; border: 0; outline: none; }
        .btn { box-shadow: var(--vp-glow); position: absolute; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 0; background: var(--vp-grad-btn); color: #15171c; font-size: 16px; font-weight: 500; cursor: pointer; }
        .btn:disabled { opacity: 0.6; cursor: default; }
        .err { position: absolute; margin: 0; color: #f87171; font-size: 12px; }
      `}</style>
    </form>
  )

  if (variant === 'page') {
    return (
      <div className="fg">
        <div className="page">
          <PageTopBar kind="back" title={t(titleKey)} onBack={onBack} />
          {body}
        </div>
        <style jsx>{`
          .page { position: relative; height: 812px; overflow: hidden; background: #1a1a21; }
          @media (min-width: 768px) { .fg { display: none; } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="fg">
      <div className="desk">
        <HomeBehind />
        <AuthModalShell width={375} height={265} radius={16}>
          <div className="d-body">
            <div className="d-head">
              <button type="button" className="d-back" aria-label={t('auth.back')} onClick={onBack}>‹</button>
              <span className="d-ttl">{t(titleKey)}</span>
            </div>
            {/* 右上角圆形占位（参考站客服按钮位，36px；不用原站图标） */}
            <span className="d-ic" />
            {body}
          </div>
        </AuthModalShell>
      </div>
      <style jsx>{`
        .fg { display: none; }
        @media (min-width: 768px) { .fg { display: block; } }
        .d-body { position: relative; width: 100%; height: 100%; }
        .d-head { position: absolute; z-index: 2; left: 16px; right: 16px; top: 13px; height: 40px; display: flex; align-items: center; }
        .d-back { width: 24px; padding: 0; border: 0; background: none; color: #fff; font-size: 24px; line-height: 1; cursor: pointer; }
        .d-ttl { flex: 1; text-align: center; color: #fff; font-size: 19px; font-weight: 500; }
        .d-ic { position: absolute; z-index: 2; right: 18px; top: 15px; width: 36px; height: 36px; border-radius: 50%; background: #2a2b31; }
      `}</style>
    </div>
  )
}
