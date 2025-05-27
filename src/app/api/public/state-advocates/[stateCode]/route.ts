import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAdvocatesCountByStateData } from '@/data/pageSpecific/getAdvocatesCountByStateData'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

const zodPayload = z.object({
  stateCode: z.string().length(2),
})

interface RequestContext {
  params: Promise<{
    stateCode: USStateCode
  }>
}

export async function GET(_: NextRequest, context: RequestContext) {
  const params = await context.params
  const payload = zodPayload.safeParse({
    stateCode: params.stateCode,
  })

  if (payload.success === false) {
    return NextResponse.json(
      {
        errors: payload.error.errors,
      },
      { status: 400 },
    )
  }

  const data = await getAdvocatesCountByStateData(payload.data.stateCode)

  return NextResponse.json(data)
}
