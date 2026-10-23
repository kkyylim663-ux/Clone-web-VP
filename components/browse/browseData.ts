'use client'
// browse 组共用：接口取数、语言挑选、真筛选辅助、收藏/最近玩（localStorage）、悬停动效、游戏打开守卫。
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCached, peek } from '@/lib/queryCache'
import { pickLang, type Translations } from '@/lib/pickLang'
import type { ApiGame } from '@/lib/types'
import { useGate } from '@/lib/useGate'
import { providerSlug } from '@/lib/mock/browse'

/** 「加载更多」每次增加的条数 */
export const PAGE_SIZE = 24
/** 收藏 / 最近玩：本地存储，只存 slug 列表（同一账户名下的前端记录，不上传） */
export const FAV_KEY = 'vp_fav'
export const RECENT_KEY = 'vp_recent'
/** 搜索防抖（毫秒） */
export const DEBOUNCE_MS = 300
const LIST_EVENT = 'vp-browse-list'

export interface GamesResp { list: ApiGame[], total: number }
export interface ApiCategory { key: string, translations: Translations<{ name: string }> }
export interface ApiProvider { slug: string, name: string, logo?: string }

export type Phase = 'ok' | 'loading' | 'empty' | 'error'
/** 状态：?state= 演示参数优先，其次真实请求状态（加载中 / 出错 / 空） */
export function phaseOf(st: string, pending: boolean, failed: boolean, empty: boolean): Phase {
  if (st === 'loading' || st === 'empty' || st === 'error') return st
  if (pending) return 'loading'
  if (failed) return 'error'
  if (empty) return 'empty'
  return 'ok'
}

/** 定长数组：不够的位置为 undefined（加载中显示占位块） */
export const fill = <T,>(arr: T[] | undefined, n: number, from = 0): (T | undefined)[] => Array.from({ length: n }, (_, i) => arr?.[from + i])

export const gameName = (g: ApiGame | undefined, lang: string) => pickLang(g?.translations, lang)?.name ?? g?.slug ?? ''
export const catName = (c: ApiCategory | undefined, lang: string) => pickLang(c?.translations, lang)?.name ?? c?.key ?? ''
export const provSlug = providerSlug

/** 通用取数：path + body 变化即重新请求；reload 重试；请求中保留上一份数据（筛选切换不闪） */
export function useRemote<T>(path: string, body: Record<string, unknown>) {
  const [tick, setTick] = useState(0)
  const key = JSON.stringify([path, body])
  // 有缓存先用缓存（不出现加载中），后台再取新的
  const [s, setS] = useState<{ data: T | null, loading: boolean, error: boolean }>(() => {
    const c = peek<T>(path, body)
    return { data: c ?? null, loading: c === undefined, error: false }
  })
  useEffect(() => {
    let alive = true
    const c = peek<T>(path, body)
    setS(p => ({ data: c ?? p.data, loading: c === undefined, error: false }))
    fetchCached<T>(path, body).then(
      d => { if (alive) setS({ data: d, loading: false, error: false }) },
      () => { if (alive) setS({ data: null, loading: false, error: true }) }
    )
    return () => { alive = false }
    // key 已包含 path 与 body
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick])
  const reload = useCallback(() => setTick(x => x + 1), [])
  return { ...s, reload }
}

/** 本地列表（收藏 / 最近玩）。挂载后读 localStorage（避免 SSR 不一致）；多处同时使用时通过事件同步 */
function readList(key: string): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch { return [] }
}
function writeList(key: string, list: string[]) {
  try { window.localStorage.setItem(key, JSON.stringify(list)) } catch { /* 隐私模式写入失败：忽略，界面仍可用 */ }
  window.dispatchEvent(new Event(LIST_EVENT))
}
/** 记录最近玩，最多 30 条 */
export function addRecent(slug: string) {
  writeList(RECENT_KEY, [slug, ...readList(RECENT_KEY).filter(s => s !== slug)].slice(0, 30))
}
export function useLocalList(key: string) {
  const [list, setList] = useState<string[]>([])
  useEffect(() => {
    const sync = () => setList(readList(key))
    sync()
    window.addEventListener(LIST_EVENT, sync)
    return () => window.removeEventListener(LIST_EVENT, sync)
  }, [key])
  /** 切换收藏，返回切换后是否已收藏 */
  const toggle = useCallback((slug: string) => {
    const cur = readList(key)
    const next = cur.includes(slug) ? cur.filter(s => s !== slug) : [slug, ...cur]
    writeList(key, next)
    return next.includes(slug)
  }, [key])
  return { list, toggle }
}

/** 游戏卡点击：真钱游戏未登录先去登录（不执行动作）；已登录记入最近玩并进详情 */
export function usePlay() {
  const router = useRouter()
  const { guard } = useGate()
  return useCallback((slug: string) => guard('play', () => { addRecent(slug); router.push(`/casino/games/${slug}`) }), [guard, router])
}

/** 游戏卡悬停：mo-preview-in（350ms，文档：interactions.md e）。用法：<div className={cls('k', 'gc')} {...on('k')} />（className 必须是表达式，styled-jsx 才能加作用域类名） */
export function useHover() {
  const [hov, setHov] = useState('')
  const cls = (k: string, base = '') => [base, hov === k ? 'mo-preview-in' : ''].filter(Boolean).join(' ')
  const on = (k: string) => ({ onMouseEnter: () => setHov(k), onMouseLeave: () => setHov('') })
  return { cls, on }
}

