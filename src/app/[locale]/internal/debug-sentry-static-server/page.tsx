import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { sleep } from '@/utils/shared/sleep'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.SECOND

const mockError = () =>
  sleep(1000).then(() => {
    throw new Error('mock error')
  })

export default async function DebugServerSentry() {
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return <div className="container max-w-lg">not enabled in production</div>
  }
  if (process.env.CI_OVERRIDES) {
    return (
      <div className="container max-w-lg">
        Because we pre-built a static version that doesn't error, you won't see any errors as an end
        user, but the revalidation attempt should still trigger an error in Sentry.
      </div>
    )
  }
  console.log('api debug-sentry-static-server log')
  const randomDatabaseQuery = await prismaClient.authenticationNonce.findFirst()
  logger.info('randomDatabaseQuery', { randomDatabaseQuery })
  const val = await mockError()
  return <div>This will never render {val}</div>
}
