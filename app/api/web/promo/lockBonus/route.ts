import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { LOCK_BONUS } from '@/lib/mock/promo'

export async function POST() {
  return NextResponse.json(ok(LOCK_BONUS))
}
