import * as Sentry from '@sentry/nextjs'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

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
        return event
      },
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
        return event
      },
    })
  }
}

export const onRequestError = Sentry.captureRequestError
