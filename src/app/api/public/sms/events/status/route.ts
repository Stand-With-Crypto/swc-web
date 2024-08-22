import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { verifySignature } from '@/utils/server/sms/utils'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('status-callback')

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const [isVerified, body] = await verifySignature(request)

  logger.info(
    JSON.stringify({
      isVerified,
      body,
    }),
  )

  if (!isVerified) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      },
    )
  }

  return NextResponse.json(
    {
      ok: true,
    },
    {
      status: 200,
    },
  )
})
