// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { ExtraErrorData } from '@sentry/integrations'
import * as Sentry from '@sentry/nextjs'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

const COMMON_ERROR_MESSAGES_TO_GROUP: string[] = [
  'No internet connection detected',
  "Failed to execute 'removeChild",
  'bytecode', // Can't find variable: bytecode
  'ResizeObserver loop', // ResizeObserver loop completed with undelivered notifications.
]

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
      const shouldSuppress = toBool(process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL) || !dsn
      console.error(
        `${shouldSuppress ? 'Suppressed ' : ''}Sentry`,
        hint?.originalException || hint?.syntheticException,
      )
      if (shouldSuppress) {
        return null
      }
    }
    try {
      const error = hint.originalException as Error
      const errorMessage = error?.message
      if (errorMessage) {
        COMMON_ERROR_MESSAGES_TO_GROUP.forEach(message => {
          if (errorMessage.indexOf(message) !== -1) {
            event.fingerprint = [`forceGroupErrorMessage-${message}`]
            console.log(`Sentry: Forced fingerprint to "${message}"`)
          }
        })
      }
    } catch (e) {
      console.error(e)
      console.log('Sentry: Failed to force fingerprint')
      return event
    }

    return event
  },
})
