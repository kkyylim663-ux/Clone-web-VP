'use client'
// 个人中心（/user）：头部卡 + VIP 卡 + 7 个入口（4 列）+ 统计 3 格 + 两个列表卡（空态）。
// 入口去向（来源：LOGGED-IN-REPORT §1 入口行顺序；Account→/verify、Security→/update-password 为推断）。
// 数据：/api/web/member/profile（mock）。访客由 MemberFrame 挡住，只显示去登录提示。
import { navPush } from '@/lib/navProgress'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useGate } from '@/lib/useGate'
import SkBox from '@/components/ui/SkBox'
import SkImg from '@/components/ui/SkImg'
import { avatarImg, EMPTY } from '@/lib/assets'
import { useLayout } from '@/context/LayoutContext'
import SkStatus from '@/components/skeleton/browse/SkStatus'
import { MemberFrame, MemberInputStyles, useDemoState, useMemberQuery, useMemberState } from './shared'

interface Profile { nickname: string, uid: string, level: number, exp: number, nextExp: number, stats: { wins: string, bets: string, turnover: string }, balance: { currency: string, available: string } }

// 入口 7 格：顺序同参考站入口行（Account、Security、KYC、Bets、Sessions、Ignored Users、Preferences）
const MENU: { k: string, to: string }[] = [
  { k: 'account', to: '/verify' },
  { k: 'security', to: '/security' },
  { k: 'kyc', to: '/kyc' },
  { k: 'bets', to: '/bets' },
  { k: 'sessions', to: '/sessions' },
  { k: 'ignored', to: '/blacklist' },
  { k: 'preferences', to: '/preferences' },
]


// 入口图标：自绘 SVG（白色线条 + 绿色点缀），不依赖图片文件
const G = '#2fe36b'
const ICONS: Record<string, React.ReactElement> = {
  account: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="17" cy="10" r="4.5" stroke={G} /><path d="M5 28v-3a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v3z" /></svg>,
  security: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 4l10 3.500v8.500c0 6-4.200 10.500-10 13-5.800-2.500-10-7-10-13V7.500z" /><circle cx="16" cy="14.500" r="3" stroke={G} /><path d="M18.300 16.800l3 3" stroke={G} /></svg>,
  kyc: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="7" width="26" height="19" rx="3" /><circle cx="12" cy="15" r="2.500" /><path d="M8 22c.6-2 2.200-3 4-3s3.400 1 4 3M19 13h7M19 17h5" /><circle cx="27" cy="27" r="4.500" fill="#1d1f25" stroke={G} /><path d="M25 27l1.500 1.500L29 25.800" stroke={G} /></svg>,
  bets: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="17" cy="17" r="13" /><circle cx="17" cy="17" r="6.500" stroke={G} /><path d="M17 4v6M17 24v6M4 17h6M24 17h6" /><path d="M17 13.500v7M15 15c0-1 1-1.500 2-1.500s2 .6 2 1.500-1 1.300-2 1.600-2 .7-2 1.700 1 1.700 2 1.700 2-.6 2-1.700" strokeWidth="1.300" stroke={G} /></svg>,
  sessions: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 10a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" /><circle cx="17" cy="15" r="3" stroke={G} /><path d="M11 23c1-3 3.200-4 6-4s5 1 6 4" stroke={G} /><circle cx="9.500" cy="16" r="2" /><circle cx="24.500" cy="16" r="2" /></svg>,
  ignored: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="14" cy="11" r="5" /><path d="M4 28v-2a7 7 0 0 1 7-7h6" /><circle cx="26" cy="25" r="5.500" fill="#1d1f25" stroke={G} /><path d="M22.500 28.500l7-7" stroke={G} /></svg>,
  preferences: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 3.500l11.500 6.500v14L17 30.500 5.500 24V10z" /><circle cx="17" cy="17" r="4.500" stroke={G} /></svg>
}
const PENCIL = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19z" /></svg>
const COPY = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>
const CHEV = <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2.500l4.500 4.500L5 11.500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>

export default function UserHome() {
  const { t } = useLanguage()
  return <MemberFrame title={t('member.user.title')}><UserBody /></MemberFrame>
}

function UserBody() {
  const { t } = useLanguage()
  const router = useRouter()
  const { guard, go } = useGate()
  const { user } = useAuth()
  const { showToast } = useLayout()
  const { st, member } = useMemberState()
  const q = useMemberQuery<Profile>('/api/web/member/profile', {}, member && st !== 'loading' && st !== 'error' && st !== 'empty')
  const demo = useDemoState(st, q.failed, q.data === null)
  const p = q.data
  const pct = p && p.nextExp > 0 ? Math.min(100, (p.exp / p.nextExp) * 100) : 0

  if (demo === 'loading') return <><SkBox h={214} state={t('member.common.loading')} className="member_userhome__u-skel" /><SkBox h={101} className="member_userhome__u-skel" /><SkBox h={150} className="member_userhome__u-skel" /></>
  if (demo === 'error') return <SkStatus kind="error" h={320} className="member_userhome__u-st" />
  if (demo === 'empty') return <SkStatus kind="empty" title={t('member.common.emptyTitle')} hint="" h={320} className="member_userhome__u-st" />
  if (!p) return null

  const need = Math.max(0, p.nextExp - p.exp)
  const copy = () => { try { void navigator.clipboard?.writeText(String(p.uid)) } catch { /* 剪贴板不可用时忽略 */ } showToast(t('base.userMenu.copied')) }

  return (
    <>
      {/* 头部：头像 + 昵称（可编辑）+ UID 胶囊（可复制） */}
      <section className="u-head">
        <div className="u-top">
          <img className="u-av" src={avatarImg(user?.avatar ?? 1)} alt="" />
          <div className="u-id">
            <span className="u-nrow">
              <strong className="u-name">{p.nickname}</strong>
              <button type="button" className="u-edit" aria-label="edit" onClick={() => go('/edit-avater')}>{PENCIL}</button>
            </span>
            <button type="button" className="u-uid" onClick={copy}>ID:{p.uid} {COPY}</button>
          </div>
        </div>
      </section>

      {/* VIP 卡：大字 VIP 等级 + 经验进度；去向 /vip */}
      <div className="u-vip" role="button" tabIndex={0} onClick={() => go('/vip')}>
        <div className="u-vip-row">
          <span className="u-lv">VIP {p.level}</span>
          <span className="u-chev">{CHEV}</span>
        </div>
        <div className="u-vip-row u-vip-sub">
          <span className="u-expn"><b>{Number(p.exp).toFixed(2)}</b> / {Number(p.nextExp).toFixed(2)} EXP</span>
          <span className="u-need">{t('member.user.need', { n: need, lv: p.level + 1 })}</span>
        </div>
        <div className="u-bar"><i style={{ width: `${pct}%` }} /></div>
      </div>

      {/* 入口：4 列 */}
      <nav className="u-menu">
        {MENU.map((m) => (
          <div key={m.k} className="u-cell" role="button" tabIndex={0} onClick={() => guard('sidebar', () => navPush(router, m.to))}>
            <span className="u-ico">{ICONS[m.k]}</span>
            <span className="u-tag">{t(`member.user.menu.${m.k}`)}</span>
          </div>
        ))}
      </nav>

      {/* 统计：3 格，格间竖线 */}
      <section className="u-block">
        <div className="u-title"><strong>{t('member.user.stats.title')}</strong></div>
        <div className="u-stats">
          <div className="u-stat"><span className="u-sl">{t('member.user.stats.wins')}</span><span className="u-sv">{p.stats.wins}</span></div>
          <div className="u-stat"><span className="u-sl">{t('member.user.stats.bets')}</span><span className="u-sv">{p.stats.bets}</span></div>
          <div className="u-stat"><span className="u-sl">{t('member.user.stats.turnover')}</span><span className="u-sv">{p.stats.turnover}</span></div>
        </div>
      </section>

      {[['played', EMPTY[0]], ['favourites', EMPTY[1]]].map(([k, img]) => (
        <section key={k} className="u-block">
          <div className="u-title"><strong>{t(`member.user.${k}`)}</strong></div>
          <div className="u-empty"><img src={img} alt="" /><span>{t('member.common.emptyTitle')}</span></div>
        </section>
      ))}

      <MemberInputStyles />
      <style jsx>{`
        :global(.member_userhome__u-skel) { width: calc(100% - 16px); margin: 8px; }
        :global(.member_userhome__u-st) { margin: 8px; }
        .u-head { padding: 16px 12px 0; box-sizing: border-box; }
        .u-top { display: flex; align-items: center; gap: 14px; }
        .u-av { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255, 255, 255, .55); box-shadow: 0 0 0 4px rgba(90, 250, 104, .15), 0 6px 18px rgba(0, 0, 0, .45); }
        .u-id { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
        .u-nrow { display: flex; align-items: center; gap: 8px; }
        .u-name { font-size: 20px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .u-edit { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 0; border-radius: 50%; background: rgba(255, 255, 255, .12); color: #e6e8ee; cursor: pointer; }
        .u-uid { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; height: 30px; padding: 0 12px; border: 0; border-radius: 15px; background: rgba(255, 255, 255, .1); color: #c9ced8; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .u-vip { margin: 18px 12px 0; padding: 14px 16px 16px; border-radius: 14px; background: linear-gradient(135deg, #34353d 0%, #26272e 55%, #22232a 100%); border: 1px solid rgba(255, 255, 255, .06); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 4px 14px rgba(0, 0, 0, .3); cursor: pointer; }
        .u-vip-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .u-lv { font-size: 30px; font-weight: 900; font-style: italic; letter-spacing: 1px; color: #8d93a0; text-shadow: 0 2px 0 rgba(0, 0, 0, .35); }
        .u-chev { color: #9aa0ac; display: flex; }
        .u-vip-sub { margin-top: 6px; font-size: 13px; color: #aeb4bf; }
        .u-expn b { color: #fff; font-weight: 800; font-size: 15px; }
        .u-need { text-align: right; }
        .u-bar { margin-top: 14px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, .1); overflow: hidden; }
        .u-bar i { display: block; height: 100%; border-radius: 3px; background: var(--vp-grad); }
        .u-menu { display: grid; grid-template-columns: repeat(4, 1fr); row-gap: 18px; margin: 16px 12px 8px; padding: 18px 4px; box-sizing: border-box; border-radius: 14px; background: linear-gradient(180deg, #2a2b33, #23242b); border: 1px solid rgba(255, 255, 255, .05); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); }
        .u-cell { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; text-align: center; }
        .u-cell:active .u-ico { transform: scale(.92); }
        .u-ico { display: flex; transition: transform .15s ease; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, .35)); }
        .u-tag { color: #d0d4dc; font-size: 13px; line-height: 16px; font-weight: 500; padding: 0 2px; }
        .u-block { margin: 14px 12px 10px; padding: 0; background: transparent; }
        .u-title { height: 28px; display: flex; align-items: center; margin: 0 0 8px; font-size: 18px; }
        .u-title strong { font-weight: 800; }
        .u-stats { display: grid; grid-template-columns: repeat(3, 1fr); padding: 14px 0; border-radius: 14px; background: linear-gradient(180deg, #2a2b33, #23242b); border: 1px solid rgba(255, 255, 255, .05); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08); }
        .u-stat { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 4px; text-align: center; }
        .u-stat + .u-stat { border-left: 1px solid rgba(255, 255, 255, .08); }
        .u-sl { color: #9aa0ac; font-size: 12px; font-weight: 600; }
        .u-sv { color: #fff; font-size: 18px; font-weight: 800; }
        .u-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 170px; border-radius: 14px; background: rgba(255, 255, 255, .04); color: #8d93a0; font-size: 13px; }
        .u-empty img { width: 104px; height: 104px; object-fit: contain; opacity: .9; }
      `}</style>
    </>
  )
}
// scope-fixed: 传给组件的 className 已改名为 <文件>__<名> 并用 :global() 写样式（styled-jsx 只给原生元素加作用域）
