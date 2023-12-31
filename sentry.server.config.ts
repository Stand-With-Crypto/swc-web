// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ExtraErrorData } from '@sentry/integrations'
import { prismaClient } from '@/utils/server/prismaClient'

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT!
Sentry.init({
  environment,
  dsn: 'https://dff9eff805af3477fcfcfb5e088bc7dd@o4506490716422144.ingest.sentry.io/4506490717470720',
  integrations: [
    new ExtraErrorData({ depth: 10 }),
    new Sentry.Integrations.Prisma({ client: prismaClient }),
  ],
  tracesSampleRate: environment === 'production' ? 0.001 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  beforeSend: (event, hint) => {
    if (environment === 'local' && process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL) {
      console.error(`Sentry Error:`, hint?.originalException || hint?.syntheticException)
      return null
    }
    return event
  },
})
