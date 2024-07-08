import 'server-only'

import { SMSStatus, User } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

import { GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/goodbyeSMSCommunicationJourney'
import { UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/unstopConfirmationSMSCommunicationJourney'
import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { verifySignature } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'

const SWC_STOP_SMS_KEYWORD = process.env.SWC_STOP_SMS_KEYWORD
const SWC_UNSTOP_SMS_KEYWORD = process.env.SWC_UNSTOP_SMS_KEYWORD

const logger = getLogger('sms-events')

interface SmsEvent {
  ToCountry: string
  ToState: string
  SmsMessageSid: string
  NumMedia: string
  ToCity: string
  FromZip: string
  SmsSid: string
  FromState: string
  SmsStatus: string
  FromCity: string
  Body?: string
  FromCountry: string
  To: string
  ToZip: string
  NumSegments: string
  MessageSid: string
  AccountSid: string
  From: string
  ApiVersion: string
}

export async function POST(request: NextRequest) {
  const [isVerified, body] = await verifySignature<SmsEvent>(request)

  if (!isVerified) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      },
    )
  }

  logger.info('body', JSON.stringify(body))

  const phoneNumber = body.From
  const user = await getUserByPhoneNumber(phoneNumber)

  if (body.Body && body.Body.length > 0) {
    switch (body.Body.toUpperCase()) {
      // Default STOP keywords
      // In this case Twilio will block future messages, so we don't need to send anything
      case 'STOPALL':
      case 'UNSUBSCRIBE':
      case 'CANCEL':
      case 'END':
      case 'QUIT':
      case 'STOP':
        await optOutUser({ phoneNumber, isSWCKeyword: false, user })
        break
      case SWC_STOP_SMS_KEYWORD:
        await optOutUser({ phoneNumber, isSWCKeyword: true, user })
        break
      case 'YES':
      case 'START':
      case 'CONTINUE':
      case 'UNSTOP':
      case SWC_UNSTOP_SMS_KEYWORD:
        await optUserBackIn({ phoneNumber, user })
        break
      default:
    }
  }

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')

  // If we don't respond the message with this xml Twilio will trigger a error event on the fail webhook
  const response = new twilio.twiml.MessagingResponse()

  // We can't get the messageId when sending messages this way, so we need to trigger a Inngest function instead
  response.message('')

  return new Response(response.toString(), {
    headers,
    status: 200,
  })
}

interface OptUserBackInProps {
  phoneNumber: string
  user?: User
}

async function optUserBackIn({ phoneNumber, user }: OptUserBackInProps) {
  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_IN,
    },
    where: {
      phoneNumber,
    },
  })

  await inngest.send({
    name: UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
    data: {
      phoneNumber,
    },
  })

  if (user) {
    const analytics = getServerAnalytics({
      localUser: getLocalUserFromUser(user),
      userId: user.id,
    })
    await analytics.track('User SMS Unstop').flush()
  }
}

interface OptOutUserProps extends OptUserBackInProps {
  isSWCKeyword: boolean
}

async function optOutUser({ isSWCKeyword, phoneNumber, user }: OptOutUserProps) {
  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_OUT,
    },
    where: {
      phoneNumber,
    },
  })

  if (isSWCKeyword) {
    await inngest.send({
      name: GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
      data: {
        phoneNumber,
      },
    })
  }

  if (user) {
    const analytics = getServerAnalytics({
      localUser: getLocalUserFromUser(user),
      userId: user.id,
    })

    await analytics
      .track('User SMS Opt-out', {
        type: isSWCKeyword ? 'SWC STOP Keyword' : 'STOP Keyword',
      })
      .flush()
  }
}

async function getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
  const [user] = await prismaClient.user.findMany({
    where: {
      phoneNumber,
    },
    orderBy: {
      datetimeUpdated: 'desc',
    },
    take: 1,
  })

  return user
}
