import * as Sentry from '@sentry/nextjs'

import { isKnownBotUserAgent } from '@/utils/shared/botUserAgent'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

const SENTRY_SUPPRESSED_INNGEST_FUNCTIONS = [
  'script.backfill-address-electoral-zone-processor',
  'script.backfill-address-fields-with-google-places-processor',
  'script.backfill-intl-users.processor',
]

function suppressSentryErrorOrReturnEvent(
  event: Sentry.ErrorEvent,
  hint: Sentry.EventHint,
  dsn: string | undefined,
) {
  const requestUrl = event?.request?.url

  const isSuppressedInngestFunction = SENTRY_SUPPRESSED_INNGEST_FUNCTIONS.some(functionId =>
    requestUrl?.includes(functionId),
  )

  let shouldSuppress = false

  if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
    shouldSuppress =
      toBool(process.env.SUPPRESS_SENTRY_ERRORS_ON_LOCAL) || !dsn || isSuppressedInngestFunction
  } else {
    shouldSuppress = isSuppressedInngestFunction
  }

  if (shouldSuppress) {
    console.error(
      `${isSuppressedInngestFunction ? 'Inngest ' : ''}${shouldSuppress ? 'Suppressed ' : ''}Sentry`,
      hint?.originalException || hint?.syntheticException,
    )
    return null
  }

  // tag errors if user agent is a known bot
  const headers = event.request?.headers
  const isBot = isKnownBotUserAgent(headers?.['user-agent'])
  if (isBot) {
    event.tags = { ...(event.tags || {}), agent: 'bot' }
  }

  return event
}

export function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  // This configures the initialization of Sentry on the server.
  // The config you add here will be used whenever the server handles a request.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      environment: NEXT_PUBLIC_ENVIRONMENT,
      dsn,
      enabled: !!dsn,
      integrations: [Sentry.prismaIntegration()],
      tracesSampleRate: NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      normalizeDepth: 10,
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
      beforeSend: (event, hint) => {
        return suppressSentryErrorOrReturnEvent(event, hint, dsn)
      },
    })

    // Capture unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      Sentry.withScope(scope => {
        scope.setTags({ domain: 'unhandledRejection' })
        scope.setExtras({ promise: promise.toString(), timestamp: new Date().toISOString() })
        Sentry.captureException(reason)
      })
    })

    // Capture uncaught exceptions
    process.on('uncaughtException', error => {
      Sentry.withScope(scope => {
        scope.setTags({ domain: 'uncaughtException' })
        scope.setExtras({ timestamp: new Date().toISOString() })
        Sentry.captureException(error)
      })
    })
  }

  // This configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
  // The config you add here will be used whenever one of the edge features is loaded.
  // Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/
  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      environment: NEXT_PUBLIC_ENVIRONMENT,
      dsn,
      tracesSampleRate: 0,
      normalizeDepth: 10,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
      beforeSend: (event, hint) => {
        return suppressSentryErrorOrReturnEvent(event, hint, dsn)
      },
    })
  }
}

// Global error handler for all API routes and server components
export async function onRequestError(
  error: unknown,
  request: {
    path: string
    method: string
    headers: Record<string, string | string[]>
    url?: string
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'route' | 'page' | 'middleware' | 'instrumentation'
  },
) {
  // Check if this is an internal server error that should be logged
  if (isInternalServerError(error)) {
    // Capture error with rich context using Sentry's withScope
    Sentry.withScope(scope => {
      scope.setTags({
        domain: 'globalErrorHandler',
        method: request.method,
        routerKind: context.routerKind,
        routeType: context.routeType,
        routePath: context.routePath,
      })

      scope.setExtras({
        url: request.url || request.path,
        method: request.method,
        headers: request.headers,
        routerKind: context.routerKind,
        routePath: context.routePath,
        routeType: context.routeType,
        timestamp: new Date().toISOString(),
        userAgent: request.headers['user-agent'],
      })

      Sentry.captureRequestError(error, request, context)
    })
  }
}

function isInternalServerError(error: unknown): boolean {
  const err = error as any

  if (err.name === 'ZodError' || err.code === 'VALIDATION_ERROR' || err?.status < 500) {
    return false
  }

  return true
}
