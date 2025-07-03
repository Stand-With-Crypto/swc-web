import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { getLatLongFromAddressOrPlaceId } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('swcCivicElectoralZoneByAddressRoute')

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')
  const placeId = url.searchParams.get('placeId')

  logger.info('GET', { address, placeId })

  if (!address && !placeId) {
    return NextResponse.json({ error: 'Either address or placeId is required' }, { status: 400 })
  }

  let latitude, longitude
  try {
    logger.info('Getting latitude and longitude for address/placeId', { address, placeId })

    const result = await getLatLongFromAddressOrPlaceId({
      address: address || '',
      placeId: placeId || '',
    })
    latitude = result.latitude
    longitude = result.longitude
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

  const electoralZone = await querySWCCivicElectoralZoneFromLatLong(latitude, longitude)

  if (!electoralZone) {
    logger.error('Electoral zone not found', { address, placeId, latitude, longitude })
    Sentry.captureMessage('Electoral zone not found', {
      extra: { address, placeId, latitude, longitude },
      tags: {
        domain: 'swc-civic',
      },
    })
    return NextResponse.json({ error: 'Electoral zone not found' }, { status: 404 })
  }

  return NextResponse.json(electoralZone)
}
