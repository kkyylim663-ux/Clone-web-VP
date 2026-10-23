import { NextResponse } from 'next/server'
import { ok } from '@/lib/mock/data'
import { MOCK_PROVIDER_NAMES, providerSlug, providerLogo } from '@/lib/mock/browse'

// mock 供应商列表：name 与游戏的 provider 字段一致，slug 用于分组页路由
export async function POST() {
  return NextResponse.json(ok({ list: MOCK_PROVIDER_NAMES.map(name => ({ slug: providerSlug(name), name, logo: providerLogo(name) })) }))
}
