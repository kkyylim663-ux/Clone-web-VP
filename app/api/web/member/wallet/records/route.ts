import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { MOCK_RECORDS } from '@/lib/mock/member'

// 钱包记录（mock）：默认空；demo=data 返回样例
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { demo?: string }
  return NextResponse.json(ok(b.demo === 'data' ? MOCK_RECORDS : []))
}
