import * as Sentry from '@sentry/nextjs'

export async function onFailureCapitolCanary(functionId: string, error: Error) {
  error.name = functionId
  error.message = `Retry limit reached for ${functionId}: ${error.message}`
  Sentry.captureException(error, {
    level: 'error',
    tags: {
      functionId,
    },
  })
}
