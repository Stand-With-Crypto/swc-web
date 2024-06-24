import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { verifySignature } from '@/lib/sms'

interface SmsEvent {
  ParentAccountSid: string
  Payload: string // JSON string
  level: 'ERROR' | 'WARNING'
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

  try {
    const payload = JSON.parse(body.Payload) as SmsEventPayload

    Sentry.captureMessage(`SMS event ${body.level}: ${payload.error_code}`, {
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
}
