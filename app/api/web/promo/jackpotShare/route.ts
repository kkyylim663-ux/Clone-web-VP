import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { JACKPOT_SHARE } from '@/lib/mock/promo'

export async function POST() {
  return NextResponse.json(ok({ list: JACKPOT_SHARE }))
}
