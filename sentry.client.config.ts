// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { isKnownBotClient } from '@/utils/shared/botUserAgent'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

import { getIsSupportedBrowser, maybeDetectBrowser } from './maybeDetectBrowser'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const shouldSuppress = toBool(process.env.NEXT_PUBLIC_SUPPRESS_SENTRY_ERRORS_ON_LOCAL) || !dsn

// We need to group these errors because the URL includes the placeId
const GOOGLE_PLACES_API_ERRORS_TO_GROUP = [
  '429 from GET https://places.googleapis.com',
  '400 from GET https://places.googleapis.com',
  '403 from GET https://places.googleapis.com',
  '404 from GET https://places.googleapis.com',
  '500 from GET https://places.googleapis.com',
]

const COMMON_ERROR_MESSAGES_TO_GROUP = [
  'No internet connection detected',
  "Failed to execute 'removeChild",
  'bytecode', // Can't find variable: bytecode
  'ResizeObserver loop', // ResizeObserver loop completed with undelivered notifications.
  'Load failed',
  'Failed to fetch',
  'Could not assign Magic Eden provider',
  "Failed to read the 'localStorage'",
  'Converting circular structure to JSON',
  "Cannot read properties of undefined (reading 'call')",
  'JSON.stringify cannot serialize cyclic structures',
  "Cannot read properties of null (reading 'getItem')",
  'The operation is insecure',
  'The object can not be found here',
  'Properties can only be defined on Objects',
  "Cannot assign to read only property 'push' of object '[object Array]'",
  "Cannot assign to read only property 'toString' of object '#<Object>'",
  "Cannot assign to read only property 'error' of object '#<Object>'",
  "Cannot assign to read only property 'constructor' of object '[object Object]'",
  'network error',
  'localStorage',
  'TLS connection',
  'Unexpected end of',
  'Unknown root exit status',
  'Non-Error promise rejection captured with value',
  'Unexpected token',
  'fetch failed',
  'undefined is not an object',
  'null is not an object',
  'Connection closed',
  '500 from GET /api/public/recent-activity/30/restrictToUS',
  '500 from GET /api/public/homepage/top-level-metrics/not-set',
  'Could not load "places_impl"',
  'Could not load "util"',
  'No place found for address',
  'Electoral zone not found',
  'window.webkit.messageHandlers',
  "Right-hand side of 'instanceof' is not an object",
  'ObjectMultiplex - malformed chunk without name',
  'Refused to evaluate a string as JavaScript',
  'No officials found for your information',
  'TOO_SHORT',
  "unsafe-eval' is not an allowed source of script",

  ...GOOGLE_PLACES_API_ERRORS_TO_GROUP,
]

const COMMON_TRANSACTION_NAMES_TO_GROUP = ['node_modules/@thirdweb-dev', 'maps/api/js']

// List of parent page URLs where errors should be ignored
// If the app is embedded in an iframe on any of these domains,
// Sentry will discard errors to avoid unnecessary reporting.
const IGNORED_IFRAME_PARENT_URLS = ['https://builder.io/']

const isSupportedBrowser = getIsSupportedBrowser(maybeDetectBrowser())

// Single source of truth for log prefixes and messages
const LOG_MESSAGE_PREFIXES = {
  suppressedMessage: shouldSuppress ? 'Suppressed Sentry' : 'Sentry',
  forceFingerprintTransaction: 'Sentry: Forced fingerprint to',
  forceFingerprintError: 'Sentry: Forced fingerprint to',
  transactionNameMatch: 'transaction name match against COMMON_TRANSACTION_NAMES_TO_GROUP',
  errorMessageMatch: 'error message to match against COMMON_ERROR_MESSAGES_TO_GROUP',
  failedTransactionFingerprint: 'Sentry: Failed to force transaction fingerprint',
  failedErrorFingerprint: 'Sentry: Failed to force error message fingerprint',
}

// Define prefixes for skipping log messages
const LOG_PREFIXES = Object.values(LOG_MESSAGE_PREFIXES)

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
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
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
    /As of March 1st, 2025, google\.maps\.places.*/i,

    // Network errors are being ignored here because of this investigation: https://github.com/Stand-With-Crypto/swc-web/issues/2408
    'network error',
    /^TypeError: network error$/,

    // Thirdweb error spam on wallet connection
    /cannot initialize wallet, no user logged in/i,
    /Error auto connecting wallet: Cannot set a wallet without an account as active/i,
    /AutoConnect timeout/i,
  ],
  beforeSend: (event, hint) => {
    // tag errors if user agent is a known bot
    if (isKnownBotClient()) {
      event.tags = { ...(event.tags || {}), agent: 'bot' }
    }

    // prevent local errors from triggering sentry
    if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
      console.debug(
        LOG_MESSAGE_PREFIXES.suppressedMessage,
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

    const errorMessage = getErrorMessage(hint.originalException)

    // skip logging if the console log matches known prefixes
    if (errorMessage && LOG_PREFIXES.some(prefix => errorMessage.startsWith(prefix))) {
      return null
    }

    // Check if the current window is within an iframe
    if (window.self !== window.top) {
      // Retrieve the URL of the parent frame
      const parentUrl = document.referrer

      if (IGNORED_IFRAME_PARENT_URLS.some(url => url.startsWith(parentUrl))) {
        return null
      }
    }

    // force group common transaction names
    try {
      const transaction = event.transaction
      console.log(LOG_MESSAGE_PREFIXES.transactionNameMatch, transaction)
      if (transaction) {
        COMMON_TRANSACTION_NAMES_TO_GROUP.forEach(message => {
          if (transaction.indexOf(message) !== -1) {
            event.fingerprint = [`forceGroupErrorTransaction-${message}`]
            console.log(
              `${LOG_MESSAGE_PREFIXES.forceFingerprintTransaction} "${message}" transaction from "${transaction}"`,
            )
          }
        })
      }
    } catch (e) {
      console.error(LOG_MESSAGE_PREFIXES.failedTransactionFingerprint, e)
      return event
    }

    // force group error names
    try {
      console.log(LOG_MESSAGE_PREFIXES.errorMessageMatch, errorMessage)
      if (errorMessage) {
        COMMON_ERROR_MESSAGES_TO_GROUP.forEach(message => {
          if (errorMessage.indexOf(message) !== -1) {
            event.fingerprint = [`forceGroupErrorMessage-${message}`]
            console.log(
              `${LOG_MESSAGE_PREFIXES.forceFingerprintError} "${message}" message from "${errorMessage}"`,
            )
          }
        })
      }
    } catch (e) {
      console.error(LOG_MESSAGE_PREFIXES.failedErrorFingerprint, e)
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

  return typeof error !== 'string' ? JSON.stringify(error) : error
}
