import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { BuilderEventBody } from '@/utils/server/builder/types'
import { withBuilderIoAuthMiddleware } from '@/utils/server/serverWrappers/withBuilderIoAuthMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

const logger = getLogger('builder-webhook-events-page-route')

export const POST = withBuilderIoAuthMiddleware(async (request: NextRequest) => {
  const body = (await request.json()) as BuilderEventBody

  const query = body.newValue?.query ?? body.previousValue?.query ?? []

  if (!query) {
    Sentry.captureMessage('No query found in Builder.io webhook event', {
      extra: { ...body },
      tags: {
        domain: 'builder.io',
      },
    })
    return new NextResponse('No query found', {
      status: 400,
    })
  }

  query.forEach(({ property, value }) => {
    if (property === 'urlPath') {
      logger.info(`Revalidating path: ${value}`)
      revalidatePath(value)
      ORDERED_SUPPORTED_COUNTRIES.forEach(countryCode => revalidatePath(`/${countryCode}${value}`))
    }
  })

  return new NextResponse('Success', {
    status: 200,
  })
})
