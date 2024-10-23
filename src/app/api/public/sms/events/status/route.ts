import 'server-only'

import { UserCommunicationJourneyType } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'

import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { bulkCreateCommunicationJourney } from '@/utils/server/sms/communicationJourney'
import { getUserByPhoneNumber, verifySignature } from '@/utils/server/sms/utils'
import { getLogger } from '@/utils/shared/logger'

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

const logger = getLogger('smsStatus')

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const [isVerified, body] = await verifySignature<SMSStatusEvent>(request)

  if (!isVerified) {
    return new NextResponse('unauthorized', {
      status: 401,
    })
  }

  logger.info('Request URL:', request.url)

  const [_, searchParams] = request.url.split('?')

  const params = new URLSearchParams(searchParams)

  const journeyType = params.get('journeyType') as UserCommunicationJourneyType | null
  const campaignName = params.get('campaignName')
  const hasWelcomeMessageInBody = params.has('hasWelcomeMessageInBody')

  const messageId = body.MessageSid
  const messageStatus = body.MessageStatus

  const errorCode = body.ErrorCode
  const from = body.From
  const phoneNumber = body.To

  if (!journeyType || !campaignName) {
    return new NextResponse('missing url params', {
      status: 400,
    })
  }

  logger.info(`Searching user with phone number ${phoneNumber}`)

  const user = await getUserByPhoneNumber(phoneNumber)

  if (!user) {
    return new NextResponse('success', {
      status: 200,
    })
  }

  const existingMessage = await prismaClient.userCommunication.findFirst({
    where: {
      messageId,
    },
  })

  if (existingMessage) {
    logger.info(`Found existing message with id ${messageId}`)
    // TODO: update message status
  } else {
    logger.info(
      `Creating communication journey of type ${journeyType} for campaign ${campaignName} and user communication with message ${messageId}`,
    )
    await bulkCreateCommunicationJourney({
      campaignName,
      journeyType,
      messageId,
      phoneNumber,
    })

    if (hasWelcomeMessageInBody) {
      logger.info(`Creating bulk-welcome communication journey`)

      await bulkCreateCommunicationJourney({
        campaignName: 'bulk-welcome',
        journeyType: UserCommunicationJourneyType.WELCOME_SMS,
        phoneNumber,
      })
    }
  }

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
          'Message Status': messageStatus,
          'Message Id': messageId,
          From: from,
          To: phoneNumber,
          'Campaign Name': campaignName,
          'Journey Type': journeyType,
          Error: errorCode,
        })
        .flush(),
    ]),
  )

  return new NextResponse('success', {
    status: 200,
  })
})
