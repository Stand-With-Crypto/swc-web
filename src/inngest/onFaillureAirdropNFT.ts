import { FailureEventArgs } from 'inngest'
import * as Sentry from '@sentry/nextjs'
import { UserAction } from '@prisma/client'

export async function onFailureAirdropNFT(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })

  //Update action to failed
  const action = failureEventArgs.event.data.event.data.userAction as UserAction
}
