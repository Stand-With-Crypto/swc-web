import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { withUserSession } from '@/utils/server/serverWrappers/withUserSession'
import { verifySignature } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'

interface SmsEvent {
  ParentAccountSid: string
  Payload: string // JSON string
  Level: 'ERROR' | 'WARNING'
  Timestamp: string
  PayloadType: string
  AccountSid: string
  Sid: string
}

interface SmsEventPayload {
  resource_sid: string
  service_sid: string
  error_code: string
}

const logger = getLogger('sms-fails')

export const POST = withUserSession(async (request: NextRequest) => {
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

  try {
    const payload = JSON.parse(body.Payload) as SmsEventPayload

    logger.info('Payload', JSON.stringify(payload))

    Sentry.captureMessage(`SMS event ${body.Level}: ${payload.error_code}`, {
      extra: {
        body,
      },
      tags: {
        domain: 'smsEventsFailsRoute',
      },
    })
  } catch (error) {
    Sentry.captureException(error, {
      extra: { body },
      tags: {
        domain: 'smsEventsFailsRoute',
      },
    })
  }

  return NextResponse.json({ ok: true })
})
