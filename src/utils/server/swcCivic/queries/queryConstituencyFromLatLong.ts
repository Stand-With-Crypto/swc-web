import 'server-only'

import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'

export type SWCCivicConstituency = Awaited<ReturnType<typeof querySWCCivicConstituencyFromLatLong>>

export async function querySWCCivicConstituencyFromLatLong(latitude: number, longitude: number) {
  const geometryText = `POINT(${longitude} ${latitude})`

  const constituencyMatches = (await civicPrismaClient.$queryRaw`
    SELECT constituency_name, state_code, country_code FROM constituencies
    WHERE ST_Contains(
      geometry,
      ST_GeomFromText(${geometryText}, 4326)
    )
  `) as { constituency_name: string; state_code?: string; country_code: string }[]

  if (!constituencyMatches || constituencyMatches.length === 0) return

  const constituency = constituencyMatches[0]

  return {
    constituencyName: constituency.constituency_name,
    stateCode: constituency.state_code,
    countryCode: constituency.country_code,
  }
}
