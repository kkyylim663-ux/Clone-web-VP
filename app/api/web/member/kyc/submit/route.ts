import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/mock/data'
import { ID_TYPES, checkKyc1 } from '@/lib/mock/member'

// KYC 提交（mock）：level=1 校验资料；level=2 需证件类型合法、正反面文件名存在
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { level?: number, form?: Record<string, string> }
  const f = b.form ?? {}
  if (b.level === 1) {
    if (Object.keys(checkKyc1(f)).length) return NextResponse.json(fail(1002, 'invalid_params'))
    return NextResponse.json(ok({ status: 'pending' }))
  }
  if (b.level === 2) {
    if (!(ID_TYPES as readonly string[]).includes(f.idType ?? '') || !f.frontName || !f.backName) return NextResponse.json(fail(1002, 'invalid_params'))
    return NextResponse.json(ok({ status: 'pending' }))
  }
  return NextResponse.json(fail(1002, 'invalid_params'))
}
