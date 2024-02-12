import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { NextResponse } from 'next/server'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.SECOND

// A faulty API route to test Sentry's error monitoring
export async function GET() {
  if (process.env.CI_OVERRIDES) {
    return NextResponse.json({
      message: `Because we pre-built a static version that doesn't error, you won't see any errors as an end user, but the revalidation attempt should still trigger an error in Sentry.`,
    })
  }
  console.log('api debug-sentry-static-server log')
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return NextResponse.json({ message: 'not enabled in production' })
  }
  const randomDatabaseQuery = await prismaClient.authenticationNonce.findFirst()
  logger.info('randomDatabaseQuery', { randomDatabaseQuery })
  const baz = {} as any
  return NextResponse.json({ name: baz.foo.bar.doesNotExist })
}
