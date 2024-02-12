import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.SECOND * 5

const zodParams = z.object({
  limit: z.string().pipe(z.coerce.number().int().gte(0).lt(100)),
})

export async function GET(_request: NextRequest, { params }: { params: { limit: string } }) {
  const { limit } = zodParams.parse(params)
  const data = await getPublicRecentActivity({ limit })
  return NextResponse.json(data)
}
