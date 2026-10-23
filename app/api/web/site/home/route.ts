import { NextResponse } from 'next/server'
import { ok, MOCK_BANNERS, MOCK_GAMES, MOCK_WINS } from '@/lib/mock/data'
import { MOCK_AIRDROP_AMOUNT } from '@/lib/mock/browse'

// mock 首页数据：横幅、热门游戏、近期大赢家；全部带 translations，前端 pickLang 挑语言
export async function POST() {
  return NextResponse.json(ok({ banners: MOCK_BANNERS, popular: MOCK_GAMES.slice(0, 60), wins: MOCK_WINS, online: 6700, airdropAmount: MOCK_AIRDROP_AMOUNT }))
}
