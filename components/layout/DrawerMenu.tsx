'use client'
// 手机左侧抽屉，底部 Menu 标签打开（来源：文档 interactions.md a；handlers-static §3）
// .mo-drawer 300ms ease-out；遮罩 .mo-overlay 淡入 300ms / 淡出 180ms；点遮罩关闭；无 ✕（文档）。
// 路由变化自动关闭（推断：handlers-static §3 末行标注为推断）。
// 版式对照参考站手机侧栏：头像行 → 存款/提现 → 4 张大卡 → 常用列表 → 下载 → 语言。
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { brand } from '@/config/brand'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useLayout } from '@/context/LayoutContext'
import { useGate } from '@/lib/useGate'
import { avatarImg } from '@/lib/assets'
import LangToggle from '@/components/shared/LangToggle'

const CARDS = [
  { k: 'base.nav.referEarn', to: '/refer-earn', img: '/assets/refer/earn-1.webp' },
  { k: 'base.nav.vip', to: '/vip', img: '/assets/vip/medal-5.webp' },
  { k: 'base.nav.promotion', to: '/promotion', img: '/assets/promotion/step-chest.webp' },
  { k: 'base.nav.spin', to: '/freeSpin', img: '/assets/freespin/prize-spin1.webp' }
]

const Chev = <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2.500l4.500 4.500L5 11.500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
const IC = {
  fav: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.200l2.700 5.500 6 .9-4.400 4.200 1 6-5.300-2.900-5.300 2.900 1-6L3.300 9.600l6-.9z" /></svg>,
  recent: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.500 12a8.500 8.500 0 1 0 2.700-6.200L3.500 8.500" /><path d="M3.500 4v4.500H8M12 7.500V12l3 2" /></svg>,
  shield: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7.500 3v5.500c0 4.500-3.200 8-7.500 9.500-4.300-1.500-7.500-5-7.500-9.500V6z" /><circle cx="12" cy="10.500" r="1.800" /><path d="M12 12.500v3" strokeLinecap="round" /></svg>,
  support: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-6h4M4 13h4v6H6a2 2 0 0 1-2-2z" /></svg>,
  app: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="3" width="11" height="18" rx="2.500" /><path d="M3 9l4 3-4 3" /></svg>,
  android: <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 9h12v8a1.500 1.500 0 0 1-1.500 1.500H15V21a1.200 1.200 0 0 1-2.400 0v-2.500h-1.200V21A1.200 1.200 0 0 1 9 21v-2.500H7.500A1.500 1.500 0 0 1 6 17zM3.600 9.500a1.200 1.200 0 0 1 2.400 0v5a1.200 1.200 0 0 1-2.400 0zM18 9.500a1.200 1.200 0 0 1 2.400 0v5a1.200 1.200 0 0 1-2.400 0zM6.200 8a5.800 5.800 0 0 1 11.600 0z" /></svg>,
  dl: <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3v10M6 9.500l4 4 4-4M4 17h12" /></svg>,
  globe: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>,
  gear: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M12 2.500l8 4.500v10l-8 4.500-8-4.500V7z" /><circle cx="12" cy="12" r="3" /></svg>
}

export default function DrawerMenu() {
  const pathname = usePathname()
  const { lang, t } = useLanguage()
  const { loggedIn, user } = useAuth()
  const { drawerOpen, setDrawerOpen, showToast } = useLayout()
  const { enterLogin, enterRegister, guard, go } = useGate()
  const close = () => setDrawerOpen(false)

  // 路由变化（路径）时自动关闭
  useEffect(() => { setDrawerOpen(false) }, [pathname, setDrawerOpen])

  // 菜单项（来源：文档 handlers-static §3 leftPopup）：已登录关闭抽屉并跳转；未登录 enterLogin(sidebar)，不跳目标
  const pick = (to: string) => guard('sidebar', () => { close(); return go(to) })
  const signIn = () => { close(); enterLogin('sidebar') }
  const signUp = () => { close(); enterRegister('sidebar') }
  const copyId = () => {
    try { void navigator.clipboard?.writeText(String(user?.id ?? '')) } catch { /* 剪贴板不可用时忽略 */ }
    showToast(t('base.userMenu.copied'))
  }
  const list = [
    { k: 'base.drawer.favourites', to: '/casino/favourites-recent', ic: IC.fav },
    { k: 'base.drawer.recent', to: '/casino/recent', ic: IC.recent },
    { k: 'base.drawer.compliance', to: '/privacy-policy', ic: IC.shield },
    { k: 'base.shell.liveSupport', to: '/chat', ic: IC.support }
  ]

  return (
    <div className="wrap">
      <div className={`mask mo-overlay${drawerOpen ? ' on' : ''}`} onClick={close} />
      <aside className={`drawer mo-drawer${drawerOpen ? ' on' : ''}`} aria-label="drawer">
        <div className="d-top">
          {loggedIn ? (
            <div className="d-user">
              <img className="d-av" src={avatarImg(user?.avatar ?? 1)} alt="" />
              <div className="d-un">
                <strong>{user?.nickname ?? '-'}</strong>
                <button type="button" className="d-id" onClick={copyId}>ID:{user?.id ?? '-'} {IC.copy}</button>
              </div>
              <button type="button" className="d-gear" aria-label="settings" onClick={() => pick('/user')}>{IC.gear}</button>
            </div>
          ) : (
            <>
              <div className="d-head"><span className="logo">{brand.name}</span></div>
              <div className="d-auth">
                <button className="d-btn" onClick={signIn}>{t('base.shell.signIn')}</button>
                <button className="d-btn solid" onClick={signUp}>{t('base.shell.register')}</button>
              </div>
            </>
          )}
          {loggedIn && (
            <div className="d-money">
              <button type="button" className="d-pill dep" onClick={() => pick('/deposit')}>{t('base.userMenu.deposit')}<i className="d-bd">+50%</i></button>
              <button type="button" className="d-pill wd" onClick={() => pick('/withdraw')}>{t('base.userMenu.withdraw')}</button>
            </div>
          )}
        </div>

        <div className="d-scroll">
          <div className="d-cards">
            {CARDS.map((c) => (
              <button key={c.to} type="button" className="d-card" onClick={() => pick(c.to)}>
                <img src={c.img} alt="" />
                <span className="d-ct">{t(c.k)}</span>
                <i className="d-go">{Chev}</i>
              </button>
            ))}
          </div>
          <div className="d-list">
            {list.map((l) => (
              <button key={l.to} type="button" className="d-row" onClick={() => pick(l.to)}>
                <span className="d-ri">{l.ic}</span>
                <span className="d-rt">{t(l.k)}</span>
                <span className="d-rc">{Chev}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="d-foot">
          <div className="d-dl">
            <button type="button" className="d-app"><span className="d-ai">{IC.app}</span><span className="d-at"><b>WEBAPP</b><small>(363K)</small></span><span className="d-dd">{IC.dl}</span></button>
            <button type="button" className="d-app"><span className="d-ai">{IC.android}</span><span className="d-at"><b>Android</b><small>(56M)</small></span><span className="d-dd">{IC.dl}</span></button>
          </div>
          <div className="d-lang">
            <span className="d-ri">{IC.globe}</span>
            <span className="d-rt">{t('base.shell.language')}</span>
            <LangToggle />
          </div>
        </div>
      </aside>

      <style jsx>{`
        .mask { position: fixed; inset: 0; background: rgba(0, 0, 0, .55); z-index: 40; }
        .mask:not(.on) { pointer-events: none; }
        .drawer { position: fixed; top: 0; bottom: 0; left: 0; box-sizing: border-box; display: flex; flex-direction: column; width: min(320px, 88vw); z-index: 50; background: linear-gradient(180deg, #1d1e25 0%, #17181d 100%); color: #fff; }
        .d-top { flex: none; padding: 16px 14px 10px; }
        .d-head { display: flex; align-items: center; height: 40px; margin-bottom: 12px; }
        .logo { display: inline-flex; align-items: center; height: 28px; padding: 0 10px; box-sizing: border-box; border: 1px dashed var(--vp-primary); border-radius: 6px; color: var(--vp-primary); font-size: 13px; font-weight: 800; letter-spacing: .08em; }
        .d-auth { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .d-btn { height: 42px; border: 1px solid var(--vp-primary); border-radius: 12px; background: transparent; color: var(--vp-primary); font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
        .d-btn.solid { background: var(--vp-grad); color: var(--vp-on-primary); }
        .d-user { display: flex; align-items: center; gap: 12px; }
        .d-av { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255, 255, 255, .5); box-shadow: 0 0 0 3px rgba(90, 250, 104, .18); }
        .d-un { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .d-un strong { font-size: 18px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .d-id { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: #8d93a0; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .d-gear { flex: none; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 0; background: none; color: #aeb4bf; cursor: pointer; }
        .d-money { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
        .d-pill { position: relative; height: 46px; border: 1px solid rgba(255, 255, 255, .08); border-radius: 24px; background: linear-gradient(180deg, #2c2e36, #1f2026); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .12), 0 3px 8px rgba(0, 0, 0, .35); font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer; }
        .d-pill:active { transform: scale(.97); }
        .d-pill.dep { color: #5afa68; }
        .d-pill.wd { color: #5de9d8; }
        .d-bd { position: absolute; top: -9px; right: 14px; padding: 2px 8px; border-radius: 10px; background: linear-gradient(90deg, #ff9a3c, #ff5e62); color: #fff; font-size: 12px; font-style: normal; font-weight: 700; line-height: 16px; }
        .d-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 14px; }
        .d-cards { display: flex; flex-direction: column; gap: 10px; }
        .d-card { position: relative; display: flex; align-items: center; gap: 14px; height: 68px; padding: 0 14px; border: 1px solid rgba(255, 255, 255, .06); border-radius: 14px; background: linear-gradient(120deg, #34363f 0%, #272830 60%, #22232a 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 4px 12px rgba(0, 0, 0, .3); color: #fff; font-family: inherit; text-align: left; cursor: pointer; }
        .d-card:active { transform: scale(.98); }
        .d-card img { width: 52px; height: 52px; object-fit: contain; flex: none; filter: drop-shadow(0 3px 5px rgba(0, 0, 0, .4)); }
        .d-ct { flex: 1; font-size: 18px; font-weight: 700; }
        .d-go { flex: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, .12); color: #e6e8ee; }
        .d-list { margin-top: 10px; }
        .d-row, .d-lang { display: flex; align-items: center; gap: 14px; width: 100%; height: 54px; padding: 0 6px; border: 0; background: none; color: #fff; font-family: inherit; text-align: left; cursor: pointer; }
        .d-ri { flex: none; display: flex; width: 28px; color: #e6e8ee; }
        .d-rt { flex: 1; font-size: 16px; font-weight: 600; }
        .d-rc { flex: none; display: flex; color: #7d838f; }
        .d-foot { flex: none; padding: 10px 14px 22px; border-top: 1px solid rgba(255, 255, 255, .08); }
        .d-dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .d-app { display: flex; align-items: center; gap: 8px; height: 62px; padding: 0 10px; border: 1px solid rgba(255, 255, 255, .06); border-radius: 12px; background: linear-gradient(180deg, #2b2c34, #22232a); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); color: #fff; font-family: inherit; text-align: left; cursor: pointer; }
        .d-ai { flex: none; display: flex; color: #e6e8ee; }
        .d-at { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25; }
        .d-at b { font-size: 13px; font-weight: 700; }
        .d-at small { font-size: 12px; color: #7d838f; }
        .d-dd { flex: none; display: flex; color: #aeb4bf; }
        .d-lang { display: flex; align-items: center; gap: 14px; margin-top: 10px; height: 54px; padding: 0 14px; border: 1px solid rgba(255, 255, 255, .06); border-radius: 12px; background: linear-gradient(180deg, #2b2c34, #22232a); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); }
        .d-flag { flex: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #3a3d47; font-size: 12px; font-style: normal; font-weight: 800; }
        @media (min-width: 768px) { .wrap { display: none; } }
      `}</style>
    </div>
  )
}
