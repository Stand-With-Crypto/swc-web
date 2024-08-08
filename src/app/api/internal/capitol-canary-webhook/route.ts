import { NextRequest, NextResponse } from 'next/server'

import { authenticateCapitolCanaryRequest } from '@/utils/server/capitolCanary/authenticateWebhookRequest'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('capitolCanaryWebhook')

export async function POST(request: NextRequest) {
  if (!authenticateCapitolCanaryRequest(request)) {
    logger.error('Unauthorized Capitol Canary webhook request')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const body = await request.json()

  logger.info('Received Capitol Canary webhook request', body)

  return new NextResponse('success', { status: 200 })
}
