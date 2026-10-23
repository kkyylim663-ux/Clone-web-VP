'use client'
// 顶栏头像下拉菜单（参考站：点头像弹出，不跳页）：头部（头像 / 昵称 / ID 复制 / 展开箭头）、存款 / 提现、功能列表。
// 外部点击、Esc、选择菜单项都会关闭；菜单项路径：账户 /user、安全 /update-password、实名 /kyc、投注 /bets、会话 /sessions、屏蔽用户 /blacklist、偏好 /preferences。
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { navPush } from '@/lib/navProgress'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useLayout } from '@/context/LayoutContext'
import SkImg from '@/components/ui/SkImg'
import MemberIcon from '@/components/layout/MemberIcons'
import { coverV, coverH, avatarImg, poolImg, HOME } from '@/lib/assets'

const ITEMS = [
  { k: 'account', to: '/verify' },
  { k: 'security', to: '/security' },
  { k: 'kyc', to: '/kyc' },
  { k: 'bets', to: '/bets' },
  { k: 'sessions', to: '/sessions' },
  { k: 'ignored', to: '/blacklist' },
  { k: 'preferences', to: '/preferences' }
] as const

export default function UserMenu() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { setWalletOpen, setWalletView, showToast } = useLayout()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', down)
    window.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); window.removeEventListener('keydown', key) }
  }, [open])

  const openWallet = (v: 'deposit' | 'withdraw') => { setOpen(false); setWalletView(v); setWalletOpen(true) }
  const go = (to: string) => { setOpen(false); navPush(router, to) }
  const copyId = () => navigator.clipboard?.writeText(user?.id ?? '').then(() => showToast(t('base.userMenu.copied')), () => undefined)

  return (
    <div className="um" ref={box}>
      <button type="button" className="av" aria-label="account" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{user ? <SkImg src={avatarImg(user.avatar)} w={40} h={40} round label="" /> : null}</button>
      {open ? (
        <div className="pop" role="menu">
          <div className="hd">
            <span className="avb"><SkImg src={avatarImg(user?.avatar ?? 1)} w={48} h={48} round label="" /></span>
            <div className="nm">
              <b>{user?.nickname ?? '-'}</b>
              <small>ID:{user?.id ?? '-'} <span className="cp" role="button" tabIndex={0} aria-label="copy" onClick={copyId}>⧉</span></small>
            </div>
            <span className="go" role="button" tabIndex={0} aria-label="profile" onClick={() => go(window.matchMedia('(min-width: 768px)').matches ? '/verify' : '/user')}>›</span>
          </div>
          <div className="act">
            <button type="button" onClick={() => openWallet('deposit')}>{t('base.userMenu.deposit')}</button>
            <button type="button" onClick={() => openWallet('withdraw')}>{t('base.userMenu.withdraw')}</button>
          </div>
          <ul>
            {ITEMS.map((i) => (
              <li key={i.k} role="menuitem" tabIndex={0} onClick={() => go(i.to)}>
                <span className="ic"><MemberIcon k={i.k} /></span><span className="tx">{t(`base.userMenu.${i.k}`)}</span><i>›</i>
              </li>
            ))}
            <li role="menuitem" tabIndex={0} className="out" onClick={() => { setOpen(false); logout() }}>
              <span className="ic"><MemberIcon k="logout" /></span><span className="tx">{t('base.userMenu.logout')}</span>
            </li>
          </ul>
        </div>
      ) : null}

      <style jsx>{`
        .um { position: relative; display: none; }
        @media (min-width: 768px) { .um { display: block; margin-left: 12px; } }
        .av { display: block; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; overflow: hidden; background: rgba(255, 255, 255, .12); cursor: pointer; }
        .pop { position: absolute; right: 0; top: 52px; z-index: 60; width: 340px; padding: 16px; border-radius: 20px; background: linear-gradient(160deg, #2b2d36 0%, #1f2028 60%); border: 1px solid rgba(255, 255, 255, .08); box-shadow: 0 16px 48px rgba(0, 0, 0, .55); animation: um-in .15s ease-out both; transform-origin: top right; }
        @keyframes um-in { from { opacity: 0; transform: scale(.96) translateY(-4px); } to { opacity: 1; transform: none; } }
        .hd { display: flex; align-items: center; gap: 12px; }
        .avb { flex: none; }
        .nm { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .nm b { font-size: 18px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nm small { color: #aeb2bb; font-size: 13px; }
        .cp { margin-left: 4px; cursor: pointer; }
        .go { flex: none; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255, 255, 255, .1); font-size: 20px; cursor: pointer; }
        .act { display: flex; gap: 10px; margin-top: 16px; }
        .act button { flex: 1; height: 44px; border: 1px solid rgba(255, 255, 255, .14); border-radius: 999px; background: linear-gradient(180deg, rgba(5, 242, 106, .22), rgba(5, 242, 106, .08)); color: #7ff5b3; font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer; }
        .act button:last-child { background: linear-gradient(180deg, rgba(90, 170, 255, .22), rgba(90, 170, 255, .08)); color: #9fd0ff; }
        ul { list-style: none; margin: 12px 0 0; padding: 0; }
        li { display: flex; align-items: center; gap: 14px; height: 50px; padding: 0 8px; border-radius: 10px; font-size: 16px; font-weight: 600; color: #cfd4e6; cursor: pointer; }
        li:hover { background: rgba(255, 255, 255, .06); }
        .ic { width: 28px; height: 28px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--fx-icon); }
        li:hover .ic { color: #fff; }
        li.out .ic { color: #f87171; }
        .tx { flex: 1; }
        li i { font-style: normal; color: #8d93a0; font-size: 20px; }
        li.out { color: #f87171; }
      `}</style>
    </div>
  )
}
