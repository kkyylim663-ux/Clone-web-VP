import { NextResponse } from 'next/server'
import { ok, MOCK_PROMOTIONS } from '@/lib/mock/data'

export async function POST() { return NextResponse.json(ok({ list: MOCK_PROMOTIONS })) }
