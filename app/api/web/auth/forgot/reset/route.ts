import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { MOCK_CODE, PASSWORD_MIN, isAccount } from '@/lib/mock/auth'

// 忘记密码 第 3 步：设置新密码。密码太短 → 1002；验证码错 → 1004。
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { account?: unknown, code?: unknown, password?: unknown }
  if (!isAccount(b.account) || typeof b.password !== 'string' || b.password.length < PASSWORD_MIN) return NextResponse.json(fail(1002, 'invalid_params'))
  if (b.code !== MOCK_CODE) return NextResponse.json(fail(1004, 'code_wrong'))
  return NextResponse.json(ok({ reset: true }))
}
