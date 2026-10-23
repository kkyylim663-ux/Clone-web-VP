import { NextResponse } from 'next/server'
import { ok, MOCK_VIP_LEVELS } from '@/lib/mock/data'

export async function POST() { return NextResponse.json(ok({ list: MOCK_VIP_LEVELS })) }
