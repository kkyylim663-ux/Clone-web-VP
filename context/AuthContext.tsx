'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SESSION_COOKIE } from '@/config/languages'
import { post } from '@/lib/api'
import { clearQueryCache } from '@/lib/queryCache'
import type { ApiAuthResult, ApiBalance, ApiUser } from '@/lib/types'

// 假登录（对应 BOSS 的 AuthContext）：登录态 = cookie vp_session；用户与余额放 state。
// 参考站没有路由层登录守卫：页内判断 isLogin，未登录用 useGate().enterLogin 跳 /login?page=来源。
interface Ctx {
  loggedIn: boolean, user: ApiUser | null, balance: ApiBalance | null, ready: boolean
  login: (account: string, password: string) => Promise<void>
  register: (account: string, password: string, agree: boolean) => Promise<void>
  logout: () => void
  /** 设置头像（1..8）：全站即时更新，并记在本机（mock 接口不落库） */
  setAvatar: (id: number) => void
  /** 骨架演示开关：直接置位/清除登录态 */
  setDemoLogin: (v: boolean) => void
  /** 登录成功后的去向：originRouteName || redirect || 首页，用 replace（对应参考站 index.js） */
  goAfterLogin: () => void
}
const AuthContext = createContext<Ctx | null>(null)

const AVATAR_KEY = 'vp_avatar'
// 用本机记下的头像覆盖接口返回值（刷新后保持）
const withAvatar = (u: ApiUser): ApiUser => { try { const a = localStorage.getItem(AVATAR_KEY); return a ? { ...u, avatar: a } : u } catch { return u } }
const writeCookie = (v: string | null) => {
  document.cookie = v ? `${SESSION_COOKIE}=${v}; path=/; max-age=604800; samesite=lax` : `${SESSION_COOKIE}=; path=/; max-age=0`
}

export function AuthProvider({ initialSession, children }: { initialSession: boolean, children: React.ReactNode }) {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(initialSession)
  const [user, setUser] = useState<ApiUser | null>(null)
  const [balance, setBalance] = useState<ApiBalance | null>(null)
  const [ready, setReady] = useState(false)

  const apply = useCallback((r: ApiAuthResult) => { writeCookie(r.token); setLoggedIn(true); setUser(withAvatar(r.user)); setBalance(r.balance) }, [])
  const setAvatar = useCallback((id: number) => { try { localStorage.setItem(AVATAR_KEY, String(id)) } catch { /* 无痕等环境 */ } setUser((u) => (u ? { ...u, avatar: String(id) } : u)) }, [])
  const login = useCallback(async (a: string, p: string) => { apply(await post<ApiAuthResult>('/api/web/auth/login', { account: a, password: p })) }, [apply])
  const register = useCallback(async (a: string, p: string, agree: boolean) => { apply(await post<ApiAuthResult>('/api/web/auth/register', { account: a, password: p, agree })) }, [apply])
  const logout = useCallback(() => { clearQueryCache(); writeCookie(null); setLoggedIn(false); setUser(null); setBalance(null); router.push('/') }, [router])
  const setDemoLogin = useCallback((v: boolean) => { writeCookie(v ? 'demo' : null); setLoggedIn(v); if (!v) { setUser(null); setBalance(null) } }, [])
  const goAfterLogin = useCallback(() => {
    const q = new URLSearchParams(window.location.search)
    const to = q.get('originRouteName') || q.get('redirect') || '/'
    router.replace(to.startsWith('/') ? to : '/')
  }, [router])

  // 刷新后用 cookie 拉回用户资料
  useEffect(() => {
    let alive = true
    if (loggedIn && !user) post<{ user: ApiUser, balance: ApiBalance }>('/api/web/auth/me').then((r) => { if (alive) { setUser(withAvatar(r.user)); setBalance(r.balance) } }).catch(() => { if (alive) { writeCookie(null); setLoggedIn(false) } }).finally(() => alive && setReady(true))
    else setReady(true)
    return () => { alive = false }
  }, [loggedIn, user])

  const value = useMemo(() => ({ loggedIn, user, balance, ready, login, register, logout, setAvatar, setDemoLogin, goAfterLogin }), [loggedIn, user, balance, ready, login, register, logout, setDemoLogin, goAfterLogin])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}
// useSearchParams 留给页面按需使用（登录页读 ?page=）
export { useSearchParams }
