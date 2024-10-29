// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

import { getIsSupportedBrowser, maybeDetectBrowser } from './maybeDetectBrowser'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

const COMMON_ERROR_MESSAGES_TO_GROUP = [
  'No internet connection detected',
  "Failed to execute 'removeChild",
  'bytecode', // Can't find variable: bytecode
  'ResizeObserver loop', // ResizeObserver loop completed with undelivered notifications.
  'Load failed',
  'Failed to fetch',
  "Failed to read the 'localStorage'",
  'Converting circular structure to JSON',
  "Cannot read properties of undefined (reading 'call')",
  'JSON.stringify cannot serialize cyclic structures',
  "Cannot read properties of null (reading 'getItem')",
  'The operation is insecure',
  'The object can not be found here',
  'Properties can only be defined on Objects',
  'network error',
  'localStorage',
  'TLS connection',
  'Unexpected end of',
  'Unknown root exit status',
  'No match for candidates between decisionDesk and DTSI.',
]

const COMMON_TRANSACTION_NAMES_TO_GROUP = ['node_modules/@thirdweb-dev', 'maps/api/js', '/races']

const isSupportedBrowser = getIsSupportedBrowser(maybeDetectBrowser())

Sentry.init({
  environment: NEXT_PUBLIC_ENVIRONMENT,
  dsn,
  tracesSampleRate: NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  normalizeDepth: 10,

  // replaysOnErrorSampleRate: 1.0,

  // // This sets the sample rate to be 10%. You may want this to be 100% while
  // // in development and sample at a lower rate in production
  // replaysSessionSampleRate: 0.001,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.extraErrorDataIntegration({ depth: 10 }),
    Sentry.replayIntegration({
      // see https://docs.sentry.io/platforms/javascript/session-replay/configuration/#using-a-custom-compression-worker
      // NOTE: when upgrading Sentry major versions we need to manually update this file for compatibility
      workerUrl: '/workers/sentry.worker.js',
    }),
  ],
  denyUrls: [
    /vitals\.vercel-analytics\.com/i,
    // Chrome extensions
    /chrome-extension:\//i,
    /extensions\//i,
    /^chrome:\/\//i,
    /inject/i,
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  ignoreErrors: [
    // `Can't find variable: bytecode`,
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],
  beforeSend: (event, hint) => {
    // prevent local errors from triggering sentry
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

    // prevent legacy browsers from triggering sentry
    if (!isSupportedBrowser) {
      return null
    }

    // force group common transaction names
    try {
      const transaction = event.transaction
      console.log('transaction name match against COMMON_TRANSACTION_NAMES_TO_GROUP', transaction)
      if (transaction) {
        COMMON_TRANSACTION_NAMES_TO_GROUP.forEach(message => {
          if (transaction.indexOf(message) !== -1) {
            event.fingerprint = [`forceGroupErrorTransaction-${message}`]
            console.log(
              `Sentry: Forced fingerprint to "${message}" transaction from "${transaction}"`,
            )
          }
        })
      }
    } catch (e) {
      console.error(e)
      console.log('Sentry: Failed to force transaction fingerprint')
      return event
    }

    // force group error names
    try {
      const errorMessage = getErrorMessage(hint.originalException)
      console.log('error message to match against COMMON_ERROR_MESSAGES_TO_GROUP', errorMessage)
      if (errorMessage) {
        COMMON_ERROR_MESSAGES_TO_GROUP.forEach(message => {
          if (errorMessage.indexOf(message) !== -1) {
            event.fingerprint = [`forceGroupErrorMessage-${message}`]
            console.log(`Sentry: Forced fingerprint to "${message}" message from "${errorMessage}"`)
          }
        })
      }
    } catch (e) {
      console.error(e)
      console.log('Sentry: Failed to force error message fingerprint')
      return event
    }

    return event
  },
})

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (error instanceof PromiseRejectionEvent) {
    return JSON.stringify(error.reason)
  }

  return JSON.stringify(error)
}
