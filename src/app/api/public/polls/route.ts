import { NextRequest, NextResponse } from 'next/server'

import { getPollsResultsData } from '@/data/polls/getPollsData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 60 seconds

export async function GET(request: NextRequest) {
  const countryCode = request.nextUrl.searchParams.get('countryCode')

  if (!countryCode) {
    return NextResponse.json(
      {
        error: 'Country code is required',
      },
      { status: 400 },
    )
  }

  const pollsVotesData = await getPollsResultsData({
    countryCode: countryCode as SupportedCountryCodes,
  })

  if (!pollsVotesData) {
    return NextResponse.json(
      {
        error: 'Poll results data not found',
      },
      { status: 404 },
    )
  }

  return NextResponse.json(pollsVotesData)
}
