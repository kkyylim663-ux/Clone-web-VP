import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'

// 体育容器会话启动（mock 恒成功；失败态用 ?state=error 演示）
export async function POST() {
  return NextResponse.json(ok({ ready: true }))
}
