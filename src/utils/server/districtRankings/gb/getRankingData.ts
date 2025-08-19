import { UserActionType } from '@prisma/client'

import {
  AdvocatesCountByDistrictQueryResult,
  ReferralsCountByDistrictQueryResult,
} from '@/utils/server/districtRankings/types'
import { prismaClient } from '@/utils/server/prismaClient'
import { GB_REGIONS, GBRegion } from '@/utils/shared/stateMappings/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface AdvocatesCountResult {
  state: GBRegion
  district: string
  count: number
}

function isValidConstituency(constituency: string): boolean {
  return GB_REGIONS.includes(constituency)
}

function isValidAdvocatesResult(
  result: AdvocatesCountByDistrictQueryResult,
): result is AdvocatesCountByDistrictQueryResult & { district: string } {
  return isValidConstituency(result.state) && result.district !== null
}

function isValidReferralsResult(
  result: ReferralsCountByDistrictQueryResult,
): result is ReferralsCountByDistrictQueryResult & { district: string } {
  return isValidConstituency(result.state) && result.district !== null
}

export async function getGBAdvocatesCountByConstituency(
  region: GBRegion,
): Promise<AdvocatesCountResult[]> {
  const results = await prismaClient.$queryRaw<AdvocatesCountByDistrictQueryResult[]>`
    SELECT
      a.swc_civic_administrative_area as state,
      a.electoral_zone as district,
      COUNT(DISTINCT u.id) as count
    FROM user_action ua
    INNER JOIN user u ON ua.user_id = u.id
    INNER JOIN address a ON u.address_id = a.id
    WHERE ua.action_type = ${UserActionType.OPT_IN}
      AND a.country_code = ${SupportedCountryCodes.GB}
      AND a.swc_civic_administrative_area = ${region}
    GROUP BY
      state,
      district
    HAVING COUNT(DISTINCT u.id) > 0
  `

  return results.filter(isValidAdvocatesResult).map(({ state, district, count }) => ({
    state: state as GBRegion,
    district,
    count: Number(count),
  }))
}

export async function getGBReferralsCountByConstituency(
  region: GBRegion,
): Promise<AdvocatesCountResult[]> {
  const results = await prismaClient.$queryRaw<ReferralsCountByDistrictQueryResult[]>`
    SELECT
      a.swc_civic_administrative_area as state,
      a.electoral_zone as district,
      COUNT(DISTINCT ua.id) as refer_actions_count,
      SUM(uar.referrals_count) as referrals
    FROM user_action ua
    INNER JOIN user_action_refer uar ON ua.id = uar.id
    INNER JOIN address a ON uar.address_id = a.id
    WHERE ua.action_type = ${UserActionType.REFER}
      AND uar.referrals_count > 0
      AND a.country_code = ${SupportedCountryCodes.GB}
      AND a.swc_civic_administrative_area = ${region}
    GROUP BY
      state,
      district
    HAVING SUM(uar.referrals_count) > 0
  `

  return results.filter(isValidReferralsResult).map(result => ({
    state: result.state as GBRegion,
    district: result.district,
    count: Number(result.referrals),
  }))
}
