import 'server-only'

import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'

export async function querySWCCivicConstituencyFromLatLong(latitude: number, longitude: number) {
  const geometryText = `POINT(${longitude} ${latitude})`

  const constituencyMatches = (await civicPrismaClient.$queryRaw`
    SELECT name, state_code FROM constituencies
    WHERE ST_Contains(
      wkb_geometry,
      ST_GeomFromText(${geometryText}, 4326)
    )
  `) as { name: string; state_code?: string }[]

  if (!constituencyMatches || constituencyMatches.length === 0) return

  const constituency = constituencyMatches[0]

  return {
    name: constituency.name,
    stateCode: constituency.state_code,
  }
}
