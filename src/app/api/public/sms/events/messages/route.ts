import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/utils/shared/logger'

import { parseTwilioBody } from '@/lib/sms'
import { verifySignature } from '@/lib/sms/verifySignature'

const logger = getLogger('sms-events')

export async function POST(request: NextRequest) {
  const isVerified = await verifySignature(request)

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
    const rawBody = await request.text()
    const body = parseTwilioBody(rawBody)

    logger.info({ body })
  } catch (error) {
    logger.error(error)
  }

  return NextResponse.json({ ok: true })
}
