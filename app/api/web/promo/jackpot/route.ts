import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { buildJackpotPools } from '@/lib/mock/promo'

// 奖池总览：每次请求按当前时间算出下一个周期的截止时刻
export async function POST() {
  return NextResponse.json(ok({ pools: buildJackpotPools(), serverTime: Date.now() }))
}
