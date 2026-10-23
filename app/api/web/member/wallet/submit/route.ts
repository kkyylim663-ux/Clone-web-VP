import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { MEMBER_BALANCE, checkWallet } from '@/lib/mock/member'

// 存款 / 提款 / 存款凭证提交（mock）。校验同前端；提现金额超过余额（mock 余额 0.00）返回 1011。
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { kind?: string, currency?: string, network?: string, amount?: string, address?: string, txid?: string, name?: string }
  const kind = b.kind ?? ''
  if (!['deposit', 'withdraw', 'proof'].includes(kind)) return NextResponse.json(fail(1002, 'invalid_params'))
  if (Object.keys(checkWallet(kind, b)).length) return NextResponse.json(fail(1002, 'invalid_params'))
  if (kind === 'withdraw' && Number(b.amount) > Number(MEMBER_BALANCE)) return NextResponse.json(fail(1011, 'insufficient_balance'))
  return NextResponse.json(ok({ orderId: `MOCK-${Date.now()}` }))
}
