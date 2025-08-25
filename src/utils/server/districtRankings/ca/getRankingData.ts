import { UserActionType } from '@prisma/client'

import {
  AdvocatesCountByDistrictQueryResult,
  ReferralsCountByDistrictQueryResult,
} from '@/utils/server/districtRankings/types'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface AdvocatesCountResult {
  state: CAProvinceOrTerritoryCode
  district: string
  count: number
}

function isValidProvince(state: string): boolean {
  return Object.keys(CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP).includes(state)
}

function isValidAdvocatesResult(
  result: AdvocatesCountByDistrictQueryResult,
): result is AdvocatesCountByDistrictQueryResult & { district: string } {
  return isValidProvince(result.state) && result.district !== null
}

function isValidReferralsResult(
  result: ReferralsCountByDistrictQueryResult,
): result is ReferralsCountByDistrictQueryResult & { district: string } {
  return isValidProvince(result.state) && result.district !== null
}

export async function getCAAdvocatesCountByDistrict(
  stateCode: CAProvinceOrTerritoryCode,
): Promise<AdvocatesCountResult[]> {
  const results = await prismaClient.$queryRaw<AdvocatesCountByDistrictQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      a.electoral_zone as district,
      COUNT(DISTINCT u.id) as count
    FROM user_action ua
    INNER JOIN user u ON ua.user_id = u.id
    INNER JOIN address a ON u.address_id = a.id
    WHERE ua.action_type = ${UserActionType.OPT_IN}
      AND a.country_code = ${SupportedCountryCodes.CA}
      AND a.administrative_area_level_1 = ${stateCode}
    GROUP BY
      state,
      district
    HAVING COUNT(DISTINCT u.id) > 0
  `

  return results.filter(isValidAdvocatesResult).map(({ state, district, count }) => ({
    state: state as CAProvinceOrTerritoryCode,
    district,
    count: Number(count),
  }))
}

export async function getCAReferralsCountByDistrict(
  stateCode: CAProvinceOrTerritoryCode,
): Promise<AdvocatesCountResult[]> {
  const results = await prismaClient.$queryRaw<ReferralsCountByDistrictQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      a.electoral_zone as district,
      COUNT(DISTINCT ua.id) as refer_actions_count,
      SUM(uar.referrals_count) as referrals
    FROM user_action ua
    INNER JOIN user_action_refer uar ON ua.id = uar.id
    INNER JOIN address a ON uar.address_id = a.id
    WHERE ua.action_type = ${UserActionType.REFER}
      AND uar.referrals_count > 0
      AND a.country_code = ${SupportedCountryCodes.CA}
      AND a.administrative_area_level_1 = ${stateCode}
    GROUP BY
      state,
      district
    HAVING SUM(uar.referrals_count) > 0
  `

  return results.filter(isValidReferralsResult).map(result => ({
    state: result.state as CAProvinceOrTerritoryCode,
    district: result.district,
    count: Number(result.referrals),
  }))
}
