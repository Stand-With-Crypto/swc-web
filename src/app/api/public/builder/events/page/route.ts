import { NextRequest, NextResponse } from 'next/server'

import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { prettyStringify } from '@/utils/shared/prettyLog'

const logger = getLogger('builder-events-page-route')

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const body = await request.json()

  logger.info('Received page event', prettyStringify(body))

  return new NextResponse('success', {
    status: 200,
  })
})
