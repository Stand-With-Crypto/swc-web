import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPollsVotesFromUser } from '@/data/polls/getPollsData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 30 // 30 seconds

const zodPayload = z.object({
  userId: z.string(),
  countryCode: z.nativeEnum(SupportedCountryCodes),
})

export async function GET(request: NextRequest) {
  const validatedFields = zodPayload.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!validatedFields.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { userId, countryCode } = validatedFields.data

  const pollVote = await getPollsVotesFromUser({ userId, countryCode })

  if (!pollVote) {
    return NextResponse.json(
      {
        error: 'Poll vote not found',
      },
      { status: 404 },
    )
  }

  return NextResponse.json(pollVote)
}
