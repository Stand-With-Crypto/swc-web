import { Address } from '@prisma/client'

import type { ElectoralZone } from '@/utils/server/swcCivic/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { apiUrls } from '@/utils/shared/urls'

export type ElectoralZoneFromAddress = Awaited<ReturnType<typeof getElectoralZoneFromAddress>>

const logger = getLogger('getElectoralZoneFromAddress')

export function maybeGetElectoralZoneFromAddress(
  address?: Pick<Address, 'countryCode' | 'formattedDescription'> | null,
) {
  if (!address) {
    return { notFoundReason: 'USER_WITHOUT_ADDRESS' as const }
  }

  return getElectoralZoneFromAddress(address.formattedDescription)
}

export async function getElectoralZoneFromAddress(address: string) {
  try {
    const response = await fetchReq(apiUrls.swcCivicElectoralZoneFromAddress(address))

    const data = (await response.json()) as ElectoralZone

    if (!data) {
      return {
        notFoundReason: 'ELECTORAL_ZONE_NOT_FOUND' as const,
      }
    }

    return data
  } catch (error) {
    logger.error('Error fetching electoral zone:', error)

    if (error instanceof Response) {
      logger.info('Response error status:', error.status)
      if (error.status === 404) {
        logger.info('Electoral zone not found (404)')
        return {
          notFoundReason: 'ELECTORAL_ZONE_NOT_FOUND' as const,
        }
      }
      logger.info('Unexpected response error:', error.status)
    }

    logger.info(
      'Unexpected error occurred:',
      error instanceof Error ? error.message : 'Unknown error type',
    )
    return {
      notFoundReason: 'UNEXPECTED_ERROR' as const,
    }
  }
}
