import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['30_SECONDS']

const zodParams = z.object({
  topStatesLimit: z.string().pipe(z.coerce.number().int().gte(0).lt(11)),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { topStatesLimit: string } },
) {
  const { topStatesLimit } = zodParams.parse(params)
  const data = await getAdvocatesMapData(topStatesLimit)

  return NextResponse.json(data)
}
