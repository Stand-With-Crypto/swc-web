import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLogger, logger } from '@/utils/shared/logger'

import {
  EmailEvent,
  EVENT_NAME_TO_HUMAN_READABLE_STRING,
  parseEventsWebhookRequest,
  verifySignature,
} from '@/lib/email'

export async function POST(request: NextRequest) {
  const isVerified = await verifySignature(request.clone()).catch(logger.error)
  if (!isVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawRequestBody = await request.json()
  const eventsByMessage = parseEventsWebhookRequest(rawRequestBody as EmailEvent[])

  for await (const [messageId, events] of Object.entries(eventsByMessage)) {
    await processEventChunk(messageId, events).catch(error =>
      Sentry.captureException(error, {
        tags: {
          domain: 'SendgridWebhook',
        },
        extra: {
          messageId,
          events,
        },
      }),
    )
  }

  return NextResponse.json({ ok: true })
}

async function processEventChunk(messageId: string, events: EmailEvent[]) {
  const log = getLogger(`Sendgrid Event Webhook - ${messageId}`)

  const analytics = await getServerAnalyticsFromMessageId(messageId)

  events.forEach(eventEntry => {
    console.log(eventEntry)
    log.info(`tracking event: ${eventEntry.event}`)
    analytics.track(`Email Communication Event`, {
      'Event Name': EVENT_NAME_TO_HUMAN_READABLE_STRING[eventEntry.event] ?? eventEntry.event,
      'Recipient Email': eventEntry.email,
      Timestamp: new Date(eventEntry.timestamp * 1000),
      'Sendgrid Message Id': messageId,
      'Sendgrid Event Id': eventEntry.sg_event_id,
      ...(eventEntry.useragent && { 'User Agent': eventEntry.useragent }),
      ...(eventEntry.url && { Url: eventEntry.url }),
    })
  })

  await analytics.flush()
}

async function getServerAnalyticsFromMessageId(messageId: string) {
  // TODO: Check if there's a better way to do this
  // MessageId received from sendMail: 0GOQ6fMTTmiZpLh7usBJwg
  // MessageId received by the event webhook: 0GOQ6fMTTmiZpLh7usBJwg.recvd-67fdc7b4d6-wbpn9-1-666CAB97-15.0
  const parsedMessageId = messageId.split('.')[0]

  const userCommunication = await prismaClient.userCommunication.findFirst({
    where: { messageId: parsedMessageId },
    include: {
      userCommunicationJourney: true,
    },
  })

  if (!userCommunication) {
    throw new Error(`User communication with message_id '${messageId}' not found`)
  }

  const userId = userCommunication.userCommunicationJourney.userId

  return getServerAnalytics({ userId, localUser: null })
}
