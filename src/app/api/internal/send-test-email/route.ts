import { NextResponse } from 'next/server'

import { sendMail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET() {
  await sendMail()
  return NextResponse.json({ success: true })
}
