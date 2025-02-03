import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/utils/shared/logger'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { ORDERED_SUPPORTED_LOCALES } from '@/utils/shared/supportedLocales'

const logger = getLogger('builder-events-data-route')

const BUILDER_IO_WEBHOOK_AUTH_TOKEN = requiredOutsideLocalEnv(
  process.env.BUILDER_IO_WEBHOOK_AUTH_TOKEN,
  'BUILDER_IO_WEBHOOK_AUTH_TOKEN',
  "Builder.io webhook's auth token",
)!

const EVENTS_PATH = '/events'

export const POST = async (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization')

  if (authHeader !== `Bearer ${BUILDER_IO_WEBHOOK_AUTH_TOKEN}`) {
    Sentry.captureMessage('Received unauthorized request to Builder.io webhook', {
      extra: {
        ...request,
      },
      tags: {
        domain: 'builder.io',
        model: 'events',
      },
    })

    return new NextResponse('Unauthorized', {
      status: 401,
    })
  }

  revalidatePath(EVENTS_PATH)
  ORDERED_SUPPORTED_LOCALES.forEach(locale => revalidatePath(`/${locale}${EVENTS_PATH}`))

  logger.info(`Revalidation completed for path: ${EVENTS_PATH}`)

  return new NextResponse('Success', {
    status: 200,
  })
}
