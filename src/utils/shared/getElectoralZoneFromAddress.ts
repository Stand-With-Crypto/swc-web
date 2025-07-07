import { Address } from '@prisma/client'

import type { ElectoralZone } from '@/utils/server/swcCivic/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { apiUrls } from '@/utils/shared/urls'

export type GetElectoralZoneResult = Awaited<ReturnType<typeof parseCivicApiResults>>

const logger = getLogger('getElectoralZoneFromAddress')

export async function maybeGetElectoralZoneFromAddress({
  address,
}: {
  address?: Pick<
    Address,
    'formattedDescription' | 'latitude' | 'longitude' | 'googlePlaceId'
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

export async function getElectoralZoneFromAddressOrPlaceId({
  address,
  placeId,
}: {
  address: string
  placeId?: string
}) {
  const params = { address, placeId }
  try {
    const response = await fetchReq(apiUrls.swcCivicElectoralZoneByAddress(params))
    return parseCivicApiResults(response)
  } catch (error) {
    return parseCivicApiError(error)
  }
}

export async function getElectoralZoneFromGeolocation({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const params = { latitude, longitude }
  try {
    const response = await fetchReq(apiUrls.swcCivicElectoralZoneByGeolocation(params))
    return parseCivicApiResults(response)
  } catch (error) {
    return parseCivicApiError(error)
  }
}

async function parseCivicApiResults(response: Response) {
  try {
    const data = (await response.json()) as ElectoralZone
    if (!data) {
      return {
        notFoundReason: 'ELECTORAL_ZONE_NOT_FOUND' as const,
      }
    }
    return data
  } catch (error) {
    return parseCivicApiError(error)
  }
}

function parseCivicApiError(error: unknown) {
  logger.error('Error fetching electoral zone:', { error })
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
