import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { MOCK_CATEGORIES } from '@/lib/mock/browse'

// mock 赌场分类：key 对应游戏的 category；名称带 translations，前端 pickLang 挑语言
export async function POST() {
  return NextResponse.json(ok({ list: MOCK_CATEGORIES }))
}
