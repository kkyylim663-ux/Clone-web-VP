import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { AVATAR_COUNT } from '@/lib/mock/member'

// 头像设置（mock）：avatarId 为 1..AVATAR_COUNT 的整数
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { avatarId?: number }
  const id = b.avatarId
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 1 || id > AVATAR_COUNT) return NextResponse.json(fail(1002, 'invalid_params'))
  return NextResponse.json(ok({ avatarId: id }))
}
