'use client'
import { useCallback, useEffect, useState } from 'react'
import { fetchCached, peek } from '@/lib/queryCache'

/**
 * 拉取一个 promo 接口（POST）。
 * data 为 null 且 error 为 false 时即「加载中」（reload 不会把已有数据清空，避免骨架闪烁）。
 * 有缓存时先用缓存（不出现加载中），后台再取新的。
 */
export function usePromoData<T>(path: string, body: Record<string, unknown> = {}) {
  const [data, setData] = useState<T | null>(() => peek<T>(path, body) ?? null)
  const [error, setError] = useState(false)
  const [tick, setTick] = useState(0)
  const bodyKey = JSON.stringify(body)

  useEffect(() => {
    let alive = true
    setError(false)
    fetchCached<T>(path, JSON.parse(bodyKey) as Record<string, unknown>)
      .then((d) => { if (alive) setData(d) })
      .catch(() => { if (alive) setError(true) })
    return () => { alive = false }
  }, [path, bodyKey, tick])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { data, setData, error, loading: data === null && !error, reload }
}
