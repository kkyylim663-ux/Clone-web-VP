import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { MOCK_BLACKLIST } from '@/lib/mock/member'

// 黑名单（mock）：默认空列表（与参考站取证一致）；demo=data 返回样例
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { demo?: string }
  return NextResponse.json(ok(b.demo === 'data' ? MOCK_BLACKLIST : []))
}
