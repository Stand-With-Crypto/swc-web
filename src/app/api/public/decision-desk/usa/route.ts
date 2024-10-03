import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { getRacesVotingData } from '@/data/aggregations/getRacesVotingData'
import { GetRacesParamsSchema } from '@/data/decisionDesk/schemas'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'auto'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams
  const paramsObject = Object.fromEntries(searchParams.entries())

  const validationResult = GetRacesParamsSchema.safeParse(paramsObject)

  if (!validationResult.success) {
    return NextResponse.json({
      status: 500,
      error: validationResult.error,
    })
  }

  const data = await getRacesVotingData(validationResult.data)

  return NextResponse.json(data)
}
