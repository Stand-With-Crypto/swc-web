import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { ElectoralZone } from '@/utils/server/swcCivic/types'
import { getLatLongFromAddressOrPlaceId } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('swcCivicElectoralZoneRoute')

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')
  const placeId = url.searchParams.get('placeId')
  const latitudeParam = url.searchParams.get('latitude')
  const longitudeParam = url.searchParams.get('longitude')

  const latitude: number | null = latitudeParam ? Number(latitudeParam) : null
  const longitude: number | null = longitudeParam ? Number(longitudeParam) : null

  logger.info('GET', { address, latitude, longitude, placeId })

  if (!address && !placeId && (!latitude || !longitude)) {
    return NextResponse.json(
      { error: 'Either address, placeId, or both latitude and longitude are required' },
      { status: 400 },
    )
  }

  let electoralZone: ElectoralZone | undefined
  if (latitude && longitude) {
    logger.info('Getting electoral zone from lat/long', { latitude, longitude })
    electoralZone = await querySWCCivicElectoralZoneFromLatLong(latitude, longitude)
  } else if (placeId || address) {
    logger.info('Getting electoral zone from address or placeId', { placeId, address })
    try {
      const { latitude: lat, longitude: lng } = await getLatLongFromAddressOrPlaceId({
        placeId: placeId || '',
        address: address || '',
      })
      electoralZone = await querySWCCivicElectoralZoneFromLatLong(lat, lng)
    } catch (e) {
      Sentry.captureException(e, {
        extra: { address, placeId },
        level: 'error',
        tags: {
          domain: 'swc-civic',
        },
      })
      return NextResponse.json({ error: 'Unable to get latitude and longitude' }, { status: 400 })
    }
  }

  if (!electoralZone) {
    logger.error('Electoral zone not found', { address, latitude, longitude })
    Sentry.captureMessage('Electoral zone not found', {
      extra: { address, latitude, longitude },
      tags: {
        domain: 'swc-civic',
      },
    })
    return NextResponse.json({ error: 'Electoral zone not found' }, { status: 404 })
  }

  return NextResponse.json(electoralZone)
}
