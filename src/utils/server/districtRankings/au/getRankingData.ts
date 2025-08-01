import { UserActionType } from '@prisma/client'

import {
  AdvocatesCountByDistrictQueryResult,
  ReferralsCountByDistrictQueryResult,
} from '@/utils/server/districtRankings/types'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface AdvocatesCountResult {
  state: AUStateCode
  district: string
  count: number
}

function isValidState(state: string): boolean {
  return Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP).includes(state)
}

export async function getAUAdvocatesCountByDistrict(
  stateCode: AUStateCode,
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
      AND a.country_code = ${SupportedCountryCodes.AU}
      AND a.administrative_area_level_1 = ${stateCode}
    GROUP BY
      state,
      district
    HAVING COUNT(DISTINCT u.id) > 0
  `

  return results
    .filter(result => isValidState(result.state))
    .map(({ state, district, count }) => ({
      state: state as AUStateCode,
      district: district!,
      count: Number(count),
    }))
}

export async function getAUReferralsCountByDistrict(
  stateCode: AUStateCode,
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
      AND a.country_code = ${SupportedCountryCodes.AU}
      AND a.administrative_area_level_1 = ${stateCode}
    GROUP BY
      state,
      district
    HAVING SUM(uar.referrals_count) > 0
  `

  return results
    .filter(result => isValidState(result.state))
    .map(result => ({
      state: result.state as AUStateCode,
      district: result.district!,
      count: Number(result.referrals),
    }))
}
