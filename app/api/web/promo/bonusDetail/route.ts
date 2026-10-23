import { NextResponse } from 'next/server'
import { ok, fail } from '@/lib/mock/data'
import { BONUS_DETAIL, BONUS_ITEMS } from '@/lib/mock/promo'

// 奖金详情：body { id }
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: number }
  const item = BONUS_ITEMS.find((b) => b.id === (body.id ?? BONUS_DETAIL.id))
  if (!item) return NextResponse.json(fail(404, 'bonus not found'))
  return NextResponse.json(ok({ ...BONUS_DETAIL, id: item.id, amount: item.amount, status: item.status }))
}
