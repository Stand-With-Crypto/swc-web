import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('swcCivicElectoralZoneByGeolocationRoute')

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  const latitudeParam = url.searchParams.get('latitude')
  const longitudeParam = url.searchParams.get('longitude')

  const latitude = latitudeParam ? Number(latitudeParam) : null
  const longitude = longitudeParam ? Number(longitudeParam) : null

  logger.info('GET', { latitude, longitude })

  if (!latitude || !longitude) {
    return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 })
  }

  const electoralZone = await querySWCCivicElectoralZoneFromLatLong(latitude, longitude)

  if (!electoralZone) {
    logger.error('Electoral zone not found', { latitude, longitude })
    Sentry.captureMessage('Electoral zone not found for geolocation', {
      extra: { latitude, longitude },
      tags: {
        domain: 'swc-civic',
      },
    })
    return NextResponse.json({ error: 'Electoral zone not found' }, { status: 404 })
  }

  return NextResponse.json(electoralZone)
}
