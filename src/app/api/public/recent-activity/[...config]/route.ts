import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['30_SECONDS']

const zodParams = z.object({
  limit: z.string().pipe(z.coerce.number().int().gte(0).lt(100)),
  restrictToUS: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { config: [string, string?] } },
) {
  const [rawLimit, rawRestrictToUS] = params.config

  const { limit, restrictToUS } = zodParams.parse({
    limit: rawLimit,
    restrictToUS: rawRestrictToUS,
  })

  const data = await getPublicRecentActivity({
    limit,
    restrictToUS: !!restrictToUS,
  })
  return NextResponse.json(data)
}
