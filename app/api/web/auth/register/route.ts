import { NextResponse } from 'next/server'
import { fail, ok, MOCK_USER } from '@/lib/mock/data'

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { account?: string, password?: string, agree?: boolean }
  if (!b.account || !b.password || b.password.length < 6) return NextResponse.json(fail(1002, 'invalid_params'))
  if (!b.agree) return NextResponse.json(fail(1003, 'terms_required'))
  return NextResponse.json(ok({ token: `mock-${Date.now()}`, user: { ...MOCK_USER, account: b.account }, balance: { currency: 'MYR', available: '0.00' } }))
}
