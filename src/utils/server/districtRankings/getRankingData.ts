import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { zodStateDistrict } from '@/validation/fields/zodAddress'

type Result = {
  state: USStateCode
  district: string
  count: number
}

type AdvocatesCountByDistrictQueryResult = {
  state: string
  district: string
  count: number
}

type ReferralsCountByDistrictQueryResult = {
  state: string
  district: string
  refer_actions_count: number
  referrals: number
}

function isValidDistrict(state: string, district: string): boolean {
  const zodResult = zodStateDistrict.safeParse({ state, district })
  if (!zodResult.success) {
    logger.warn('[District Rankings] Invalid district:', {
      state,
      district,
      errors: zodResult.error.errors,
    })
    return false
  }

  return true
}

export async function getAdvocatesCountByDistrict(): Promise<Result[]> {
  const results = await prismaClient.$queryRaw<AdvocatesCountByDistrictQueryResult[]>`
    WITH valid_addresses AS (
      SELECT
        a.administrative_area_level_1,
        a.us_congressional_district,
        a.id
      FROM address a
      WHERE a.country_code = 'US'
        AND a.us_congressional_district IS NOT NULL
        AND a.us_congressional_district != ''
        AND a.us_congressional_district REGEXP '^[0-9]+$'
        AND a.administrative_area_level_1 IS NOT NULL
        AND a.administrative_area_level_1 != ''
        AND a.administrative_area_level_1 != 'DC'
    )
    SELECT
      va.administrative_area_level_1 as state,
      va.us_congressional_district as district,
      COUNT(DISTINCT u.id) as count
    FROM valid_addresses va
    INNER JOIN user u ON u.address_id = va.id
    INNER JOIN user_action ua ON ua.user_id = u.id
    WHERE ua.action_type = ${UserActionType.OPT_IN}
    GROUP BY
      va.administrative_area_level_1,
      va.us_congressional_district
    HAVING count > 0

    UNION ALL

    SELECT
      'DC' as state,
      '1' as district,
      COUNT(DISTINCT u.id) as count
    FROM address a
    INNER JOIN user u ON u.address_id = a.id
    INNER JOIN user_action ua ON ua.user_id = u.id
    WHERE a.country_code = 'US'
      AND a.administrative_area_level_1 = 'DC'
      AND ua.action_type = ${UserActionType.OPT_IN}
    HAVING count > 0
  `

  return results
    .filter(result => isValidDistrict(result.state, result.district))
    .map(({ state, district, count }) => ({
      state: state as USStateCode,
      district,
      count: Number(count),
    }))
}

/*
 * Looks at the address stored in UserActionRefer records to determine which district
 * a referral should be attributed to. Users can have multiple UserActionRefer records if they've
 * made referrals while living in different districts.
 */
export async function getReferralsCountByDistrict(): Promise<Result[]> {
  const results = await prismaClient.$queryRaw<ReferralsCountByDistrictQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      a.us_congressional_district as district,
      COUNT(DISTINCT ua.id) as refer_actions_count,
      SUM(uar.referrals_count) as referrals
    FROM user_action_refer uar
    INNER JOIN user_action ua ON ua.id = uar.id
    INNER JOIN address a ON a.id = uar.address_id
    WHERE a.country_code = 'US'
      AND a.administrative_area_level_1 IS NOT NULL
      AND a.administrative_area_level_1 != ''
      AND a.administrative_area_level_1 != 'DC'
      AND a.us_congressional_district IS NOT NULL
      AND a.us_congressional_district != ''
      AND a.us_congressional_district REGEXP '^[0-9]+$'
      AND ua.action_type = ${UserActionType.REFER}
      AND uar.referrals_count > 0
    GROUP BY
      a.administrative_area_level_1,
      a.us_congressional_district
    HAVING referrals > 0

    UNION ALL

    SELECT
      'DC' as state,
      '1' as district,
      COUNT(DISTINCT ua.id) as refer_actions_count,
      SUM(uar.referrals_count) as referrals
    FROM user_action_refer uar
    INNER JOIN user_action ua ON ua.id = uar.id
    INNER JOIN address a ON a.id = uar.address_id
    WHERE a.country_code = 'US'
      AND a.administrative_area_level_1 = 'DC'
      AND ua.action_type = ${UserActionType.REFER}
      AND uar.referrals_count > 0
    HAVING referrals > 0
  `

  return results
    .filter(result => isValidDistrict(result.state, result.district))
    .map(result => ({
      state: result.state as USStateCode,
      district: result.district,
      count: Number(result.referrals),
    }))
}
