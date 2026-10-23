import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { MOCK_CODE, isAccount } from '@/lib/mock/auth'

// 忘记密码 第 2 步：校验验证码。错误码 → 1004。
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { account?: unknown, code?: unknown }
  if (!isAccount(b.account)) return NextResponse.json(fail(1002, 'invalid_params'))
  if (b.code !== MOCK_CODE) return NextResponse.json(fail(1004, 'code_wrong'))
  return NextResponse.json(ok({ verified: true }))
}
