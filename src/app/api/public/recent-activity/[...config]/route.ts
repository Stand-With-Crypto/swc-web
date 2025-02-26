import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

const zodParams = z.object({
  limit: z.string().pipe(z.coerce.number().int().gte(0).lt(100)),
  countryCode: zodSupportedCountryCode,
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ config: [string, string?] }> },
) {
  const params = await props.params
  const [rawLimit, rawCountryCode] = params.config

  const { limit, countryCode } = zodParams.parse({
    limit: rawLimit,
    countryCode: rawCountryCode,
  })

  const data = await getPublicRecentActivity({
    limit,
    countryCode,
  })
  return NextResponse.json(data)
}
