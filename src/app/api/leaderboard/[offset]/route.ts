import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/data/leaderboard'
import { z } from 'zod'

// something to think through: the offsets could be cached for different intervals based off when they're requested, resulting in weird data. Easy workaround is shorten to revalidate to something like 10-20 seconds

export const dynamic = 'error'
// other than the simplicity, another advantage of doing a HTTP endpoint here with a params url (instead of query params for example) is we can fully leverage Next.js built in caching mechanisms.
// This endpoint will be fully cached for 1 hour (3600 seconds) by default. If we want less aggressive caching, we can update the revalidate property. No need to deal with backend teams that may be managed separate cache layers
export const revalidate = 3600

const zodParams = z.object({
  offset: z.string().pipe(z.coerce.number().int().gte(0).lt(9999)),
})

export async function GET(_request: NextRequest, { params }: { params: { offset: string } }) {
  const { offset } = zodParams.parse(params)
  const data = await getLeaderboard({ offset })
  return NextResponse.json(data)
}
