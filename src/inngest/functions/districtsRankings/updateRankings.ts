import pRetry from 'p-retry'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import {
  getAdvocatesCountByDistrict,
  getReferralsCountByDistrict,
} from '@/utils/server/districtRankings/getRankingData'
import { syncReferralsWithoutAddress } from '@/utils/server/districtRankings/syncReferralsWithoutAddress'
import { createDistrictRankingUpserter } from '@/utils/server/districtRankings/upsertRankings'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UPDATE_DISTRICT_RANKINGS_CRON_JOB_FUNCTION_ID = 'script.update-districts-rankings'
const UPDATE_DISTRICT_RANKINGS_CRON_JOB_SCHEDULE = '0 */1 * * *' // every 1 hour
const UPDATE_DISTRICT_RANKINGS_INNGEST_EVENT_NAME = 'script/update-districts-rankings'

export interface UpdateDistrictsRankingsCronJobSchema {
  name: typeof UPDATE_DISTRICT_RANKINGS_INNGEST_EVENT_NAME
}

const COUNTRY_CODE_TO_STATES_CODES_MAP: Record<SupportedCountryCodes, string[]> = {
  [SupportedCountryCodes.US]: Object.keys(US_STATE_CODE_TO_DISTRICT_COUNT_MAP) as USStateCode[],
  [SupportedCountryCodes.CA]: Object.keys(
    CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  ) as CAProvinceCode[],
  [SupportedCountryCodes.GB]: [],
  [SupportedCountryCodes.AU]: Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP) as AUStateCode[],
}

const COUNTRIES_TO_UPDATE_RANKINGS_FOR = [
  SupportedCountryCodes.US,
  SupportedCountryCodes.CA,
  SupportedCountryCodes.AU,
]

interface ExecutionResult {
  advocatesCountsByDistrictEntries: number
  advocatesRankingResults: number
  referralsCountByDistrictEntries: number
  referralsRankingResults: number
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
    const initialExecutionResults: ExecutionResult = {
      advocatesCountsByDistrictEntries: 0,
      advocatesRankingResults: 0,
      referralsCountByDistrictEntries: 0,
      referralsRankingResults: 0,
    }

    const executionResults: Record<SupportedCountryCodes, ExecutionResult> = {
      [SupportedCountryCodes.US]: initialExecutionResults,
      [SupportedCountryCodes.CA]: initialExecutionResults,
      [SupportedCountryCodes.GB]: initialExecutionResults,
      [SupportedCountryCodes.AU]: initialExecutionResults,
    }

    await step.run('Sync Referrals Without Address', async () => {
      logger.info("Syncing referrals without address to their users' current addresses")
      return await syncReferralsWithoutAddress()
    })

    for (const countryCode of COUNTRIES_TO_UPDATE_RANKINGS_FOR) {
      const stateCodes = COUNTRY_CODE_TO_STATES_CODES_MAP[countryCode]

      const advocatesCountsByDistrictEntries = await step.run(
        `[${countryCode.toUpperCase()}] Get Advocates Count by District`,
        async () => {
          logger.info(`[${countryCode.toUpperCase()}] Getting Advocates Count by District`)

          const promises = stateCodes.map(stateCode =>
            pRetry(async () => await getAdvocatesCountByDistrict(countryCode, stateCode)),
          )

          const settledResults = await Promise.allSettled(promises)
          const successfulResults = settledResults.filter(result => result.status === 'fulfilled')
          return successfulResults.map(result => result.value).flat()
        },
      )

      const referralsCountByDistrictEntries = await step.run(
        `[${countryCode.toUpperCase()}] Get Referrals Count by District`,
        async () => {
          logger.info(`[${countryCode.toUpperCase()}] Getting Referrals Count by District`)
          const promises = stateCodes.map(stateCode =>
            pRetry(async () => await getReferralsCountByDistrict(countryCode, stateCode)),
          )
          const settledResults = await Promise.allSettled(promises)
          const successfulResults = settledResults.filter(result => result.status === 'fulfilled')
          return successfulResults.map(result => result.value).flat()
        },
      )

      const [advocatesRankingResults, referralsRankingResults] = await Promise.all([
        step.run(`[${countryCode.toUpperCase()}] Update Districts Advocates Rankings`, async () => {
          const upsertDistrictAdvocatesRanking = await createDistrictRankingUpserter(countryCode)
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

        step.run(`[${countryCode.toUpperCase()}] Update Districts Referrals Ranking`, async () => {
          const upsertDistrictReferralsRanking = await createDistrictRankingUpserter(
            countryCode,
            'referrals',
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

      executionResults[countryCode] = {
        advocatesCountsByDistrictEntries: advocatesCountsByDistrictEntries.length,
        advocatesRankingResults: advocatesRankingResults.totalEntries,
        referralsCountByDistrictEntries: referralsCountByDistrictEntries.length,
        referralsRankingResults: referralsRankingResults.totalEntries,
      }
    }

    return executionResults
  },
)
