import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { REFER_SUMMARY } from '@/lib/mock/promo'

// 推荐赚钱概览：邀请码、可领取金额、下线列表（金额字符串）
export async function POST() {
  return NextResponse.json(ok(REFER_SUMMARY))
}
