// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ExtraErrorData } from '@sentry/integrations'
import { prismaClient } from '@/utils/server/prismaClient'
import { ProfilingIntegration } from '@sentry/profiling-node'

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT!
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  environment,
  dsn,
  enabled: !!dsn,
  integrations: [
    new ExtraErrorData({ depth: 10 }),
    new Sentry.Integrations.Prisma({ client: prismaClient }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: environment === 'production' ? 0.001 : 1.0,
  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: environment === 'production' ? 0.25 : 1.0,

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
