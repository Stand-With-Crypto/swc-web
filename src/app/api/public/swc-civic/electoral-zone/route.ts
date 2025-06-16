import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { getLatLongFromAddress } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('swcCivicElectoralZoneRoute')

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')

  logger.info('GET', { address })

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  let latitude: number | null = null
  let longitude: number | null = null

  try {
    logger.info('Getting latitude and longitude for address', address)

    const { latitude: lat, longitude: lng } = await getLatLongFromAddress(address)

    latitude = lat
    longitude = lng
  } catch {
    return NextResponse.json({ error: 'Unable to get latitude and longitude' }, { status: 400 })
  }

  logger.info('Getting electoral zone for lat/long', { latitude, longitude })

  const electoralZone = await querySWCCivicElectoralZoneFromLatLong(latitude, longitude)

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
