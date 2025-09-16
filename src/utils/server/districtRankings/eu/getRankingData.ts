import { AdvocatesCountResult } from '@/utils/server/districtRankings/getRankingData'
import { logger } from '@/utils/shared/logger'

export async function getEUAdvocatesCountByDistrict(
  countryCode: string,
): Promise<AdvocatesCountResult[]> {
  logger.info('getEUAdvocatesCountByDistrict', { countryCode })
  // TODO(EU): Implement EU advocates count by district
  return []
}

export async function getEUReferralsCountByDistrict(
  countryCode: string,
): Promise<AdvocatesCountResult[]> {
  logger.info('getEUReferralsCountByDistrict', { countryCode })
  // TODO(EU): Implement EU referrals count by district
  return []
}
