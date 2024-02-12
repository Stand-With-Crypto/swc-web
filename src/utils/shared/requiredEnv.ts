import * as Sentry from '@sentry/nextjs'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const message = `Required environment variable ${name} is missing. Value was ${value}`
    // can't import NEXT_PUBLIC_ENVIRONMENT because it would be a circular dependency
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'local') {
      throw new Error(message)
    }
    Sentry.captureMessage(message, { extra: { value, name } })
  }
  return value!
}

export function requiredOutsideLocalEnv(value: string | undefined, name: string) {
  if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
    return value
  }
  return requiredEnv(value, name)
}
