// 接口结果的内存缓存（先显示上次结果，后台再取新的）：
// - peek：同步读缓存，取数钩子用它做初始值，有缓存就不显示「加载中」
// - fetchCached：真正发请求并写缓存；同一个接口正在请求时复用同一个 Promise，不重复发
// - prefetchPost：空闲时提前把数据取进缓存（没缓存才取）
// - clearQueryCache：退出登录时清空，避免下一个账号看到上一个账号的数据
import { post } from '@/lib/api'

const store = new Map<string, unknown>()
const inflight = new Map<string, Promise<unknown>>()

const keyOf = (path: string, body: Record<string, unknown> = {}) => `${path}|${JSON.stringify(body)}`

export function peek<T>(path: string, body?: Record<string, unknown>): T | undefined {
  return store.get(keyOf(path, body)) as T | undefined
}

export function fetchCached<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const k = keyOf(path, body)
  const running = inflight.get(k)
  if (running) return running as Promise<T>
  const p = post<T>(path, body)
    .then((d) => { store.set(k, d); return d })
    .finally(() => { inflight.delete(k) })
  inflight.set(k, p)
  return p
}

export function prefetchPost(path: string, body: Record<string, unknown> = {}) {
  if (!store.has(keyOf(path, body))) fetchCached(path, body).catch(() => undefined)
}

export function clearQueryCache() {
  store.clear()
}
