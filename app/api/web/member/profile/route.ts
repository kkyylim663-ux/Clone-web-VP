import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { MEMBER_BALANCE, MEMBER_PROFILE } from '@/lib/mock/member'

// 会员资料 + 统计（mock）：经验 0/50，统计均为 0.00
export async function POST() {
  return NextResponse.json(ok({ ...MEMBER_PROFILE, balance: { currency: 'MYR', available: MEMBER_BALANCE } }))
}
