import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { fail, ok, MOCK_USER } from '@/lib/mock/data'
import { SESSION_COOKIE } from '@/config/languages'

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return NextResponse.json(token ? ok({ user: MOCK_USER, balance: { currency: 'MYR', available: '0.00' } }) : fail(401, 'unauthorized'))
}
