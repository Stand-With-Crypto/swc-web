import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { REDIS_KEYS } from '@/utils/server/districtRankings/constants'
import {
  getAdvocatesCountByDistrict,
  getReferralsCountByDistrict,
} from '@/utils/server/districtRankings/getRankingData'
import { createDistrictRankingUpserter } from '@/utils/server/districtRankings/upsertRankings'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const UPDATE_DISTRICT_RANKINGS_CRON_JOB_FUNCTION_ID = 'script.update-districts-rankings'
const UPDATE_DISTRICT_RANKINGS_CRON_JOB_SCHEDULE = '0 */1 * * *' // every 1 hour
const UPDATE_DISTRICT_RANKINGS_INNGEST_EVENT_NAME = 'script/update-districts-rankings'

export interface UpdateDistrictsRankingsCronJobSchema {
  name: typeof UPDATE_DISTRICT_RANKINGS_INNGEST_EVENT_NAME
}

export const updateDistrictsRankings = inngest.createFunction(
  {
    id: UPDATE_DISTRICT_RANKINGS_CRON_JOB_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: UPDATE_DISTRICT_RANKINGS_CRON_JOB_SCHEDULE }
      : { event: UPDATE_DISTRICT_RANKINGS_INNGEST_EVENT_NAME }),
  },
  async ({ step, logger }) => {
    const [districtAdvocatesCounts, districtsReferralsCount] = await Promise.all([
      step.run('Get Advocates Count by District', async () => {
        logger.info('Getting Advocates Count by District')
        return await getAdvocatesCountByDistrict()
      }),
      step.run('Get Referrals Count by District', async () => {
        logger.info('Getting Referrals Count by District')
        return await getReferralsCountByDistrict()
      }),
    ])

    const upsertDistrictAdvocatesRanking = createDistrictRankingUpserter(
      REDIS_KEYS.DISTRICT_ADVOCATES_RANKING,
    )
    const upsertDistrictReferralsRanking = createDistrictRankingUpserter(
      REDIS_KEYS.DISTRICT_REFERRALS_RANKING,
    )

    const [districtAdvocatesRankingResults, districtReferralsRankingResults] = await Promise.all([
      step.run('Update Districts Advocates Rankings', async () => {
        const results = await Promise.all(
          districtAdvocatesCounts.map(entry => {
            logger.info(`Updating District Advocates Count for ${entry.state}-${entry.district}`)
            return upsertDistrictAdvocatesRanking(entry)
          }),
        )

        const successfulResults = results.filter(result => result.success)
        const failedResults = results.filter(result => !result.success)

        return {
          totalResults: results.length,
          successfulResults: successfulResults.length,
          failedResults: failedResults.length,
          failedEntries: failedResults.map(result => result.entry),
        }
      }),
      step.run('Update Districts Referrals Ranking', async () => {
        const results = await Promise.all(
          districtsReferralsCount.map(entry => {
            logger.info(`Updating District Referrals Count for ${entry.state}-${entry.district}`)
            return upsertDistrictReferralsRanking(entry)
          }),
        )

        const successfulResults = results.filter(result => result.success)
        const failedResults = results.filter(result => !result.success)

        return {
          totalResults: results.length,
          successfulResults: successfulResults.length,
          failedResults: failedResults.length,
          failedEntries: failedResults.map(result => result.entry),
        }
      }),
    ])

    return {
      districtAdvocatesCountEntries: districtAdvocatesCounts.length,
      districtAdvocatesRankingResults,
      districtReferralsCountEntries: districtsReferralsCount.length,
      districtReferralsRankingResults,
    }
  },
)
