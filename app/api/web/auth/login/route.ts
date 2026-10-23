import { NextResponse } from 'next/server'
import { fail, ok, MOCK_USER } from '@/lib/mock/data'

// mock 登录：账号非空且密码 ≥6 位即成功；密码 wrong123 模拟失败。真后端对接时换 NEXT_PUBLIC_API_BASE。
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { account?: string, password?: string }
  if (!b.account || !b.password || b.password.length < 6) return NextResponse.json(fail(1002, 'invalid_params'))
  if (b.password === 'wrong123') return NextResponse.json(fail(1001, 'wrong_password'))
  return NextResponse.json(ok({ token: `mock-${Date.now()}`, user: { ...MOCK_USER, account: b.account }, balance: { currency: 'MYR', available: '0.00' } }))
}
