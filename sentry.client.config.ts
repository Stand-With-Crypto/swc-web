// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ExtraErrorData } from '@sentry/integrations'
import { toBool } from '@/utils/shared/toBool'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
Sentry.init({
  environment: NEXT_PUBLIC_ENVIRONMENT,
  dsn,
  tracesSampleRate: NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.001 : 1.0,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  normalizeDepth: 10,

  // replaysOnErrorSampleRate: 1.0,

  // // This sets the sample rate to be 10%. You may want this to be 100% while
  // // in development and sample at a lower rate in production
  // replaysSessionSampleRate: 0.001,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    new ExtraErrorData({ depth: 10 }),
    // new Sentry.Replay({
    //   // Additional Replay configuration goes in here, for example:
    //   maskAllText: true,
    //   blockAllMedia: true,
    // }),
  ],
  denyUrls: [
    /vitals\.vercel-analytics\.com/i,
    // Chrome extensions
    /chrome-extension:\//i,
    /extensions\//i,
    /^chrome:\/\//i,
  ],
  beforeSend: (event, hint) => {
    if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
      console.error(`Sentry`, hint?.originalException || hint?.syntheticException)
      if (toBool(process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL) || !dsn) {
        return null
      }
    }
    return event
  },
})
