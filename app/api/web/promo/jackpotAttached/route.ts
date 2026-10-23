import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { JACKPOT_ATTACHED } from '@/lib/mock/promo'

export async function POST() {
  return NextResponse.json(ok(JACKPOT_ATTACHED))
}
