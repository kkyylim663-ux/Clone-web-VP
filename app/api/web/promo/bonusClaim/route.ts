import { NextResponse } from 'next/server'
import { ok, fail } from '@/lib/mock/data'
import { BONUS_ITEMS } from '@/lib/mock/promo'

// 领取奖金：body { id }。只有 claimable 才能领；其余返回业务错误码（前端 toast 提示）
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: number }
  const item = BONUS_ITEMS.find((b) => b.id === body.id)
  if (!item) return NextResponse.json(fail(404, 'bonus not found'))
  if (item.status !== 'claimable') return NextResponse.json(fail(1001, 'bonus not claimable'))
  return NextResponse.json(ok({ id: item.id, status: 'claimed', amount: item.amount }))
}
