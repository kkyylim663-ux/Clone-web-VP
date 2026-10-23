import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { checkPassword } from '@/lib/mock/member'

// 改密（mock）：新密码需 ≥8 位且含字母+数字；旧密码 wrong123 模拟「旧密码错误」（1001）
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { oldPassword?: string, newPassword?: string }
  if (!b.oldPassword || !b.newPassword || !checkPassword(b.newPassword)) return NextResponse.json(fail(1002, 'invalid_params'))
  if (b.oldPassword === 'wrong123') return NextResponse.json(fail(1001, 'wrong_old_password'))
  return NextResponse.json(ok({}))
}
