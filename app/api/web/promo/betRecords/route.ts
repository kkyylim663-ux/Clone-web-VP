import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { BET_RECORDS } from '@/lib/mock/promo'

export async function POST() {
  return NextResponse.json(ok({ list: BET_RECORDS }))
}
