import * as Sentry from '@sentry/nextjs'

import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('logElectoralZoneNotFound')

export function logElectoralZoneNotFound({
  address,
  notFoundReason,
  domain,
}: {
  address: string
  notFoundReason: string
  domain: string
}) {
  logger.error(`No electoral zone found for address ${address} with code ${notFoundReason}`)
  if (['CIVIC_API_DOWN', 'UNEXPECTED_ERROR'].includes(notFoundReason)) {
    Sentry.captureMessage(`No electoral zone found for address`, {
      extra: {
        domain,
        notFoundReason,
        address,
      },
    })
  }
}
