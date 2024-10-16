import { getAllCongressData } from '@/data/aggregations/decisionDesk/getAllCongressData'
import { getAllRacesData } from '@/data/aggregations/decisionDesk/getAllRacesData'
import { getDtsiPresidentialWithVotingData } from '@/data/aggregations/decisionDesk/getDtsiPresidentialWithVotingData'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { setDecisionDataOnRedis } from '@/utils/server/decisionDesk/cachedData'
import { GetRacesParams } from '@/utils/server/decisionDesk/schemas'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

const FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME = 'script/fetch-presidential-races-data'
const FETCH_PRESIDENTIAL_RACES_INNGEST_FUNCTION_ID = 'script.fetch-presidential-races-data'

export interface FetchPresidentialRacesInngestEventSchema {
  name: typeof FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME
  data: GetRacesParams & {
    persist?: boolean
  }
}

const FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_ID = 'script.backfill-reactivation-cron-job'
const FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_SCHEDULE = 'TZ=America/New_York 0 12 * * *' // Every day - 12PM EST

const DECISION_RATE_LIMIT_REQUESTS_PER_MINUTE = 40

export const backfillReactivationCron = inngest.createFunction(
  { id: FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_ID },
  { cron: FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_SCHEDULE },
  async ({ step }) => {
    await step.sendEvent(`${FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME}-event-call`, {
      name: FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME,
      data: {
        year: '2024',
        persist: true,
      },
    })
  },
)

export const fetchPresidentialRacesData = inngest.createFunction(
  {
    id: FETCH_PRESIDENTIAL_RACES_INNGEST_FUNCTION_ID,
    retries: 2,
    onFailure: onScriptFailure,
  },
  { event: FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const {
      race_date = '2024-11-05',
      office_id = '1',
      limit = '50',
      name = 'General Election',
      year = '2024',
      persist,
      ...rest
    } = event.data

    logger.info('Fetching presidential race data from getDtsiPresidentialWithVotingData.')

    let requestsMade = 0

    const presidentialRacesData = await step.run('fetch-presidential-races-data', async () =>
      getDtsiPresidentialWithVotingData(year),
    )

    requestsMade += 1

    if (!presidentialRacesData) {
      logger.error('Presidential data not fetched.')
    }

    const allRacesData = await step.run('fetch-all-races-data', async () =>
      getAllRacesData({
        year,
        limit,
        name,
        office_id,
        race_date,
        ...rest,
      }),
    )

    requestsMade += 1

    if (!allRacesData) {
      logger.error('All races data not fetched.')
    }

    const senateData = await step.run('fetch-senate-data', async () =>
      getAllRacesData({
        year,
        limit,
        name,
        race_date,
        office_id: '4',
        ...rest,
      }),
    )

    requestsMade += 1

    if (!senateData) {
      logger.error('Senate data not fetched.')
    }

    const houseData = await step.run('fetch-house-data', async () =>
      getAllRacesData({
        year,
        limit,
        name,
        race_date,
        office_id: '3',
        ...rest,
      }),
    )

    requestsMade += 1

    if (!houseData) {
      logger.error('House data not fetched.')
    }

    const allCongressData = await step.run('fetch-all-congress-data', async () =>
      getAllCongressData({ senateData, houseData }),
    )

    const stateKeys = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)
    const persistedStates = []

    let startDate: Date
    let timeTakenInSeconds = 0

    for (const stateKey of stateKeys) {
      startDate = new Date()

      if (requestsMade >= DECISION_RATE_LIMIT_REQUESTS_PER_MINUTE && timeTakenInSeconds < 60) {
        logger.info('Rate limiting from Decision Desk API reached. Sleeping for 60s.')

        await step.sleep('await-for-decision-desk-rate-limiting', 60 * 1000)

        requestsMade = 0
        timeTakenInSeconds = 0
        startDate = new Date()
      }

      logger.info(
        `Fetching ${stateKey} races data from Decision Desk API. Current request count: ${requestsMade}.`,
      )

      const currentStateKey = stateKey as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP

      try {
        const stateRacesData = await step.run(
          `fetch-${currentStateKey}-and-persist-races-data`,
          async () => {
            return getAllRacesData({
              year,
              limit,
              name,
              race_date,
              state: currentStateKey,
              ...rest,
            })
          },
        )

        requestsMade += 1

        timeTakenInSeconds = (new Date().getTime() - startDate.getTime()) / 1000

        const stateRacesDataOnly = stateRacesData.filter(
          currentStateRacesData => currentStateRacesData.office?.officeName !== 'President',
        )

        if (stateRacesDataOnly.length === 0) {
          logger.info(`No valid state race data fetched for ${currentStateKey}.`)
        }

        if (!persist) {
          logger.info(`Dry run. State data not persisted on Redis for ${currentStateKey}.`)
          continue
        }

        logger.info(`Persisting SWC_${currentStateKey}_STATE_RACES_DATA on Redis.`)

        const persistedState = await setDecisionDataOnRedis(
          `SWC_${currentStateKey}_STATE_RACES_DATA`,
          JSON.stringify(stateRacesDataOnly.length > 0 ? stateRacesDataOnly : stateRacesData),
        )

        persistedStates.push({
          [currentStateKey]: persistedState,
        })
      } catch (error) {
        logger.error(
          `Failed to persist state data for ${currentStateKey}: ${(error as Error).message}`,
        )
      }
    }

    if (!persist) {
      return {
        message: 'Dry run. Races data not persisted on Redis.',
        presidentialRacesData,
        allRacesData,
        allCongressData,
      }
    }

    const persistedAllRacesData = await step.run('persist-all-races-data-on-redis', async () => {
      logger.info('Persisting all races data')

      return await setDecisionDataOnRedis('SWC_ALL_RACES_DATA', JSON.stringify(allRacesData))
    })

    const persistedAllCongressData = await step.run(
      'persist-all-congress-data-on-redis',
      async () => {
        logger.info('Persisting congress data')

        return await setDecisionDataOnRedis(
          'SWC_ALL_CONGRESS_DATA',
          JSON.stringify(allCongressData),
        )
      },
    )

    const persistedPresidentialRacesData = await step.run(
      'persist-presidential-races-data-on-redis',
      async () => {
        logger.info('Persisting presidential races data')

        return await setDecisionDataOnRedis(
          'SWC_PRESIDENTIAL_RACES_DATA',
          JSON.stringify(presidentialRacesData),
        )
      },
    )

    return {
      message: 'Presidential data persisted on Redis.',
      persistedPresidentialRacesData,
      persistedAllCongressData,
      persistedAllRacesData,
      persistedStates,
    }
  },
)
