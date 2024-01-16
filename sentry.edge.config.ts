// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ExtraErrorData } from '@sentry/integrations'
import { toBool } from '@/utils/shared/toBool'

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT!
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  environment,
  dsn,
  integrations: [new ExtraErrorData({ depth: 10 })],
  tracesSampleRate: environment === 'production' ? 0.001 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  beforeSend: (event, hint) => {
    if (environment === 'local') {
      console.error(`Sentry`, hint?.originalException || hint?.syntheticException)
      if (toBool(process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL) || !dsn) {
        return null
      }
    }
    return event
  },
})
