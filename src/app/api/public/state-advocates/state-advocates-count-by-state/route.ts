import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAdvocatesCountByStateData } from '@/data/pageSpecific/getAdvocatesCountByStateData'

const zodPayload = z.object({
  stateCode: z.string(),
})

interface RequestContext {
  params: Promise<{
    stateCode: string
  }>
}

export async function GET(_: NextRequest, context: RequestContext) {
  const params = await context.params
  const { stateCode } = zodPayload.parse({
    stateCode: params.stateCode,
  })

  const data = await getAdvocatesCountByStateData(stateCode)

  return NextResponse.json(data)
}
