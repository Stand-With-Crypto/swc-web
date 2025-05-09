import 'server-only'

import { GetCongressionalDistrictQuery } from '@/data/postgis/types'

import { queryPostgis } from './client'

export const getUSCongressionalDistrict: GetCongressionalDistrictQuery = async ({
  latitude,
  longitude,
}) => {
  const res = await queryPostgis<{ namelsad: string; statefp: string }>(`
        SELECT
            namelsad,
            statefp
        FROM
            us_congressional_district
        WHERE
            ST_Contains(
                wkb_geometry,
                ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)
            )
    `)

  if (!res || res.rows.length === 0) return

  const { namelsad, statefp } = res.rows[0]

  return {
    congressionalDistrictName: namelsad.match(/(\d+)/)?.[0] ?? '',
    stateCode: statefp,
  }
}

export const getCAElectoralDistrict: GetCongressionalDistrictQuery = async ({
  latitude,
  longitude,
}) => {
  const res = await queryPostgis<{ name: string }>(`
        SELECT
            name
        FROM
            ca_electoral_districts
        WHERE
            ST_Contains(
                wkb_geometry,
                ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)
            )
    `)

  if (!res || res.rows.length === 0) return

  const { name } = res.rows[0]

  return {
    congressionalDistrictName: name,
  }
}

export const getUKParliamentaryConstituency: GetCongressionalDistrictQuery = async ({
  latitude,
  longitude,
}) => {
  const res = await queryPostgis<{ pcon24nm: string }>(`
        SELECT
            pcon24nm
        FROM
            uk_parliamentary_constituency
        WHERE
            ST_Contains(
                wkb_geometry,
                ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)
            )
    `)

  if (!res || res.rows.length === 0) return

  const { pcon24nm } = res.rows[0]

  return {
    congressionalDistrictName: pcon24nm,
  }
}

export const getAUFederalElectoralDistrict: GetCongressionalDistrictQuery = async ({
  latitude,
  longitude,
}) => {
  const res = await queryPostgis<{ elect_div: string }>(`
        SELECT
            elect_div
        FROM
            au_federal_electoral_district
        WHERE
            ST_Contains(
                wkb_geometry,
                ST_GeomFromText('POINT(${longitude} ${latitude})', 4283)
            )
    `)

  if (!res || res.rows.length === 0) return

  const { elect_div } = res.rows[0]

  return {
    congressionalDistrictName: elect_div,
  }
}
