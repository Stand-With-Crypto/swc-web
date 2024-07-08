import 'server-only'

import { User } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

import { prismaClient } from '@/utils/server/prismaClient'
import { verifySignature } from '@/utils/server/sms'
import { optOutUser, optUserBackIn } from '@/utils/server/sms/actions'
import { getLogger } from '@/utils/shared/logger'

const SWC_STOP_SMS_KEYWORD = process.env.SWC_STOP_SMS_KEYWORD?.toUpperCase()
const SWC_UNSTOP_SMS_KEYWORD = process.env.SWC_UNSTOP_SMS_KEYWORD?.toUpperCase()

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

  const keyword = body.Body?.toUpperCase()

  if (keyword && keyword.length > 0) {
    switch (keyword) {
      // Default STOP keywords
      // In this case Twilio will block future messages, so we don't need to send anything
      case 'STOPALL':
      case 'UNSUBSCRIBE':
      case 'CANCEL':
      case 'END':
      case 'QUIT':
      case 'STOP':
      case SWC_STOP_SMS_KEYWORD:
        await optOutUser(phoneNumber, keyword === SWC_STOP_SMS_KEYWORD, user)
        break
      case 'YES':
      case 'START':
      case 'CONTINUE':
      case 'UNSTOP':
      case SWC_UNSTOP_SMS_KEYWORD:
        await optUserBackIn(phoneNumber, user)
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
