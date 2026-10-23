'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { WalletView } from '@/components/skeleton/money/WalletHead'

// 布局壳的全局界面状态（对应 Nuxt 的 useLayoutState）
interface Ctx {
  drawerOpen: boolean, setDrawerOpen: (v: boolean) => void // 手机：左侧抽屉
  walletOpen: boolean, setWalletOpen: (v: boolean) => void // 钱包面板（右侧滑出，URL 不变）
  walletView: WalletView, setWalletView: (v: WalletView) => void // 钱包面板当前页签（存款 / 提现 / 记录）
  sessionExpired: boolean, setSessionExpired: (v: boolean) => void // 会话过期弹窗
  downloadBar: boolean, setDownloadBar: (v: boolean) => void // 顶部下载条（默认隐藏）
  supportOpen: boolean, setSupportOpen: (v: boolean) => void // 客服弹窗
  sideCollapsed: boolean, setSideCollapsed: (v: boolean) => void // 桌面：侧栏收起为 73px 图标栏
  shareOpen: boolean, setShareOpen: (v: boolean) => void // 奖池分享弹窗（Bonus Share）
  toast: string, showToast: (msg: string) => void
}
const LayoutContext = createContext<Ctx | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [walletView, setWalletView] = useState<WalletView>('deposit')
  const [sessionExpired, setSessionExpired] = useState(false)
  const [downloadBar, setDownloadBar] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [sideCollapsed, setSideCollapsed] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2200) }, [])
  const value = useMemo(() => ({ drawerOpen, setDrawerOpen, walletOpen, setWalletOpen, walletView, setWalletView, sessionExpired, setSessionExpired, downloadBar, setDownloadBar, supportOpen, setSupportOpen, sideCollapsed, setSideCollapsed, shareOpen, setShareOpen, toast, showToast }),
    [drawerOpen, walletOpen, walletView, sessionExpired, downloadBar, supportOpen, sideCollapsed, shareOpen, toast, showToast])
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const c = useContext(LayoutContext)
  if (!c) throw new Error('useLayout must be used inside LayoutProvider')
  return c
}
