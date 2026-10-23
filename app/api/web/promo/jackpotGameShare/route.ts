import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import type { ApiJackpotGameShare } from '@/lib/types'

// 奖池分享海报 mock：金额为字符串；未开奖时 rank 为 0、金额 '0'
const DATA: ApiJackpotGameShare = { rank: 0, amount: '0', currency: 'MYR' }

export async function POST() {
  return NextResponse.json(ok(DATA))
}
