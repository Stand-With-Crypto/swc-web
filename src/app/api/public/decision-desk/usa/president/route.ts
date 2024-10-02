import 'server-only'

import { NextResponse } from 'next/server'

import { fetchRacesData } from '@/data/decisionDesk/services'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['2_MINUTES']

export async function GET() {
  const data = await fetchRacesData({
    race_date: '2020-11-03',
    election_type_id: '1',
    year: '2020',
    limit: '125',
    office_id: '1',
  })

  return NextResponse.json(data)
}
