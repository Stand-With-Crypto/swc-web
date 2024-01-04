// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ExtraErrorData } from '@sentry/integrations'
import { prismaClient } from '@/utils/server/prismaClient'

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT!
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  environment,
  dsn,
  enabled: !!dsn,
  integrations: [
    new ExtraErrorData({ depth: 10 }),
    new Sentry.Integrations.Prisma({ client: prismaClient }),
  ],
  tracesSampleRate: environment === 'production' ? 0.001 : 1.0,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  beforeSend: (event, hint) => {
    if (environment === 'local') {
      console.error(`Sentry Error:`, hint?.originalException || hint?.syntheticException)
      if (process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL || !dsn) {
        return null
      }
    }
    return event
  },
})
