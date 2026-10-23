import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { FREE_SPIN } from '@/lib/mock/promo'

export async function POST() {
  return NextResponse.json(ok(FREE_SPIN))
}
