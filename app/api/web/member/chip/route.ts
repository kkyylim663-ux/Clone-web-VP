import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { CHIP_CURRENCIES, DEFAULT_CHIP } from '@/lib/mock/member'

// 筹码币种（mock）：不传 currency 返回当前值；传入须在可选列表内。
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { currency?: string }
  if (b.currency === undefined) return NextResponse.json(ok({ currency: DEFAULT_CHIP }))
  if (!(CHIP_CURRENCIES as readonly string[]).includes(b.currency)) return NextResponse.json(fail(1002, 'invalid_params'))
  return NextResponse.json(ok({ currency: b.currency }))
}
