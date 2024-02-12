import * as Sentry from '@sentry/nextjs'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const gracefullyError = <Fallback>({
  msg,
  fallback,
  hint,
}: {
  msg: string
  fallback: Fallback
  hint?: Parameters<typeof Sentry.captureMessage>[1]
}): never => {
  if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
    throw new Error(msg)
  }
  Sentry.captureMessage(msg, hint || { tags: { parentDomain: 'gracefullyError' } })
  return fallback as never
}
