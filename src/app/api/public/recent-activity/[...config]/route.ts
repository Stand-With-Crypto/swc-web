import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

const zodParams = z.object({
  limit: z.string().pipe(z.coerce.number().int().gte(0).lt(100)),
  restrictToUS: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ config: [string, string?] }> },
) {
  const params = await props.params
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
