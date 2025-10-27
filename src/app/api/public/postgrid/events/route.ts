import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

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
    ...payload.data.metadata,
  })

  const status = mapPostgridStatus(payload.data.status)

  const recipient = await prismaClient.userActionLetterRecipient.findFirst({
    where: { postgridOrderId: payload.data.id },
  })

  if (!recipient) {
    logger.error('Recipient not found for PostGrid order', { letterId: payload.data.id })
    Sentry.captureMessage('Letter recipient not found for PostGrid order', {
      extra: { payload },
      tags: { domain: 'postgridWebhook' },
    })
    return new NextResponse('Letter recipient not found', { status: 400 })
  }

  await prismaClient.userActionLetterStatusUpdate.create({
    data: {
      userActionLetterRecipientId: recipient.id,
      status,
    },
  })

  logger.info('Updated status for PostGrid letter', {
    letterId: payload.data.id,
    status,
    recipientId: recipient.id,
  })

  return new NextResponse('ok')
}
