import { NextResponse } from 'next/server'

import { getPollsResultsData } from '@/data/polls/getPollsData'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

export async function GET() {
  const pollsVotesData = await getPollsResultsData()

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
