// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ExtraErrorData } from '@sentry/integrations'

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT!
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
Sentry.init({
  environment,
  dsn,
  enabled: !!dsn,
  tracesSampleRate: environment === 'production' ? 0.001 : 1.0,
  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: environment === 'production' ? 0.25 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

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
    if (environment === 'local' && process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL) {
      console.error(`Sentry Error:`, hint?.originalException || hint?.syntheticException)
      return null
    }
    return event
  },
})
