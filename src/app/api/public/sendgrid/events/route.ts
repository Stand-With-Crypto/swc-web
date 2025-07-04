import 'server-only'

import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import {
  EmailEvent,
  EmailEventName,
  EVENT_NAME_TO_COMMUNICATION_STATUS,
  EVENT_NAME_TO_HUMAN_READABLE_STRING,
  parseEventsWebhookRequest,
  verifySignature,
} from '@/utils/server/email'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics, ServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { getLogger, logger } from '@/utils/shared/logger'

export const POST = withRouteMiddleware(async (request: NextRequest) => {
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
})

async function processEventChunk(messageId: string, events: EmailEvent[]) {
  const log = getLogger(`Sendgrid Event Webhook - ${messageId}`)

  for await (const eventEntry of events) {
    let analytics: ServerAnalytics | null = null
    let user: Prisma.UserGetPayload<{ include: { address: true } }> | null = null
    try {
      const serverAnalytics = await getServerAnalyticsFromEvent(eventEntry)
      analytics = serverAnalytics.analytics
      user = serverAnalytics.user
    } catch (error) {
      if (eventEntry.event === EmailEventName.UNSUBSCRIBE) {
        continue
      }
      throw error
    }

    log.info(`tracking event: ${eventEntry.event}`)
    analytics.track(`Email Communication Event`, {
      'Event Name': EVENT_NAME_TO_HUMAN_READABLE_STRING[eventEntry.event] ?? eventEntry.event,
      'Recipient Email': eventEntry.email,
      Timestamp: new Date(eventEntry.timestamp * 1000),
      'Sendgrid Message Id': messageId,
      'Sendgrid Event Id': eventEntry.sg_event_id,
      ...(eventEntry.useragent && { 'User Agent': eventEntry.useragent }),
      ...(eventEntry.url && { Url: removeSearchParamsFromURL(eventEntry.url) }),
      ...(eventEntry.variant && { Variant: eventEntry.variant }),
      ...(eventEntry.category && { Category: eventEntry.category }),
      ...(eventEntry.campaign && { Campaign: eventEntry.campaign }),
    })

    const messageStatus = EVENT_NAME_TO_COMMUNICATION_STATUS[eventEntry.event]

    if (messageStatus) {
      await prismaClient.userCommunication.updateMany({
        where: {
          messageId: parseMessageId(messageId),
        },
        data: {
          status: messageStatus,
        },
      })
    }

    if (eventEntry.event === EmailEventName.UNSUBSCRIBE) {
      await inngest.send({
        name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
        data: {
          user: user,
          campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP),
          opts: {
            isEmailOptout: true,
          },
        },
      })
    }

    await analytics.flush()
  }
}

async function getUserFromEvent(emailEvent: EmailEvent) {
  let userId = emailEvent.userId
  if (!userId) {
    const messageId = parseMessageId(emailEvent.sg_message_id)

    const userCommunication = await prismaClient.userCommunication.findFirst({
      where: { messageId },
      include: {
        userCommunicationJourney: true,
      },
    })

    if (!userCommunication) {
      throw new Error(`User communication with message_id '${messageId}' not found`)
    }

    userId = userCommunication.userCommunicationJourney.userId
  }

  return prismaClient.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      address: true,
    },
  })
}

async function getServerAnalyticsFromEvent(emailEvent: EmailEvent) {
  const user = await getUserFromEvent(emailEvent)

  return {
    analytics: getServerAnalytics({ userId: user.id, localUser: getLocalUserFromUser(user) }),
    user,
  }
}

function removeSearchParamsFromURL(url: string) {
  try {
    const urlObj = new URL(url)
    urlObj.search = ''
    return urlObj.toString()
  } catch {
    return null
  }
}

function parseMessageId(messageId: string) {
  // MessageId received from sendMail: 0GOQ6fMTTmisBJwg
  // MessageId received by the event webhook: 0GOQ6fMTTmisBJwg.recvd-1123412asd12-wbpn9-1-vdfs3123
  return messageId.split('.')[0]
}
