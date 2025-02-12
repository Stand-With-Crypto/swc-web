import { NextRequest } from 'next/server'

import { withBuilderIoAuthMiddleware } from '@/utils/server/serverWrappers/withBuilderIoAuthMiddleware'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('builder-webhook-events-data-route')

const MODEL_PATHS_TO_REVALIDATE: Record<string, string[]> = {
  a1f6d65d3d8549b0aa114e5efa071202: ['/events', '/events/[state]', '/events/[state]/[eventSlug]'],
  '1c62e069933343108086da2a8ee3d227': ['/partners'],
  c981a32a6786439693a4ea2eeefde8b2: ['/press'],
}

export const POST = withBuilderIoAuthMiddleware(async (request: NextRequest) => {
  const body = await request.json()

  logger.info('Received webhook event', body)

  return new Response('Success', {
    status: 200,
  })
})
