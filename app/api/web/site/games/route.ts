import { NextResponse } from 'next/server'
import { ok, MOCK_GAMES } from '@/lib/mock/data'

interface Q { provider?: string, category?: string, q?: string }
export async function POST(req: Request) {
  const b = ((await req.json().catch(() => ({}))) || {}) as Q
  const q = (b.q || '').toLowerCase()
  const list = MOCK_GAMES.filter(g =>
    (!b.provider || g.provider === b.provider)
    && (!b.category || g.category === b.category)
    && (!q || g.translations.en.name.toLowerCase().includes(q) || g.translations.zh.name.includes(q)))
  return NextResponse.json(ok({ list, total: list.length }))
}
