import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/utils/shared/logger'

import { sendSMS } from '@/lib/sms'
import { verifySignature } from '@/lib/sms/verifySignature'

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

  logger.info(JSON.stringify(body))

  await sendSMS({
    body: 'Hello from the server',
    to: body.From,
  })

  if (body.Body === 'fail') {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 400,
      },
    )
  }

  return NextResponse.json({ ok: true })
}
