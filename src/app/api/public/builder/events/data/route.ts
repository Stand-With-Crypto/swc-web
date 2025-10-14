import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

import { BuilderEventBody } from '@/utils/server/builder/types'
import { withBuilderIoAuthMiddleware } from '@/utils/server/serverWrappers/withBuilderIoAuthMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

const logger = getLogger('builder-webhook-events-data-route')

const MODEL_PATHS_TO_REVALIDATE: Record<string, string[]> = {
  a1f6d65d3d8549b0aa114e5efa071202: ['/events', '/events/[state]', '/events/[state]/[eventSlug]'],
  '1c62e069933343108086da2a8ee3d227': ['/partners'],
  c981a32a6786439693a4ea2eeefde8b2: ['/press', '/press/[...page]'],
  c0f982797c4942259e868d0f44d86c6e: [
    '/petitions',
    '/petitions/[petitionSlug]',
    '/api/[countryCode]/public/petitions',
    '/api/[countryCode]/public/petitions/[petitionSlug]',
  ],
  '0d6b1d36627746ea933483402efa71e1': ['/bills', '/bills/[billSlug]'],
  '59c2aecf3c5d4339b51f5c305bc43f91': ['/politicians/person/[dtsiSlug]'],
  '28318427d3294be8935b88dffefc9e3e': ['/polls'],
}

export const POST = withBuilderIoAuthMiddleware(async (request: NextRequest) => {
  const body = (await request.json()) as BuilderEventBody

  const modelId = body.newValue?.modelId ?? body.previousValue?.modelId

  const modelName = body.modelName

  if (!modelId) {
    Sentry.captureMessage('No modelId found in Builder.io webhook data model event', {
      extra: { ...body },
      tags: {
        domain: 'builder.io',
      },
    })
    return new Response('No modelId found', {
      status: 400,
    })
  }

  const pathsToRevalidate = MODEL_PATHS_TO_REVALIDATE[modelId]

  pathsToRevalidate.forEach(path => {
    logger.info(`Revalidating path: ${path}`)
    revalidatePath(path, 'page')
  })

  ORDERED_SUPPORTED_COUNTRIES.forEach(countryCode => {
    pathsToRevalidate.forEach(path => {
      logger.info(`Revalidating path: ${path}`)
      revalidatePath(`/${countryCode}${path}`, 'page')
    })
  })

  logger.info(`Revalidation completed for modelId: ${modelId} and modelName: ${modelName}`)

  return new Response('Success', {
    status: 200,
  })
})
