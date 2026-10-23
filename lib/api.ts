// 全站唯一的请求出口（对应 BOSS 的 lib/api）。
// NEXT_PUBLIC_API_BASE 为空 → 走本项目 app/api 的 mock；填了 → 走真后端（TTXbo）。字段形状两边一致。
export interface ApiEnvelope<T> { code: number, message?: string, data: T }

export class ApiError extends Error {
  constructor(public code: number, message: string) { super(message) }
}

const base = process.env.NEXT_PUBLIC_API_BASE || ''

export async function post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}), credentials: 'include' })
  const json = (await res.json()) as ApiEnvelope<T>
  if (json.code !== 0) throw new ApiError(json.code, json.message || `api ${path} code ${json.code}`)
  return json.data
}
