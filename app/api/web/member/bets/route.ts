import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { MOCK_BETS } from '@/lib/mock/member'

// 投注记录（mock）：tab 为 casino | sports；日期 YYYY-MM-DD，起不晚于止，跨度 ≤ 31 天。默认空列表。
const DAY = 86400000
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { tab?: string, from?: string, to?: string, demo?: string }
  if (b.tab !== 'casino' && b.tab !== 'sports') return NextResponse.json(fail(1002, 'invalid_params'))
  const from = Date.parse(b.from ?? ''), to = Date.parse(b.to ?? '')
  if (Number.isNaN(from) || Number.isNaN(to) || from > to || (to - from) / DAY > 31) return NextResponse.json(fail(1002, 'invalid_params'))
  const rows = b.demo === 'data' ? MOCK_BETS.filter((r) => r.tab === b.tab) : []
  return NextResponse.json(ok(rows))
}
