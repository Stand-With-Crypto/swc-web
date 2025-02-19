import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPollsVotesFromUser } from '@/data/polls/getPollsData'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'

const zodPayload = z.object({
  userId: z.string(),
})

export const GET = withRouteMiddleware(async (request: NextRequest) => {
  const validatedFields = zodPayload.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!validatedFields.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { userId } = validatedFields.data

  const pollVote = await getPollsVotesFromUser(userId)

  if (!pollVote) {
    return NextResponse.json(
      {
        error: 'Poll vote not found',
      },
      { status: 404 },
    )
  }

  return NextResponse.json(pollVote)
})
