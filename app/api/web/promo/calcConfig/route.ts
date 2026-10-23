import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { CALC_CONFIG } from '@/lib/mock/promo'

// 佣金计算器配置：比例、里程碑、汇率。计算本身在前端完成（components/promo/referralCalc.ts）
export async function POST() {
  return NextResponse.json(ok(CALC_CONFIG))
}
