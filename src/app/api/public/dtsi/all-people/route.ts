import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NextResponse } from 'next/server'
import 'server-only'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.DAY

export async function GET() {
  const data = await queryDTSIAllPeople()
  return NextResponse.json(data)
}
