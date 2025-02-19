import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { zodStateDistrict } from '@/validation/fields/zodAddress'

type RawQueryResult = {
  state: string
  district: string
  count: number
}

type ReferralsCountByDistrictResult = {
  state: string
  district: string
  users_count: number
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

export async function getAdvocatesCountByDistrict(): Promise<RawQueryResult[]> {
  const results = await prismaClient.$queryRaw<RawQueryResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      a.us_congressional_district as district,
      COUNT(DISTINCT u.id) as count
    FROM address a
    INNER JOIN user u ON u.address_id = a.id
    INNER JOIN user_action ua ON ua.user_id = u.id
    WHERE a.country_code = 'US'
      AND a.us_congressional_district IS NOT NULL
      AND a.us_congressional_district != ''
      AND a.us_congressional_district REGEXP '^[0-9]+$'
      AND a.administrative_area_level_1 IS NOT NULL
      AND a.administrative_area_level_1 != ''
      AND a.administrative_area_level_1 != 'DC'
      AND ua.action_type = ${UserActionType.OPT_IN}
    GROUP BY
      a.administrative_area_level_1,
      a.us_congressional_district
    HAVING count > 0

    UNION ALL

    SELECT
      'DC' as state,
      'N/A' as district,
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
      state,
      district,
      count: Number(count),
    }))
}

export async function getReferralsCountByDistrict(): Promise<RawQueryResult[]> {
  const results = await prismaClient.$queryRaw<ReferralsCountByDistrictResult[]>`
    SELECT
      a.administrative_area_level_1 as state,
      a.us_congressional_district as district,
      COUNT(DISTINCT u.id) as users_count,
      COUNT(DISTINCT ua.id) as refer_actions_count,
      SUM(uar.referrals_count) as referrals
    FROM user_action_refer uar
    INNER JOIN user_action ua ON ua.id = uar.id
    INNER JOIN user u ON u.id = ua.user_id
    INNER JOIN address a ON a.id = u.address_id
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
      'N/A' as district,
      COUNT(DISTINCT u.id) as users_count,
      COUNT(DISTINCT ua.id) as refer_actions_count,
      SUM(uar.referrals_count) as referrals
    FROM user_action_refer uar
    INNER JOIN user_action ua ON ua.id = uar.id
    INNER JOIN user u ON u.id = ua.user_id
    INNER JOIN address a ON a.id = u.address_id
    WHERE a.country_code = 'US'
      AND a.administrative_area_level_1 = 'DC'
      AND ua.action_type = ${UserActionType.REFER}
      AND uar.referrals_count > 0
    HAVING referrals > 0
  `

  const filteredResults = results.filter(r => r.refer_actions_count !== r.users_count)
  if (filteredResults.length > 0) {
    logger.warn('Found districts where users have multiple REFER actions:', filteredResults)
    Sentry.captureMessage('Found districts where users have multiple REFER actions:', {
      extra: { results: filteredResults },
      tags: { domain: 'referrals' },
      level: 'error',
    })
  }

  return filteredResults
    .filter(result => isValidDistrict(result.state, result.district))
    .map(result => ({
      state: result.state,
      district: result.district,
      count: Number(result.referrals),
    }))
}
