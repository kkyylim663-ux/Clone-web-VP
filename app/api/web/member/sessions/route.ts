import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { MOCK_SESSIONS } from '@/lib/mock/member'

// 登录设备列表（mock）。不返回真实 IP：只给占位串。
export async function POST() {
  return NextResponse.json(ok(MOCK_SESSIONS))
}
