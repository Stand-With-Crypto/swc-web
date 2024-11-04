import 'server-only'

import { UserCommunicationJourneyType } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'

import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
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

  const [_, searchParams] = request.url.split('?')

  const params = new URLSearchParams(searchParams)

  const journeyType = params.get('journeyType') as UserCommunicationJourneyType | null
  const campaignName = params.get('campaignName')
  const userId = params.get('userId')

  if (userId) {
    const user = await prismaClient.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    })

    waitUntil(
      getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId,
      })
        .track('SMS Communication Event', {
          'Message Status': body.MessageStatus,
          'Message Id': body.MessageSid,
          From: body.From,
          To: body.To,
          'Campaign Name': campaignName,
          'Journey Type': journeyType,
          Error: body.ErrorCode,
        })
        .flush(),
    )
  }

  return new NextResponse('success', {
    status: 200,
  })
})
