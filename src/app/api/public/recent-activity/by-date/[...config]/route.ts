import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPublicRecentActivityByDateRange } from '@/data/recentActivity/getPublicRecentActivityByDateRange'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60
export const dynamic = 'error'

// ISO date without time information: YYYY-MM-DD
const zodDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const zodParams = z.object({
  startDate: zodDateString,
  endDate: zodDateString,
  offset: z.string().pipe(z.coerce.number().int().gte(0).lte(1000)).optional().default('0'),
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ config: [string, string, string?] }> },
) {
  const params = await props.params
  const [rawStartDate, rawEndDate, rawOffset] = params.config

  const { startDate, endDate, offset } = zodParams.parse({
    startDate: rawStartDate,
    endDate: rawEndDate,
    offset: rawOffset || '0',
  })

  const data = await getPublicRecentActivityByDateRange({
    startDate,
    endDate,
    offset,
    countryCode: SupportedCountryCodes.US,
  })
  return NextResponse.json(data)
}
