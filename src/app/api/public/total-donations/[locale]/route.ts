import 'server-only'

import { NextResponse } from 'next/server'

import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.SECOND * 30

export async function GET() {
  const data = await getSumDonations({ includeFairshake: true })
  return NextResponse.json(data)
}
