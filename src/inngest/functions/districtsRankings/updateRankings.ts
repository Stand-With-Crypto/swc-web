import { Logger } from 'inngest/middleware/logger'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { REDIS_KEYS } from '@/utils/server/districtRankings/constants'
import {
  AdvocatesCountResult,
  getAdvocatesCountByDistrict,
  getReferralsCountByDistrict,
} from '@/utils/server/districtRankings/getRankingData'
import { syncReferralsWithoutAddress } from '@/utils/server/districtRankings/syncReferralsWithoutAddress'
import { createDistrictRankingUpserter } from '@/utils/server/districtRankings/upsertRankings'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

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
    await step.run('Sync Referrals Without Address', async () => {
      logger.info("Syncing referrals without address to their users' current addresses")
      return await syncReferralsWithoutAddress()
    })

    const [districtAdvocatesCounts, districtsReferralsCount] = await Promise.all([
      step.run('Get Advocates Count by District', async () => {
        logger.info('Getting Advocates Count by District')
        return await queryUSStates({
          getRankingDataFn: getAdvocatesCountByDistrict,
          logger,
        })
      }),
      step.run('Get Referrals Count by District', async () => {
        logger.info('Getting Referrals Count by District')
        return await queryUSStates({
          getRankingDataFn: getReferralsCountByDistrict,
          logger,
        })
      }),
    ])

    const [districtAdvocatesRankingResults, districtReferralsRankingResults] = await Promise.all([
      step.run('Update Districts Advocates Rankings', async () => {
        const upsertDistrictAdvocatesRanking = await createDistrictRankingUpserter(
          REDIS_KEYS.DISTRICT_ADVOCATES_RANKING,
        )
        const results = await Promise.all(
          districtAdvocatesCounts.map(entry => upsertDistrictAdvocatesRanking(entry)),
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
        const upsertDistrictReferralsRanking = await createDistrictRankingUpserter(
          REDIS_KEYS.DISTRICT_REFERRALS_RANKING,
        )
        const results = await Promise.all(
          districtsReferralsCount.map(entry => upsertDistrictReferralsRanking(entry)),
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

async function queryUSStates({
  getRankingDataFn,
  logger,
}: {
  getRankingDataFn: (stateCode: USStateCode) => Promise<AdvocatesCountResult[]>
  logger: Logger
}) {
  const states = Object.keys(US_STATE_CODE_TO_DISTRICT_COUNT_MAP) as USStateCode[]
  const promises = states.map(stateCode => getRankingDataFn(stateCode))
  const results = await Promise.allSettled(promises)
  const allCounts: AdvocatesCountResult[] = []
  const failedStates: USStateCode[] = []

  results.forEach((result, index) => {
    const stateCode = states[index]
    if (result.status === 'fulfilled') {
      allCounts.push(...result.value)
    } else {
      logger.error(`Promise rejected for state ${stateCode}`, {
        reason: result.reason,
      })
      failedStates.push(stateCode)
    }
  })

  logger.info(
    `Fetched ${getRankingDataFn.name} counts. Success: ${states.length - failedStates.length}, Failed: ${failedStates.length}`,
  )
  return allCounts
}
