import { Address } from '@prisma/client'

import type { ElectoralZone } from '@/utils/server/swcCivic/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { apiUrls, fullUrl } from '@/utils/shared/urls'

export type GetElectoralZoneResult = Awaited<ReturnType<typeof getElectoralZone>>

const logger = getLogger('getElectoralZoneFromAddress')

export function maybeGetElectoralZoneFromAddress({
  address,
}: {
  address?: Pick<
    Address,
    'countryCode' | 'formattedDescription' | 'latitude' | 'longitude' | 'googlePlaceId'
  > | null
}) {
  if (!address) {
    return { notFoundReason: 'USER_WITHOUT_ADDRESS' as const }
  }
  if (address.latitude && address.longitude) {
    return getElectoralZoneFromGeolocation({
      latitude: address.latitude,
      longitude: address.longitude,
    })
  }
  return getElectoralZoneFromAddressOrPlaceId({
    address: address.formattedDescription,
    placeId: address?.googlePlaceId || undefined,
  })
}

export function getElectoralZoneFromAddressOrPlaceId({
  address,
  placeId,
}: {
  address: string
  placeId?: string
}) {
  const params = { address, placeId }
  return getElectoralZone(apiUrls.swcCivicElectoralZoneByAddress(params), { params })
}

export function getElectoralZoneFromGeolocation({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const params = { latitude, longitude }
  return getElectoralZone(apiUrls.swcCivicElectoralZoneByGeolocation(params), { params })
}

async function getElectoralZone(
  url: string,
  {
    params,
  }: {
    params: Record<string, any>
  },
) {
  try {
    const response = await fetchReq(fullUrl(url))
    const data = (await response.json()) as ElectoralZone
    if (!data) {
      return {
        notFoundReason: 'ELECTORAL_ZONE_NOT_FOUND' as const,
      }
    }
    return data
  } catch (error) {
    logger.error('Error fetching electoral zone:', { error, params })

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
