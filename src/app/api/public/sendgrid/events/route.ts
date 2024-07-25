import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import {
  EmailEvent,
  EmailEventName,
  EVENT_NAME_TO_HUMAN_READABLE_STRING,
  parseEventsWebhookRequest,
  verifySignature,
} from '@/utils/server/email'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { getLogger, logger } from '@/utils/shared/logger'

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

  const { analytics, user } = await getServerAnalyticsFromMessageId(messageId)

  for await (const eventEntry of events) {
    log.info(`tracking event: ${eventEntry.event}`)
    analytics.track(`Email Communication Event`, {
      'Event Name': EVENT_NAME_TO_HUMAN_READABLE_STRING[eventEntry.event] ?? eventEntry.event,
      'Recipient Email': eventEntry.email,
      Timestamp: new Date(eventEntry.timestamp * 1000),
      'Sendgrid Message Id': messageId,
      'Sendgrid Event Id': eventEntry.sg_event_id,
      ...(eventEntry.useragent && { 'User Agent': eventEntry.useragent }),
      ...(eventEntry.url && { Url: eventEntry.url }),
      ...(eventEntry.variant && { Variant: eventEntry.variant }),
    })

    if (eventEntry.event === EmailEventName.UNSUBSCRIBE) {
      const capitolCanaryPayload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
        user: user,
        campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP),
        opts: {
          isEmailOptout: true,
        },
      }

      await inngest.send({
        name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
        data: capitolCanaryPayload,
      })
    }
  }

  await analytics.flush()
}

async function getServerAnalyticsFromMessageId(messageId: string) {
  // MessageId received from sendMail: 0GOQ6fMTTmisBJwg
  // MessageId received by the event webhook: 0GOQ6fMTTmisBJwg.recvd-1123412asd12-wbpn9-1-vdfs3123
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
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      address: true,
    },
  })

  return { analytics: getServerAnalytics({ userId, localUser: getLocalUserFromUser(user) }), user }
}