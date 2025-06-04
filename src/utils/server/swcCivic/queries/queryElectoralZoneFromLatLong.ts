import 'server-only'

import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'
import { ElectoralZone } from '@/utils/server/swcCivic/types'

export async function querySWCCivicElectoralZoneFromLatLong(
  latitude: number,
  longitude: number,
): Promise<ElectoralZone | undefined> {
  const geometryText = `POINT(${longitude} ${latitude})`

  // Prisma doesn't support postgis, so we're using raw SQL
  const electoralZoneMatches = (await civicPrismaClient.$queryRaw`
    SELECT zone_name, state_code, country_code FROM electoral_zones
    WHERE ST_Contains(
      zone_coordinates,
      ST_GeomFromText(${geometryText}, 4326)
    )
  `) as { zone_name: string; state_code: string | null; country_code: string }[]

  if (!electoralZoneMatches || electoralZoneMatches.length === 0) return

  const electoralZone = electoralZoneMatches[0]

  return {
    zoneName: electoralZone.zone_name,
    stateCode: electoralZone.state_code,
    countryCode: electoralZone.country_code,
  }
}
