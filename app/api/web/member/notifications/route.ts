import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { MOCK_NOTIFICATIONS } from '@/lib/mock/member'

// 通知列表（mock）：默认空（参考站账号为空）；demo=data 返回样例（多语言 translations）
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { demo?: string }
  return NextResponse.json(ok(b.demo === 'data' ? MOCK_NOTIFICATIONS : []))
}
