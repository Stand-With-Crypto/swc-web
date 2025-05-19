import 'server-only'

import { NextResponse } from 'next/server'

import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

export async function GET() {
  const data = await getAdvocatesMapData()

  return NextResponse.json(data)
}
