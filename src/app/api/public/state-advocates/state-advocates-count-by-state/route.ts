import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAdvocatesCountByStateData } from '@/data/pageSpecific/getAdvocatesCountByStateData'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

const zodPayload = z.object({
  stateCode: z.string(),
})

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const { stateCode } = zodPayload.parse({
    stateCode: params.get('stateCode'),
  })

  const data = await getAdvocatesCountByStateData(stateCode)

  return NextResponse.json(data)
}
