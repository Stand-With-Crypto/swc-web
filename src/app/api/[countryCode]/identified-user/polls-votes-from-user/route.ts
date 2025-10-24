import { NextResponse } from 'next/server'

import { getPollsVotesFromUser } from '@/data/polls/getPollsData'
import { getAuthUser } from '@/utils/server/authentication/getAuthUser'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const dynamic = 'force-dynamic'

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

export const GET = withRouteMiddleware(async (_: Request, { params }: RequestContext) => {
  const { countryCode } = await params

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)

  if (!validatedFields.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const authUser = await getAuthUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pollVotes = await getPollsVotesFromUser({
    userId: authUser.userId,
    countryCode: validatedFields.data,
  })

  if (!pollVotes) {
    return NextResponse.json(
      {
        error: 'Poll vote not found',
      },
      { status: 404 },
    )
  }

  return NextResponse.json(pollVotes)
})
