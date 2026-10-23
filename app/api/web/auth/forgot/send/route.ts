import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { isAccount } from '@/lib/mock/auth'

// 忘记密码 第 1 步：发送验证码（mock，不真发）。账号格式不对 → 1002。
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { account?: unknown }
  if (!isAccount(b.account)) return NextResponse.json(fail(1002, 'invalid_params'))
  return NextResponse.json(ok({ sent: true }))
}
