'use client'
// 实名认证（/kyc）：Level 1 资料表单（校验 + mock 提交）；Level 2 证件上传（锁定到 Level 1 完成；上传框校验：png/jpg/pdf，≤5MB）。
// Level 1 完成状态记在 localStorage（vp_kyc_l1），接口 /api/web/member/kyc/status 默认未完成。
// 去向：返回 = useGate().back；关闭 = 首页（MemberFrame）。
// 版式：按 docs/research/vp/MEMBER-GEOMETRY.md（/kyc）：卡宽 358、头 50、字段标签 12px、输入高 36、字段行距 85（标签17+间距6+输入36+26）。
import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import { post, ApiError } from '@/lib/api'
import { ID_TYPES, checkKyc1, checkUpload } from '@/lib/mock/member'
import SkBox from '@/components/ui/SkBox'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { MemberFrame, MemberInputStyles, inputClass, useErrText, useFieldText, useMemberState } from './shared'

const L1_KEY = 'vp_kyc_l1'
const COUNTRIES = ['Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Vietnam']
const EMPTY1 = { firstName: '', lastName: '', dob: '', country: 'Malaysia', city: '', postal: '', address: '', phone: '', email: '', idType: '', idNumber: '', idValid: '', idValidTo: '' }

// 标签 + 控件 + 错误（模块级组件，避免在渲染内重建导致输入框失焦）
function KcF({ label, err, w, cls, children }: { label: string, err?: string, w?: number, cls?: string, children: React.ReactNode }) {
  return (
    <div className={`member_kycform__kc-f${cls ? ` ${cls}` : ''}`} style={w ? { width: w } : undefined}>
      <span className="member_kycform__kc-l">{label}</span>
      {children}
      {err ? <span className="member_kycform__kc-e" role="alert">{err}</span> : null}
    </div>
  )
}

export default function KycForm() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.kyc.title')}><KycBody /></MemberFrame>
}

function KycBody() {
  const { t } = useLanguage()
  const { showToast } = useLayout()
  const errText = useErrText()
  const fieldText = useFieldText()
  const { st } = useMemberState()

  const [f, setF] = useState(EMPTY1)
  const [errs1, setErrs1] = useState<Record<string, string>>({})
  const [busy1, setBusy1] = useState(false)
  const [l1Done, setL1Done] = useState(false)
  const [l2, setL2] = useState({ idType: '', front: '', back: '' })
  const [errs2, setErrs2] = useState<Record<string, string>>({})
  const [busy2, setBusy2] = useState(false)

  // 读取 Level 1 完成状态（挂载后再读，避免服务端/客户端首屏不一致）
  useEffect(() => {
    try { setL1Done(localStorage.getItem(L1_KEY) === '1') } catch { /* 隐私模式：不记忆，保持锁定 */ }
  }, [])

  if (st === 'loading') return <SkBox h={993} state={t('member.common.loading')} className="member_kycform__kc-skel" />
  if (st === 'error') return <SkStatus kind="error" h={240} className="member_kycform__kc-st" />
  if (st === 'empty') return <SkStatus kind="empty" title={t('member.kyc.noItems')} hint="" h={240} className="member_kycform__kc-st" />

  const set1 = (k: keyof typeof EMPTY1) => (v: string) => { setF((x) => ({ ...x, [k]: v })); setErrs1((x) => ({ ...x, [k]: '' })) }
  const f1 = (k: keyof typeof EMPTY1) => ({ value: f[k], onChange: (e: { target: { value: string } }) => set1(k)(e.target.value) })
  const e1 = (k: keyof typeof EMPTY1) => fieldText(errs1[k])

  const submit1 = async (e: FormEvent) => {
    e.preventDefault()
    if (busy1) return
    const er = checkKyc1(f)
    if (!f.idType) er.idType = 'required'
    setErrs1(er)
    if (Object.keys(er).length) return
    setBusy1(true)
    try {
      await post('/api/web/member/kyc/submit', { level: 1, form: f })
      try { localStorage.setItem(L1_KEY, '1') } catch { /* 忽略 */ }
      setL1Done(true)
      showToast(t('member.toast.submitted'))
    } catch (err) {
      showToast(errText(err instanceof ApiError ? err.code : 0))
    } finally {
      setBusy1(false)
    }
  }

  // 上传框：先校验类型与大小，通过才记下文件名（mock 不真正上传）
  const pickFile = (side: 'front' | 'back') => (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0]
    if (!file) return
    const code = checkUpload(file.type, file.size)
    setErrs2((x) => ({ ...x, [side]: code ?? '' }))
    setL2((x) => ({ ...x, [side]: code ? '' : file.name }))
  }
  const submit2 = async (e: FormEvent) => {
    e.preventDefault()
    if (busy2 || !l1Done) return
    const er: Record<string, string> = {}
    if (!(ID_TYPES as readonly string[]).includes(l2.idType)) er.idType = 'required'
    if (!l2.front) er.front = 'required'
    if (!l2.back) er.back = 'required'
    setErrs2((x) => ({ ...x, ...er }))
    if (Object.keys(er).length) return
    setBusy2(true)
    try {
      await post('/api/web/member/kyc/submit', { level: 2, form: { idType: l2.idType, frontName: l2.front, backName: l2.back } })
      showToast(t('member.toast.submitted'))
    } catch (err) {
      showToast(errText(err instanceof ApiError ? err.code : 0))
    } finally {
      setBusy2(false)
    }
  }

  return (
    <>
      {/* 段 1：Level 1（卡高 993） */}
      <form className="kc-sec kc-sec--l1" onSubmit={submit1} noValidate>
        <div className="kc-head"><strong>{t('member.kyc.l1.title')}</strong></div>
        <div className="kc-desc"><span>{t('member.kyc.l1.desc')}</span></div>
        <div className="kc-body">
          <div className="kc-row">
            <KcF label={t('member.kyc.l1.f.firstName')} err={e1('firstName')} w={164}><input id="kc-firstName" className={inputClass(errs1.firstName)} autoComplete="given-name" {...f1('firstName')} /></KcF>
            <KcF label={t('member.kyc.l1.f.lastName')} err={e1('lastName')} w={164}><input id="kc-lastName" className={inputClass(errs1.lastName)} autoComplete="family-name" {...f1('lastName')} /></KcF>
          </div>
          <KcF label={t('member.kyc.l1.f.dob')} err={e1('dob')} cls="member_kycform__kc-tight"><input id="kc-dob" className={inputClass(errs1.dob)} type="date" {...f1('dob')} /></KcF>
          <KcF label={t('member.kyc.l1.f.country')} err={e1('country')} cls="member_kycform__kc-tight">
            <select id="kc-country" className={inputClass(errs1.country)} {...f1('country')}>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </KcF>
          <div className="kc-row">
            <KcF label={t('member.kyc.l1.f.city')} err={e1('city')} w={164}><input id="kc-city" className={inputClass(errs1.city)} {...f1('city')} /></KcF>
            <KcF label={t('member.kyc.l1.f.postal')} err={e1('postal')} w={164}><input id="kc-postal" className={inputClass(errs1.postal)} inputMode="numeric" {...f1('postal')} /></KcF>
          </div>
          <KcF label={t('member.kyc.l1.f.address')} err={e1('address')}><input id="kc-address" className={inputClass(errs1.address)} {...f1('address')} /></KcF>
          <KcF label={t('member.kyc.l1.f.phone')} err={e1('phone')}>
            <span className="kc-phone"><b>+60</b><input id="kc-phone" className={inputClass(errs1.phone)} inputMode="tel" autoComplete="tel-national" {...f1('phone')} /></span>
          </KcF>
          <KcF label={t('member.kyc.l1.f.email')} err={e1('email')}><input id="kc-email" className={inputClass(errs1.email)} type="email" autoComplete="email" {...f1('email')} /></KcF>
          <KcF label={t('member.kyc.l1.f.idNumber')} err={e1('idNumber') || e1('idType')}>
            <span className="kc-idwrap">
              <select id="kc-idType" className={inputClass(errs1.idType)} aria-label={t('member.kyc.l1.f.idType')} {...f1('idType')}>
                <option value="">{t('member.kyc.l1.pickType')}</option>
                {ID_TYPES.map((k) => <option key={k} value={k}>{t(`member.kyc.idType.${k}`)}</option>)}
              </select>
              <input id="kc-idNumber" className={inputClass(errs1.idNumber)} {...f1('idNumber')} />
            </span>
          </KcF>
          <div className="kc-row kc-row--sb">
            <KcF label={t('member.kyc.l1.f.idValid')} err={e1('idValid')} w={156}><input id="kc-idValid" className={inputClass(errs1.idValid)} type="date" {...f1('idValid')} /></KcF>
            <KcF label={t('member.kyc.l1.f.idValidTo')} w={156}><input id="kc-idValidTo" className={inputClass()} type="date" {...f1('idValidTo')} /></KcF>
          </div>
          <p className="kc-tips">{t('member.kyc.l1.tip')}</p>
          <button type="submit" className="m-btn kc-btn kc-btn--l1" disabled={busy1}>{busy1 ? t('member.common.submitting') : t('member.kyc.submit')}</button>
        </div>
      </form>

      {/* 段 2：Level 2（未完成 Level 1 整块锁定；卡高 519） */}
      <form className={`kc-sec kc-sec--l2${l1Done ? '' : ' locked'}`} onSubmit={submit2} noValidate>
        <div className="kc-head"><strong>{t('member.kyc.l2.title')}</strong></div>
        <div className="kc-body kc-body--l2">
          <p className="kc-lock">{l1Done ? t('member.kyc.l2.req') : t('member.kyc.l2.locked')}</p>
          <p className="kc-hint">{t('member.kyc.l2.hint')}</p>
          <KcF label={t('member.kyc.l2.idType')} err={fieldText(errs2.idType)}>
            <select id="kc-l2-idType" className={inputClass(errs2.idType)} disabled={!l1Done} value={l2.idType} onChange={(e) => { setL2((x) => ({ ...x, idType: e.target.value })); setErrs2((x) => ({ ...x, idType: '' })) }}>
              <option value="">{t('member.kyc.l1.pickType')}</option>
              {ID_TYPES.map((k) => <option key={k} value={k}>{t(`member.kyc.idType.${k}`)}</option>)}
            </select>
          </KcF>
          <KcF label={t('member.kyc.l2.front')} err={fieldText(errs2.front)}>
            <input id="kc-l2-front" className={inputClass(errs2.front)} type="file" disabled={!l1Done} accept="image/png,image/jpeg,application/pdf" onChange={pickFile('front')} />
          </KcF>
          <KcF label={t('member.kyc.l2.back')} err={fieldText(errs2.back)}>
            <input id="kc-l2-back" className={inputClass(errs2.back)} type="file" disabled={!l1Done} accept="image/png,image/jpeg,application/pdf" onChange={pickFile('back')} />
          </KcF>
          <button type="submit" className="m-btn kc-btn kc-btn--pill" disabled={!l1Done || busy2}>{busy2 ? t('member.common.submitting') : t('member.kyc.submit')}</button>
        </div>
      </form>

      <MemberInputStyles />
      <style jsx>{`
        :global(.member_kycform__kc-skel) { width: calc(100% - 16px); margin: 8px; }
        :global(.member_kycform__kc-st) { margin: 8px; }
        .kc-sec { width: min(358px, calc(100% - 16px)); margin: 8px; border-radius: 8px; background: #26262d; overflow: hidden; box-sizing: border-box; }
        .kc-sec--l1 { margin-top: 17px; min-height: 993px; }
        .kc-sec--l2 { margin-top: 16px; min-height: 519px; }
        .kc-sec :global(.m-inp) { height: 36px; }
        .kc-sec.locked { opacity: .85; }
        .kc-head { height: 50px; display: flex; align-items: center; padding: 0 12px; font-size: 14px; box-sizing: border-box; }
        .kc-desc { width: min(352px, calc(100% - 6px)); height: 50px; margin: 13px 3px 0; box-sizing: border-box; padding: 0 8px; border-radius: 8px; background: #2a2d33; color: #c4c8d0; font-size: 14px; display: flex; align-items: center; }
        .kc-head strong { font-weight: 500; }
        .kc-body { position: relative; padding: 15px 13px 13px; box-sizing: border-box; display: flex; flex-direction: column; gap: 26px; }
        .kc-body--l2 { padding-top: 13px; }
        .kc-row { display: flex; gap: 5px; }
        .kc-row--sb { justify-content: space-between; }
        /* 字段：标签 17（12px）+ 间距 6 + 输入 36 + 行距 26 = 85。KcF 是另一个函数组件，其元素必须用全局类 */
        :global(.member_kycform__kc-f) { width: min(333px, 100%); display: flex; flex-direction: column; gap: 6px; }
        .kc-row :global(.member_kycform__kc-f) { width: auto; }
        :global(.member_kycform__kc-l) { font-size: 12px; line-height: 17px; color: #8d8d92; }
        :global(.member_kycform__kc-e) { color: #f87171; font-size: 12px; line-height: 17px; }
        /* ID Card 类型选择做 ID Number 框的前缀 */
        .kc-idwrap { position: relative; display: block; }
        .kc-idwrap select { position: absolute; left: 3px; top: 2px; width: 98px; height: 32px; z-index: 1; }
        .kc-idwrap input { padding-left: 106px; }
        .kc-phone { display: flex; align-items: center; gap: 6px; }
        @media (min-width: 768px) {
          .kc-sec { width: auto; margin: 0 0 20px; border-radius: 28px; background: #262932; border: 1px solid #3a3d4a; }
          .kc-sec--l1, .kc-sec--l2 { margin-top: 0; min-height: 0; }
          .kc-head { height: 60px; padding: 0 30px; font-size: 18px; }
          .kc-desc { width: auto; margin: 0 30px; background: #14151b; border: 1px solid #3f4351; color: #d5d9e4; }
          .kc-sec .kc-tips, .kc-sec .kc-hint { width: auto; height: auto; min-height: 0; margin: 0 0 16px; background: #14151b; border: 1px solid #3f4351; color: #d5d9e4; }
          .kc-sec .kc-phone b { background: #14151b; border: 1px solid #3f4351; }
          .kc-sec .kc-btn, .kc-sec .kc-btn--l1 { position: static; width: 100%; max-width: 360px; margin: 8px 0 0; }
          .kc-sec .kc-lock { margin: 0 0 12px; font-size: 14px; }
          .kc-body { padding: 24px 30px 30px; }
          :global(.member_kycform__kc-f) { width: 100%; }
          .kc-row :global(.member_kycform__kc-f) { width: auto; flex: 1; }
        }
        .kc-phone b { flex: none; height: 36px; line-height: 36px; padding: 0 10px; border-radius: 8px; background: #2a2d33; color: #c4c8d0; font-weight: 500; font-size: 14px; }
        .kc-tips { width: min(333px, 100%); height: 119px; margin: -26px 0 0; padding: 12px; box-sizing: border-box; border-radius: 8px; background: #2a2d33; color: #c4c8d0; font-size: 12px; }
        .kc-lock { margin: 0 0 16px; font-size: 12px; color: #c4c8d0; }
        .kc-hint { width: min(333px, 100%); min-height: 43px; margin: 0 0 22px; padding: 8px 12px; box-sizing: border-box; border-radius: 8px; background: #2a2d33; color: #8d8d92; font-size: 12px; }
        .kc-btn { width: min(309px, calc(100% - 48px)); height: 44px; margin: 0 auto; border-radius: 12px; font-size: 16px; font-weight: 500; }
        .kc-btn--pill { border-radius: 999px; }
        /* 字段行距：参考站 dob→country、country→city 为 82（参考站），其余 85；标签 17 + 间距 6 + 输入 36 + 行距 26 = 85，故这两个字段 margin-bottom -3 */
        :global(.member_kycform__kc-tight) { margin-bottom: -3px; }
        /* L1 提交按钮不占文档流：参考站按钮文字 y984 位于提示块（y933 起）之内。
           推导：body 顶 = 72 + 头 50 + 间距 13 + 说明 50 = 185；按钮顶 962 → 相对 777；卡高 = 提示块底 1052 + 底距 13 - 顶 72 = 993 */
        .kc-btn--l1 { position: absolute; left: 24px; top: 777px; width: min(309px, calc(100% - 48px)); margin: 0; }
      `}</style>
    </>
  )
}
