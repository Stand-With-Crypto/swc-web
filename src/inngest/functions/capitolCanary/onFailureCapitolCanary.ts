import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs } from 'inngest'

export async function onFailureCapitolCanary(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })
}
