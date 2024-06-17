import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/utils/shared/logger'

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

  logger.info('POST /api/public/sms/events', request.body)

  return NextResponse.json({ ok: true })
}
