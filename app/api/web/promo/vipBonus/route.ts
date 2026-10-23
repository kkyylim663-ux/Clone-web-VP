import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { VIP_BONUS_USDT } from '@/lib/mock/promo'

export async function POST() {
  return NextResponse.json(ok({ list: VIP_BONUS_USDT.map((bonusUsdt, level) => ({ level, bonusUsdt })) }))
}
