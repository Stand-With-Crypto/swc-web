// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { ExtraErrorData } from '@sentry/integrations'
import * as Sentry from '@sentry/nextjs'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  environment: NEXT_PUBLIC_ENVIRONMENT,
  dsn,
  enabled: !!dsn,
  integrations: [
    new ExtraErrorData({ depth: 10 }),
    new Sentry.Integrations.Prisma({ client: prismaClient }),
  ],
  tracesSampleRate: NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.001 : 1.0,
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
