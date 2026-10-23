import { NextResponse } from 'next/server'
import { ok, fail } from '@/lib/mock/data'
import { REFER_SUMMARY } from '@/lib/mock/promo'

// 领取推荐奖励：无可领金额时返回业务错误
export async function POST() {
  if (REFER_SUMMARY.claimable === '0.00') return NextResponse.json(fail(1002, 'nothing to claim'))
  return NextResponse.json(ok({ claimed: REFER_SUMMARY.claimable }))
}
