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
    retries: 0,
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

    const presidentialRacesData = await step.run('fetch-presidential-races-data', async () =>
      getDtsiPresidentialWithVotingData(year),
    )

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

    const stateKeys = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)

    let requestIteration = 0
    let timeTakenInSeconds = 0
    let startDate = new Date()
    const persistedStates = []

    for (const stateKey of stateKeys) {
      // cant call more than 40 requests per minute
      if (requestIteration >= DECISION_RATE_LIMIT_REQUESTS_PER_MINUTE && timeTakenInSeconds < 60) {
        logger.info('Rate limiting from Decision Desk API reached. Sleeping for 60s.')

        await step.sleep('await-for-decision-desk-rate-limiting', 60 * 1000)

        requestIteration = 0
        timeTakenInSeconds = 0
        startDate = new Date()
      }

      logger.info(
        `Fetching ${stateKey} races data from Decision Desk API. Current iteration ${requestIteration}.`,
      )

      const currentStateKey = stateKey as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP

      const stateRacesData = await step.run(`fetch-${currentStateKey}-races-data`, async () => {
        return getAllRacesData({
          year,
          limit,
          name,
          race_date,
          state: currentStateKey,
          ...rest,
        })
      })

      const stateRacesDataOnly = stateRacesData.filter(
        currentStateRacesData => currentStateRacesData.office?.officeName !== 'President',
      )

      requestIteration += 1
      timeTakenInSeconds = (new Date().getTime() - startDate.getTime()) / 1000

      if (!stateRacesDataOnly) {
        logger.error(`State data not fetched for ${currentStateKey}.`)
      }

      if (!persist) {
        logger.info(`Dry run. State data not persisted on Redis for ${currentStateKey}.`)

        continue
      }

      logger.info(`Persisting ${currentStateKey}_STATE_RACES_DATA on Redis.`)

      const persistedState = await setDecisionDataOnRedis(
        `${currentStateKey}_STATE_RACES_DATA`,
        JSON.stringify(stateRacesDataOnly),
      )

      persistedStates.push({
        [currentStateKey]: persistedState,
      })
    }

    if (!presidentialRacesData) {
      logger.error('Presidential data not fetched.')
    }

    if (!allRacesData) {
      logger.error('All races data not fetched.')
    }

    if (!persist) {
      return {
        message: 'Dry run. Races data not persisted on Redis.',
        presidentialRacesData,
        allRacesData,
      }
    }

    const persistedAllRacesData = await step.run('persist-all-races-data-on-redis', async () => {
      logger.info('Persisting all races data')

      await setDecisionDataOnRedis('ALL_RACES_DATA', JSON.stringify(allRacesData))
    })

    const persistedPresidentialRacesData = await step.run(
      'persist-presidential-races-data-on-redis',
      async () => {
        logger.info('Persisting presidential races data')

        await setDecisionDataOnRedis(
          'PRESIDENTIAL_RACES_DATA',
          JSON.stringify(presidentialRacesData),
        )
      },
    )

    return {
      message: 'Presidential data persisted on Redis.',
      persistedPresidentialRacesData,
      persistedAllRacesData,
      persistedStates,
    }
  },
)
