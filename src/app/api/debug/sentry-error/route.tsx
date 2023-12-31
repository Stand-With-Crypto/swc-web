import { prismaClient } from '@/utils/server/prismaClient'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// A faulty API route to test Sentry's error monitoring
export async function GET() {
  const randomDatabaseQuery = await prismaClient.authenticationNonce.findFirst()
  const baz = {} as any
  return NextResponse.json({ name: baz.foo.bar.doesNotExist })
}
