import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import pRetry from 'p-retry'

import { mapPostgridStatus } from '@/utils/server/postgrid/mapPostgridStatus'
import { verifyPostgridWebhookSignature } from '@/utils/server/postgrid/verifyWebhookSignature'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('postgridWebhook')

export async function POST(request: NextRequest) {
  const jwtPayload = await request.text()

  const payload = verifyPostgridWebhookSignature(jwtPayload)
  if (!payload) {
    logger.error('Unauthorized PostGrid webhook request - invalid signature')
    Sentry.captureMessage('Unauthorized PostGrid webhook request - invalid signature', {
      extra: { jwtPayload },
      tags: { domain: 'postgridWebhook' },
    })
    return new NextResponse('Unauthorized', { status: 401 })
  }

  logger.info('Received PostGrid webhook event', {
    eventType: payload.type,
    letterId: payload.data.id,
    status: payload.data.status,
    ...payload.data.metadata,
  })

  const status = mapPostgridStatus(payload.data.status)

  const recipient = await pRetry(
    async () => {
      return await prismaClient.userActionLetterRecipient.findFirstOrThrow({
        where: { postgridOrderId: payload.data.id },
      })
    },
    {
      maxRetryTime: 60 * 1000, // 1 minute
    },
  )

  if (!recipient) {
    logger.error('Recipient not found for PostGrid order', { letterId: payload.data.id })
    Sentry.captureMessage('Letter recipient not found for PostGrid order', {
      extra: { payload },
      tags: { domain: 'postgridWebhook' },
    })
    return new NextResponse('Letter recipient not found', { status: 400 })
  }

  try {
    await prismaClient.userActionLetterStatusUpdate.create({
      data: {
        userActionLetterRecipientId: recipient.id,
        status,
      },
    })

    logger.info('Updated status for PostGrid letter', {
      letterId: payload.data.id,
      recipientId: recipient.id,
      status,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      logger.info('Status already recorded, skipping duplicate', {
        letterId: payload.data.id,
        recipientId: recipient.id,
        userId: payload.data.metadata.userId,
        status,
      })
    } else {
      throw error
    }
  }

  return new NextResponse('ok')
}
