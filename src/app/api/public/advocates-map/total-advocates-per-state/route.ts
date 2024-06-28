import 'server-only'

import { NextResponse } from 'next/server'

import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['30_SECONDS']

export async function GET() {
  const data = await getAdvocatesMapData()

  return NextResponse.json(data)
}
