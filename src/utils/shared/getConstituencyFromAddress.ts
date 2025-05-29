import { Address } from '@prisma/client'

import type { SWCCivicConstituency } from '@/utils/server/swcCivic/queries/queryConstituencyFromLatLong'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { apiUrls } from '@/utils/shared/urls'

export type ConstituencyFromAddress = Awaited<ReturnType<typeof getConstituencyFromAddress>>

export type GetConstituencyFromAddressSuccess = NonNullable<SWCCivicConstituency>

const logger = getLogger('getConstituencyFromAddress')

export async function maybeGetConstituencyFromAddress(
  address?: Pick<Address, 'countryCode' | 'formattedDescription' | 'googlePlaceId'> | null,
) {
  if (!address) {
    return { notFoundReason: 'USER_WITHOUT_ADDRESS' as const }
  }

  const constituency = await getConstituencyFromAddress(
    address.formattedDescription,
    address.googlePlaceId,
  )

  return constituency
}

export async function getConstituencyFromAddress(address: string, placeId?: string | null) {
  try {
    const response = await fetchReq(apiUrls.swcCivicConstituencyFromAddress({ address, placeId }))

    const data = (await response.json()) as SWCCivicConstituency

    if (!data) {
      return {
        notFoundReason: 'CONSTITUENCY_NOT_FOUND' as const,
      }
    }

    return data
  } catch (error) {
    logger.error('Error fetching constituency:', error)

    if (error instanceof Response) {
      logger.info('Response error status:', error.status)
      if (error.status === 404) {
        logger.info('Constituency not found (404)')
        return {
          notFoundReason: 'CONSTITUENCY_NOT_FOUND' as const,
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
