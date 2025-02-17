import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/usStateUtils'

type RawQueryResult = {
  state: string
  district: string
  count: number
}

function isValidDistrict(state: string, district: string): boolean {
  const stateDistrictCount = US_STATE_CODE_TO_DISTRICT_COUNT_MAP[state as USStateCode]
  if (!stateDistrictCount) {
    logger.warn('[District Rankings] State not found in district map:', { state })
    return false
  }

  const districtNum = parseInt(district, 10)
  if (isNaN(districtNum) || districtNum <= 0 || districtNum > stateDistrictCount) {
    logger.warn('[District Rankings] Invalid district number:', { state, district })
    return false
  }

  return true
}

/**
 * Count seems wrong. Need to double check, update mockCreateUserActionReferInput
 */
export async function getAdvocatesCountByDistrict(): Promise<RawQueryResult[]> {
  const results = await prismaClient.$queryRaw<RawQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      a.us_congressional_district as district,
      COUNT(DISTINCT u.id) as count
    FROM address a
    INNER JOIN user u ON u.address_id = a.id
    WHERE a.country_code = 'US'
      AND a.administrative_area_level_1 IS NOT NULL
      AND a.administrative_area_level_1 != ''
      AND a.us_congressional_district IS NOT NULL
      AND a.us_congressional_district != ''
      AND a.us_congressional_district REGEXP '^[0-9]+$'
    GROUP BY a.administrative_area_level_1, a.us_congressional_district
    HAVING count > 0
  `

  // logger.info('Raw results:', {
  //   totalResults: results.length,
  //   sampleResults: results.slice(0, 5),
  // })

  const validResults = results
    .filter(result => isValidDistrict(result.state, result.district))
    .map(({ state, district, count }) => ({
      state,
      district,
      count: Number(count),
    }))

  // logger.info('Valid results:', {
  //   totalValidResults: validResults.length,
  //   sampleValidResults: validResults.slice(0, 5),
  // })

  return validResults
}

export async function getReferralsCountByDistrict(): Promise<RawQueryResult[]> {
  const results = await prismaClient.$queryRaw<RawQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      a.us_congressional_district as district,
      COUNT(DISTINCT u.id) * MAX(uar.referrals_count) as count
    FROM address a
    INNER JOIN user u ON u.address_id = a.id
    INNER JOIN user_action ua ON ua.user_id = u.id
    INNER JOIN user_action_refer uar ON uar.id = ua.id
    WHERE a.country_code = 'US'
      AND a.administrative_area_level_1 IS NOT NULL
      AND a.administrative_area_level_1 != ''
      AND a.us_congressional_district IS NOT NULL
      AND a.us_congressional_district != ''
      AND a.us_congressional_district REGEXP '^[0-9]+$'
      AND ua.action_type = ${UserActionType.REFER}
    GROUP BY a.administrative_area_level_1, a.us_congressional_district
    HAVING count > 0
  `

  // logger.info('Raw results:', {
  //   totalResults: results.length,
  //   sampleResults: results.slice(0, 5),
  // })

  const validResults = results
    .filter(result => isValidDistrict(result.state, result.district))
    .map(result => ({
      state: result.state,
      district: result.district,
      count: Number(result.count),
    }))

  // logger.info('Valid results:', {
  //   totalValidResults: validResults.length,
  //   sampleValidResults: validResults.slice(0, 5),
  // })

  return validResults
}
