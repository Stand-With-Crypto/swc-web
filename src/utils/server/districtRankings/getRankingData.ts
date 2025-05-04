import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { zodStateDistrict } from '@/validation/fields/zodAddress'

export type AdvocatesCountResult = {
  state: USStateCode
  district: string
  count: number
}

type AdvocatesCountByDistrictQueryResult = {
  state: string
  district: string | null
  count: number
}

type ReferralsCountByDistrictQueryResult = {
  state: string
  district: string | null
  refer_actions_count: number
  referrals: number
}

function isValidDistrict(state: string, district: string | null): boolean {
  const zodResult = zodStateDistrict.safeParse({ state, district })
  if (!zodResult.success) {
    logger.warn('[District Rankings] Invalid district', {
      state,
      district,
      errors: zodResult.error.errors,
    })
    return false
  }

  return true
}

export async function getAdvocatesCountByDistrict(
  stateCode: USStateCode,
): Promise<AdvocatesCountResult[]> {
  const results = await prismaClient.$queryRaw<AdvocatesCountByDistrictQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      -- Handle NULL district for DC, map it to '1' for consistency
      CASE
        WHEN a.administrative_area_level_1 = 'DC' THEN '1'
        ELSE a.us_congressional_district
      END as district,
      COUNT(DISTINCT u.id) as count
    FROM user_action ua
    INNER JOIN user u ON ua.user_id = u.id
    INNER JOIN address a ON u.address_id = a.id
    WHERE ua.action_type = ${UserActionType.OPT_IN}
      AND a.country_code = 'US'
      AND a.administrative_area_level_1 = ${stateCode}
    GROUP BY
      state,
      district
    HAVING COUNT(DISTINCT u.id) > 0
  `

  return results
    .filter(result => isValidDistrict(result.state, result.district))
    .map(({ state, district, count }) => ({
      state: state as USStateCode,
      district: district!,
      count: Number(count),
    }))
}

export async function getReferralsCountByDistrict(
  stateCode: USStateCode,
): Promise<AdvocatesCountResult[]> {
  const results = await prismaClient.$queryRaw<ReferralsCountByDistrictQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      -- Handle NULL district for DC, map it to '1' for consistency
      CASE
        WHEN a.administrative_area_level_1 = 'DC' THEN '1'
        ELSE a.us_congressional_district
      END as district,
      COUNT(DISTINCT ua.id) as refer_actions_count, -- Keep original alias if needed downstream
      SUM(uar.referrals_count) as referrals
    FROM user_action ua
    INNER JOIN user_action_refer uar ON ua.id = uar.id
    INNER JOIN address a ON uar.address_id = a.id
    WHERE ua.action_type = ${UserActionType.REFER}
      AND uar.referrals_count > 0
      AND a.country_code = 'US'
      AND a.administrative_area_level_1 = ${stateCode}
    GROUP BY
      state,
      district
    HAVING SUM(uar.referrals_count) > 0
  `

  return results
    .filter(result => isValidDistrict(result.state, result.district))
    .map(result => ({
      state: result.state as USStateCode,
      district: result.district!,
      count: Number(result.referrals),
    }))
}
