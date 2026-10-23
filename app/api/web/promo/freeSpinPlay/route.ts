import { NextResponse } from 'next/server'
import { ok, fail } from '@/lib/mock/data'

// 免费旋转一次：body { left }（前端当前剩余次数）。没有次数返回业务错误；中奖金额为 mock 固定值
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { left?: number }
  if (!body.left || body.left < 1) return NextResponse.json(fail(2001, 'no spins left'))
  return NextResponse.json(ok({ win: '5.00', left: body.left - 1 }))
}
