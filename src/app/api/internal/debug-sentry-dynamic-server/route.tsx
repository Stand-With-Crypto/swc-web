import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// A faulty API route to test Sentry's error monitoring
export async function GET() {
  console.log('api debug-sentry-dynamic-server log')
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return NextResponse.json({ message: 'not enabled in production' })
  }
  const randomDatabaseQuery = await prismaClient.authenticationNonce.findFirst()
  logger.info('randomDatabaseQuery', { randomDatabaseQuery })
  const baz = {} as any
  return NextResponse.json({ name: baz.foo.bar.doesNotExist })
}
