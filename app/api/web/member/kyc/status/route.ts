import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'

// KYC 状态（mock）：默认未完成 Level 1，Level 2 锁定。完成后的状态由前端 localStorage 记住。
export async function POST() {
  return NextResponse.json(ok({ level1: false }))
}
