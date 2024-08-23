import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'

import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { verifySignature } from '@/utils/server/sms/utils'

interface SMSStatusEvent {
  ErrorCode?: string
  ApiVersion: string
  MessageStatus: string
  RawDlrDoneDate: string
  SmsSid: string
  SmsStatus: string
  To: string
  From: string
  MessageSid: string
  AccountSid: string
}

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const [isVerified, body] = await verifySignature<SMSStatusEvent>(request)

  if (!isVerified) {
    return new NextResponse('unauthorized', {
      status: 401,
    })
  }

  const userCommunication = await prismaClient.userCommunication.findFirst({
    where: {
      messageId: body.MessageSid,
    },
    orderBy: {
      userCommunicationJourney: {
        user: {
          datetimeUpdated: 'desc',
        },
      },
    },
    include: {
      userCommunicationJourney: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!userCommunication) {
    Sentry.captureMessage(`Received message status update but couldn't find user_communication`, {
      extra: { body },
      tags: {
        domain: 'smsMessageStatusWebhook',
      },
    })
    return new NextResponse('not found', { status: 404 })
  }

  const user = userCommunication?.userCommunicationJourney.user

  waitUntil(
    Promise.all([
      getServerPeopleAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .set({
          'SMS Status': user.smsStatus,
        })
        .flush(),
      getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .track('SMS Communication Event', {
          'Message Status': body.MessageStatus,
          'Message Id': body.MessageSid,
          From: body.From,
          To: body.To,
          'Campaign Name': userCommunication.userCommunicationJourney.campaignName,
          'Journey Type': userCommunication.userCommunicationJourney.journeyType,
          Error: body.ErrorCode,
        })
        .flush(),
    ]),
  )

  return new NextResponse('success', {
    status: 200,
  })
})
