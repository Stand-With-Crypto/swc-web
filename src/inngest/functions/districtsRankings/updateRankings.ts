import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { REDIS_KEYS } from '@/utils/server/districtRankings/constants'
import {
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
const DB_CONNECTION_LIMIT = 50

export interface UpdateDistrictsRankingsCronJobSchema {
  name: typeof UPDATE_DISTRICT_RANKINGS_INNGEST_EVENT_NAME
}

export const updateDistrictsRankings = inngest.createFunction(
  {
    id: UPDATE_DISTRICT_RANKINGS_CRON_JOB_FUNCTION_ID,
    onFailure: onScriptFailure,
    concurrency: DB_CONNECTION_LIMIT,
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

    const stateCodes = Object.keys(US_STATE_CODE_TO_DISTRICT_COUNT_MAP) as USStateCode[]
    const advocatesCountPromises = []
    const referralsCountPromises = []
    for (const stateCode of stateCodes) {
      advocatesCountPromises.push(
        step.run(`Get Advocates Count by District for ${stateCode}`, async () => {
          logger.info(`Getting Advocates Count by District for ${stateCode}`)
          return await getAdvocatesCountByDistrict(stateCode)
        }),
      )
      referralsCountPromises.push(
        step.run(`Get Referrals Count by District for ${stateCode}`, async () => {
          logger.info(`Getting Referrals Count by District for ${stateCode}`)
          return await getReferralsCountByDistrict(stateCode)
        }),
      )
    }
    const advocatesCountsByDistrictEntries = (await Promise.all(advocatesCountPromises)).flat()
    const referralsCountByDistrictEntries = (await Promise.all(referralsCountPromises)).flat()

    const [advocatesRankingResults, referralsRankingResults] = await Promise.all([
      step.run('Update Districts Advocates Rankings', async () => {
        const upsertDistrictAdvocatesRanking = await createDistrictRankingUpserter(
          REDIS_KEYS.DISTRICT_ADVOCATES_RANKING,
        )
        const results = await Promise.all(
          advocatesCountsByDistrictEntries.map(entry => upsertDistrictAdvocatesRanking(entry)),
        )

        const successfulResults = results.filter(result => result.success)
        const failedResults = results.filter(result => !result.success)

        return {
          totalEntries: results.length,
          successfulEntries: successfulResults.map(result => result.entry),
          successful: successfulResults.length,
          failedEntries: failedResults.map(result => result.entry),
          failed: failedResults.length,
        }
      }),

      step.run('Update Districts Referrals Ranking', async () => {
        const upsertDistrictReferralsRanking = await createDistrictRankingUpserter(
          REDIS_KEYS.DISTRICT_REFERRALS_RANKING,
        )
        const results = await Promise.all(
          referralsCountByDistrictEntries.map(entry => upsertDistrictReferralsRanking(entry)),
        )

        const successfulResults = results.filter(result => result.success)
        const failedResults = results.filter(result => !result.success)

        return {
          totalEntries: results.length,
          successfulEntries: successfulResults.map(result => result.entry),
          successful: successfulResults.length,
          failedEntries: failedResults.map(result => result.entry),
          failed: failedResults.length,
        }
      }),
    ])

    return {
      advocatesCountsByDistrictEntries: advocatesCountsByDistrictEntries.length,
      advocatesRankingResults,
      referralsCountByDistrictEntries: referralsCountByDistrictEntries.length,
      referralsRankingResults,
    }
  },
)
