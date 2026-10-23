'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { navCount } from '@/lib/navCount'
import { navPush } from '@/lib/navProgress'

// 登录守卫 + 通用跳转（对应参考站 enterLogin/enterRegister；参考站没有路由层守卫，只在组件里判断 isLogin）
// 规则（docs/nav-map/handlers-static.md §0、§6）：
//  - 未登录点受保护入口：不执行动作，push /login，query.page=来源；通用入口不带回跳，只有游戏/奖金入口带 redirect
//  - 登录/注册页已登录也能打开，不会被重定向
export type GateSource = 'header' | 'sidebar' | 'home' | 'play' | 'sport' | 'wallet' | 'chat' | 'game' | 'bonus'

export function useGate() {
  const router = useRouter()
  const { loggedIn } = useAuth()

  const enterLogin = (source: GateSource, extra?: Record<string, string>) => {
    const q = new URLSearchParams({ page: source, ...extra })
    navPush(router, `/login?${q.toString()}`)
  }
  const enterRegister = (source: GateSource) => navPush(router, `/register?page=${source}`)
  /** 已登录执行 action；未登录跳登录（带来源），不执行 action */
  const guard = (source: GateSource, action: () => unknown, extra?: Record<string, string>) => (loggedIn ? action() : enterLogin(source, extra))
  /** 通用跳转；需要登录的传 source */
  const go = (to: string, source?: GateSource) => (source && !loggedIn ? enterLogin(source) : navPush(router, to))
  /** 返回：站内没有上一页（直接打开/刷新）就回首页，否则 back（对应参考站 gameBackFn/navBar 的「无历史回首页」） */
  const back = () => {
    if (navCount.value > 0) router.back(); else navPush(router, '/')
  }
  return { loggedIn, enterLogin, enterRegister, guard, go, back }
}
