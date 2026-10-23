'use client'
// 账户页（/verify，登录后）：参考站桌面「Personal → Account」——Profile info / Email / Phone 三张卡 + 右下 Logout。
import { useRouter } from 'next/navigation'
import { navPush } from '@/lib/navProgress'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import SkImg from '@/components/ui/SkImg'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'

const mask = (a?: string) => {
  if (!a) return '-'
  const [n, d] = a.split('@')
  return d ? `${n.slice(0, 4)}***@${d}` : `${a.slice(0, 3)}***${a.slice(-2)}`
}

export default function PersonalAccount() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { showToast } = useLayout()
  const router = useRouter()
  const copy = () => navigator.clipboard?.writeText(user?.id ?? '').then(() => showToast(t('base.userMenu.copied')), () => undefined)
  return (
    <div className="pa">
      <section className="card">
        <h3>{t('member.personal.profile')}</h3>
        <div className="row">
          <SkImg src={avatarImg(user?.avatar ?? 1)} w={64} h={64} round label="" />
          <div className="nm"><b>{user?.nickname ?? '-'}</b><small>ID:{user?.id ?? '-'} <span role="button" tabIndex={0} aria-label="copy" onClick={copy}>⧉</span></small></div>
          <button type="button" className="btn pri" onClick={() => navPush(router, '/edit-avater')}>{t('member.personal.edit')}</button>
        </div>
      </section>
      <section className="card">
        <h3>{t('member.personal.email')}</h3>
        <p>{t('member.personal.emailDesc')}</p>
        <div className="row"><span className="inp">{mask(user?.account)}</span><span className="btn ok">✔ {t('member.personal.verified')}</span></div>
      </section>
      <section className="card">
        <h3>{t('member.personal.phone')}</h3>
        <p>{t('member.personal.phoneDesc')}</p>
        <div className="row"><span className="inp">{t('member.personal.notBound')}</span><button type="button" className="btn out">{t('member.personal.add')}</button></div>
      </section>
      <div className="lo"><button type="button" className="btn gh" onClick={logout}>⇥ {t('member.personal.logout')}</button></div>
      <style jsx>{`
        .pa { display: flex; flex-direction: column; gap: 20px; }
        .card { padding: 24px 30px 30px; border-radius: 28px; background: #262932; border: 1px solid #3a3d4a; }
        h3 { margin: 0 0 16px; padding-bottom: 16px; border-bottom: 1px solid #3a3d4a; font-size: 18px; font-weight: 700; }
        p { margin: 0 0 16px; color: #aeb2bb; font-size: 16px; }
        .row { display: flex; align-items: center; gap: 20px; }
        .nm { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .nm b { font-size: 20px; }
        .nm small { color: #aeb2bb; font-size: 14px; }
        .nm span { cursor: pointer; }
        .inp { flex: 1; height: 50px; display: flex; align-items: center; padding: 0 16px; border-radius: 10px; background: #14151b; border: 1px solid #3f4351; font-size: 16px; }
        .btn { height: 50px; min-width: 160px; padding: 0 20px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 10px; font-family: inherit; font-size: 16px; cursor: pointer; }
        .pri { background: #05f26a; color: #06210f; }
        .ok { background: #1b3a2e; border: 1px solid #2a6a4c; color: #05f26a; cursor: default; }
        .out { background: transparent; border: 1px solid #05f26a; color: #05f26a; }
        .lo { display: flex; justify-content: flex-end; }
        .gh { height: 54px; min-width: 222px; background: #2b2e39; border: 1px solid #3f4351; color: #d5d9e4; font-size: 18px; border-radius: 16px; }
        @media (max-width: 767px) { .card { padding: 16px; border-radius: 16px; } .row { gap: 10px; } .btn { min-width: 96px; } }
      `}</style>
    </div>
  )
}
