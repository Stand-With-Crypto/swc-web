// https://github.com/prisma/prisma/issues/2789
// Prisma doesn't support PostGIS, so we need to use raw SQL queries
import 'server-only'

import { GetConstituencyQuery } from '@/utils/server/swcCivic/types'

import { civicPrismaClient } from './civicPrismaClient'

export const getUSCongressionalDistrict: GetConstituencyQuery = async ({ latitude, longitude }) => {
  const geometryText = `POINT(${longitude} ${latitude})`

  const res = (await civicPrismaClient.$queryRaw`
    SELECT namelsad, statefp FROM us_congressional_district
    WHERE ST_Contains(
      wkb_geometry,
      ST_GeomFromText(${geometryText}, 4326)
    )
  `) as { namelsad: string; statefp: string }[]

  if (!res || res.length === 0) return

  const { namelsad, statefp } = res[0]

  return {
    name: namelsad.match(/(\d+)/)?.[0] ?? '',
    stateCode: statefp,
  }
}

export const getCAElectoralDistrict: GetConstituencyQuery = async ({ latitude, longitude }) => {
  const geometryText = `POINT(${longitude} ${latitude})`

  const res = (await civicPrismaClient.$queryRaw`
    SELECT name FROM ca_electoral_districts
    WHERE ST_Contains(
      wkb_geometry,
      ST_GeomFromText(${geometryText}, 4326)
    )
  `) as { name: string }[]

  if (!res || res.length === 0) return

  const { name } = res[0]

  return {
    name,
  }
}

export const getUKParliamentaryConstituency: GetConstituencyQuery = async ({
  latitude,
  longitude,
}) => {
  const geometryText = `POINT(${longitude} ${latitude})`

  const res = (await civicPrismaClient.$queryRaw`
    SELECT pcon24nm FROM uk_parliamentary_constituency
    WHERE ST_Contains(
      wkb_geometry,
      ST_GeomFromText(${geometryText}, 4326)
    )
  `) as { pcon24nm: string }[]

  if (!res || res.length === 0) return

  const { pcon24nm } = res[0]

  return {
    name: pcon24nm,
  }
}

export const getAUFederalElectoralDistrict: GetConstituencyQuery = async ({
  latitude,
  longitude,
}) => {
  const geometryText = `POINT(${longitude} ${latitude})`

  const res = (await civicPrismaClient.$queryRaw`
    SELECT elect_div FROM au_federal_electoral_district
    WHERE ST_Contains(
      wkb_geometry,
      ST_GeomFromText(${geometryText}, 4283)
    )
  `) as { elect_div: string }[]

  if (!res || res.length === 0) return

  const { elect_div } = res[0]

  return {
    name: elect_div,
  }
}
