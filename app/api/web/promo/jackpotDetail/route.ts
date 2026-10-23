import { NextResponse } from 'next/server'
import { ok, fail } from '@/lib/mock/data'
import { buildJackpotPools, JACKPOT_WINNERS } from '@/lib/mock/promo'

// 奖池详情：body { key: 'A' | 'B' | 'C' }
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { key?: string }
  const pool = buildJackpotPools().find((p) => p.key === (body.key ?? 'A'))
  if (!pool) return NextResponse.json(fail(404, 'pool not found'))
  return NextResponse.json(ok({ pool, rows: JACKPOT_WINNERS }))
}
