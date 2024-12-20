import * as Sentry from '@sentry/nextjs'

import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { sleep } from '@/utils/shared/sleep'

export const dynamic = 'force-dynamic'

const mockError = () =>
  sleep(1000).then(() => {
    throw new Error('mock error')
  })

export default async function DebugServerSentry() {
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return <div className="container max-w-lg">not enabled in production</div>
  }
  console.log('page debug-sentry-dynamic-server log')
  const randomDatabaseQuery = await prismaClient.authenticationNonce.findFirst()
  logger.info('randomDatabaseQuery', { randomDatabaseQuery })
  const scope = Sentry.getCurrentScope()
  scope.setExtras({
    debugSentry: 'debug-sentry-dynamic-server-value',
    now: new Date().toISOString(),
  })
  scope.setTags({ debugSentry: 'debug-sentry-dynamic-server-value' })
  const val = await mockError()
  return <div>This will never render {val}</div>
}
