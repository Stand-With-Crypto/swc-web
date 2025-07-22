import 'server-only'

import * as Sentry from '@sentry/nextjs'

import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'
import { ElectoralZone } from '@/utils/server/swcCivic/types'

export async function querySWCCivicElectoralZoneFromLatLong(
  latitude: number,
  longitude: number,
): Promise<ElectoralZone | undefined> {
  const geometryText = `POINT(${longitude} ${latitude})`

  // Prisma doesn't support postgis, so we're using raw SQL
  const electoralZoneMatches = (await civicPrismaClient.$queryRaw`
    SELECT zone_name, country_code, administrative_area FROM electoral_zones
    WHERE ST_Contains(
      zone_coordinates,
      ST_GeomFromText(${geometryText}, 4326)
    )
    ORDER BY updated_at DESC
  `) as {
    zone_name: string
    country_code: string
    administrative_area: string | null
  }[]

  if (!electoralZoneMatches || electoralZoneMatches.length === 0) return

  if (electoralZoneMatches.length > 1) {
    Sentry.captureMessage(
      `Found multiple electoral zones for the given latitude and longitude: ${latitude}, ${longitude}`,
      {
        level: 'warning',
        extra: {
          latitude,
          longitude,
          electoralZoneMatches,
        },
        tags: {
          domain: 'swc-civic',
        },
      },
    )
  }

  // We're using the latest updated_at value to get the most recent electoral zone
  const electoralZone = electoralZoneMatches[0]

  return {
    zoneName: electoralZone.zone_name,
    countryCode: electoralZone.country_code,
    administrativeArea: electoralZone.administrative_area,
  }
}
