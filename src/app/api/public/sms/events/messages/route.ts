import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import * as smsActions from '@/utils/server/sms/actions'
import { identifyIncomingKeyword } from '@/utils/server/sms/identifyIncomingKeyword'
import * as messages from '@/utils/server/sms/messages'
import { getUserByPhoneNumber, verifySignature } from '@/utils/server/sms/utils'

interface SMSMessageEvent {
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
  const [isVerified, body] = await verifySignature<SMSMessageEvent>(request)

  if (!isVerified) {
    return new NextResponse('unauthorized', {
      status: 401,
    })
  }

  const phoneNumber = body.From
  const user = await getUserByPhoneNumber(phoneNumber)

  if (!user) {
    Sentry.captureMessage('Received message from an unused phone number', {
      extra: {
        ...body,
      },
      level: 'warning',
      tags: {
        domain: 'smsEventsMessagesRoute',
      },
    })
  }

  const keyword = identifyIncomingKeyword(body.Body)

  let message = ''

  if (keyword?.isOptOutKeyword) {
    // We can't get the messageId when replying with twilio, so we need to trigger a Inngest function instead
    await smsActions.optOutUser(phoneNumber, user)
  } else if (keyword?.isUnstopKeyword) {
    await smsActions.optUserBackIn(phoneNumber, user)
  } else if (keyword?.isHelpKeyword) {
    // We don't want to track this message, so we can just reply with twilio
    message = messages.HELP_MESSAGE
  } else if (keyword?.isUnidentifiedKeyword) {
    Sentry.captureMessage(`Unable to identify keyword ${keyword?.value}`, {
      extra: {
        ...body,
      },
      level: 'info',
      tags: {
        domain: 'smsEventsMessagesRoute',
      },
    })
  }

  const headers = new Headers()
  headers.set('Content-Type', 'text/xml')

  // If we don't respond the message with this xml Twilio will trigger a error event on the fails webhook
  const response = new twilio.twiml.MessagingResponse()

  if (message) {
    response.message(message)
  }

  return new Response(response.toString(), {
    headers,
    status: 200,
  })
})
