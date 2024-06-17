import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { verifySignature } from '@/lib/sms/verifySignature'

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

  console.log('POST /api/public/sms/events', request.body)

  return NextResponse.json({ ok: true })
}
