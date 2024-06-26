import 'server-only'

import { SMSStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'

import { verifySignature } from '@/lib/sms'
import * as messages from '@/lib/sms/messages'

const SWC_STOP_SMS_KEYWORD = requiredEnv(process.env.SWC_STOP_SMS_KEYWORD, 'SWC_STOP_SMS_KEYWORD')
const SWC_UNSTOP_SMS_KEYWORD = requiredEnv(
  process.env.SWC_UNSTOP_SMS_KEYWORD,
  'SWC_UNSTOP_SMS_KEYWORD',
)

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
  Body: string
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

  const response = new twilio.twiml.MessagingResponse()

  logger.info('body', JSON.stringify(body))

  switch (body.Body.toUpperCase()) {
    // Default STOP keywords
    case 'STOPALL':
    case 'UNSUBSCRIBE':
    case 'CANCEL':
    case 'END':
    case 'QUIT':
    case 'STOP':
      await optOutUser(body.From)
      // In this case we can't respond
      break
    case SWC_STOP_SMS_KEYWORD:
      await optOutUser(body.From)
      response.message(messages.GOODBYE_MESSAGE)
      break
    case 'YES':
    case 'START':
    case 'CONTINUE':
    case 'UNSTOP':
    case SWC_UNSTOP_SMS_KEYWORD:
      await prismaClient.user.updateMany({
        data: {
          smsStatus: SMSStatus.OPTED_IN,
        },
        where: {
          phoneNumber: body.From,
        },
      })
      break
    default:
  }

  logger.info('response', response.toString())

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')

  return new Response(response.toString(), {
    headers,
    status: 200,
  })
}

async function optOutUser(phoneNumber: string) {
  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_OUT,
    },
    where: {
      phoneNumber,
    },
  })

  // TODO: create communication journey
  // TODO: create communication
}
