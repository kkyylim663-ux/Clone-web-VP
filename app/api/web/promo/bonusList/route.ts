import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { BONUS_ITEMS } from '@/lib/mock/promo'

export async function POST() {
  return NextResponse.json(ok({ items: BONUS_ITEMS }))
}
