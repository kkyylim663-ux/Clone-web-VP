import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'

// mock：结构与参考站 /api/web/currencyRatio/list 一致
export async function POST() {
  return NextResponse.json(ok([{ currency: 'USDT', currencyRealname: 'USDT', value: '1' }, { currency: 'MYR', currencyRealname: 'MYR', value: '4.0775' }]))
}
