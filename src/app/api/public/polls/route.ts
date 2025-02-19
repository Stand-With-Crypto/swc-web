import { NextResponse } from 'next/server'

import { getPollsResultsData } from '@/data/polls/getPollsData'

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
