import * as Sentry from '@sentry/nextjs'

import { ElectoralZoneNotFoundReason } from '@/utils/shared/getElectoralZoneFromAddress'
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
  notFoundReason: ElectoralZoneNotFoundReason
  countryCode?: string
  domain: string
}) {
  logger.error(`No electoral zone found for address ${address} with code ${notFoundReason}`)
  if (
    [
      ElectoralZoneNotFoundReason.CIVIC_API_DOWN,
      ElectoralZoneNotFoundReason.UNEXPECTED_ERROR,
    ].includes(notFoundReason)
  ) {
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
