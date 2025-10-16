import * as Sentry from '@sentry/nextjs'

import { postgridClient } from '@/utils/server/postgrid/postgridClient'
import { CreateLetterParams, CreateLetterResult } from '@/utils/server/postgrid/types'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('postgrid.createLetter')

export async function createLetter(params: CreateLetterParams): Promise<CreateLetterResult> {
  if (!postgridClient) {
    logger.warn('PostGrid client not initialized (missing API key)')
    return {
      success: false,
      error: 'PostGrid client not configured',
    }
  }

  try {
    const letter = await postgridClient.letter.create(
      {
        to: params.to,
        from: params.from,
        html: params.html,
        description: `SWC Letter - ${params.metadata?.campaignName || 'default'}`,
        ...(params.metadata && { metadata: params.metadata }),
      },
      {
        headers: {
          'Idempotency-Key': params.idempotencyKey,
        },
      },
    )

    logger.info('Letter created successfully', {
      letterId: letter.id,
      status: letter.status,
      idempotencyKey: params.idempotencyKey,
    })

    return {
      success: true,
      letterId: letter.id,
      status: letter.status,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Failed to create letter', {
      error: errorMessage,
      idempotencyKey: params.idempotencyKey,
    })

    Sentry.captureException(error, {
      tags: { domain: 'postgrid.createLetter' },
      extra: {
        idempotencyKey: params.idempotencyKey,
        metadata: params.metadata,
      },
    })

    return {
      success: false,
      error: errorMessage,
    }
  }
}

