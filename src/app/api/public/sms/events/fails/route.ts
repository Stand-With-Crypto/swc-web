import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { prismaClient } from '@/utils/server/prismaClient'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { optOutUser } from '@/utils/server/sms/actions'
import * as smsErrorCodes from '@/utils/server/sms/errorCodes'
import { verifySignature } from '@/utils/server/sms/utils'

interface SMSFailedEvent {
  ParentAccountSid: string
  Payload: string // JSON string
  Level: 'ERROR' | 'WARNING'
  Timestamp: string
  PayloadType: string
  AccountSid: string
  Sid: string
}

interface SMSFailedEventPayload {
  resource_sid?: string
  service_sid?: string
  error_code?: string
}

// These errors are related to the user's mobile carrier not being available when we send messages
const filteredErrors = [
  smsErrorCodes.UNREACHABLE_DESTINATION_HANDSET_CODE,
  smsErrorCodes.UNKNOWN_DESTINATION_HANDSET_CODE,
  smsErrorCodes.FILTERED_TO_PREVENT_MESSAGE_LOOPS_CODE,
  smsErrorCodes.LANDLINE_OR_UNREACHABLE_CARRIER_CODE,
]

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const [isVerified, body] = await verifySignature<SMSFailedEvent>(request)

  if (!isVerified) {
    return new NextResponse('unauthorized', {
      status: 401,
    })
  }

  try {
    const payload = JSON.parse(body.Payload) as SMSFailedEventPayload

    const errorCode = payload.error_code ?? 'UNKNOWN_CODE'
    const messageId = payload.resource_sid

    if (errorCode && messageId) {
      await handleSMSErrors(errorCode, messageId)
    }

    if (!filteredErrors.includes(errorCode)) {
      Sentry.captureMessage(`SMS event ${body.Level}: ${errorCode}`, {
        extra: {
          body,
        },
        tags: {
          domain: 'smsEventsFailsRoute',
        },
      })
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: { body },
      tags: {
        domain: 'smsEventsFailsRoute',
      },
    })
  }

  return new NextResponse('success', {
    status: 200,
  })
})

async function handleSMSErrors(errorCode: string, messageId: string) {
  if (errorCode === smsErrorCodes.MESSAGE_BLOCKED_CODE) {
    const userCommunication = await prismaClient.userCommunication.findFirst({
      where: {
        messageId,
      },
      include: {
        userCommunicationJourney: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!userCommunication) return

    const user = userCommunication.userCommunicationJourney.user

    // Phone number is already normalized so we don't need to send the country code
    await optOutUser({ phoneNumber: user.phoneNumber, user })
  }
}
