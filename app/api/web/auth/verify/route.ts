import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { MOCK_CODE, isEmail } from '@/lib/mock/auth'

// 账户验证页提交：邮箱格式 + 验证码。格式错 → 1002；验证码错 → 1004。
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { email?: unknown, code?: unknown }
  if (typeof b.email !== 'string' || !isEmail(b.email)) return NextResponse.json(fail(1002, 'invalid_params'))
  if (b.code !== MOCK_CODE) return NextResponse.json(fail(1004, 'code_wrong'))
  return NextResponse.json(ok({ verified: true }))
}
