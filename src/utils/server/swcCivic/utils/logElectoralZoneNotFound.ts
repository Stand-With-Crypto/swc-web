import * as Sentry from '@sentry/nextjs'

import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('logElectoralZoneNotFound')

export function logElectoralZoneNotFound({
  address,
  placeId,
  countryCode,
  notFoundReason,
  domain,
}: {
  address: string
  placeId?: string
  notFoundReason: string
  countryCode?: string
  domain: string
}) {
  logger.error(`No electoral zone found for address ${address} with code ${notFoundReason}`)
  if (['CIVIC_API_DOWN', 'UNEXPECTED_ERROR'].includes(notFoundReason)) {
    Sentry.captureMessage(`No electoral zone found for address`, {
      tags: {
        domain,
        countryCode,
      },
      extra: {
        placeId,
        notFoundReason,
        address,
      },
    })
  }
}
