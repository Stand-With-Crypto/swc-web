// eslint-disable-next-line
import * as Sentry from '@sentry/nextjs'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

export const runBin = async (fn: (...args: any[]) => Promise<any>) => {
  Sentry.init({
    environment: NEXT_PUBLIC_ENVIRONMENT,
    dsn,
    enabled: !!dsn,
    integrations: [Sentry.prismaIntegration()],
    tracesSampleRate: NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    normalizeDepth: 10,
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    beforeSend: (event, hint) => {
      if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
        const shouldSuppress = toBool(process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL) || !dsn
        console.error(
          `${shouldSuppress ? 'Suppressed ' : ''}Sentry`,
          hint?.originalException || hint?.syntheticException,
        )
        if (shouldSuppress) {
          return null
        }
      }
      return event
    },
  })

  return fn()
    .then(async () => {
      await prismaClient.$disconnect()
      await Sentry.flush(2000)
    })
    .catch(async (e: any) => {
      Sentry.captureException(e, { tags: { domain: 'runBin' } })
      await prismaClient.$disconnect()
      await Sentry.flush(2000)
      process.exit(1)
    })
}
