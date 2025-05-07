import { NextResponse } from 'next/server'

import { getPollsResultsData } from '@/data/polls/getPollsData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 60 // 60 seconds

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode } = await params

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)

  if (!validatedFields.success) {
    return NextResponse.json(
      {
        error: 'Country code is required',
      },
      { status: 400 },
    )
  }

  const pollsVotesData = await getPollsResultsData({
    countryCode: validatedFields.data,
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
