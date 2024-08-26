import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import * as smsActions from '@/utils/server/sms/actions'
import { getUserByPhoneNumber, verifySignature } from '@/utils/server/sms/utils'
// TODO: Uncomment this after we start using Messaging Service
// import * as messages from '@/utils/server/sms/messages'
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

export const POST = withRouteMiddleware(async (request: NextRequest) => {
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

  if (!user) {
    Sentry.captureMessage('Received message from an unused phone number', {
      extra: {
        phoneNumber,
      },
      tags: {
        domain: 'smsEventsMessagesRoute',
      },
    })
  }

  const keyword = body.Body?.toUpperCase()

  // TODO: Uncomment this after we start using Messaging Service
  // const message = ''

  if (keyword && keyword.length > 0) {
    if (
      ['STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'STOP', SWC_STOP_SMS_KEYWORD].includes(
        keyword,
      )
    ) {
      // We can't get the messageId when replying with twilio, so we need to trigger a Inngest function instead
      await smsActions.optOutUser(phoneNumber, user)
    } else if (['YES', 'START', 'CONTINUE', 'UNSTOP', SWC_UNSTOP_SMS_KEYWORD].includes(keyword)) {
      await smsActions.optUserBackIn(phoneNumber, user)
    } else if (['HELP'].includes(keyword)) {
      // We don't want to track this message, so we can just reply with twilio
      // TODO: Uncomment this after we start using Messaging Service
      // message = messages.HELP_MESSAGE
    }
  }

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')

  // If we don't respond the message with this xml Twilio will trigger a error event on the fails webhook
  const response = new twilio.twiml.MessagingResponse()

  // TODO: Uncomment this after we start using Messaging Service
  // if (message) {
  //   response.message(message)
  // }

  return new Response(response.toString(), {
    headers,
    status: 200,
  })
})
