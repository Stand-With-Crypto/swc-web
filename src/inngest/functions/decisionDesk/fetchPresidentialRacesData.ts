import { getAllRacesData } from '@/data/aggregations/decisionDesk/getAllRacesData'
import { getDtsiPresidentialWithVotingData } from '@/data/aggregations/decisionDesk/getDtsiPresidentialWithVotingData'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { setDecisionDataOnRedis } from '@/utils/server/decisionDesk/cachedData'
import { GetRacesParams } from '@/utils/server/decisionDesk/schemas'

const FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME = 'script/fetch-presidential-races-data'
const FETCH_PRESIDENTIAL_RACES_INNGEST_FUNCTION_ID = 'script.fetch-presidential-races-data'

export interface FetchPresidentialRacesInngestEventSchema {
  name: typeof FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME
  data: GetRacesParams & {
    persist?: boolean
  }
}

const FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_ID = 'script.backfill-reactivation-cron-job'
const FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_SCHEDULE = 'TZ=America/New_York 0 12 * * *'

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
      office = 'President',
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
        office,
        race_date,
        ...rest,
      }),
    )

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

    const persistedPresidentialRacesData = await step.run(
      'persist-presidential-races-data-on-redis',
      async () =>
        setDecisionDataOnRedis('PRESIDENTIAL_RACES_DATA', JSON.stringify(presidentialRacesData)),
    )

    const persistedAllRacesData = await step.run('persist-all-races-data-on-redis', async () =>
      setDecisionDataOnRedis('ALL_RACES_DATA', JSON.stringify(allRacesData)),
    )

    if (persistedPresidentialRacesData !== 'OK' || persistedAllRacesData !== 'OK') {
      logger.error('Data not persisted on Redis')

      return {
        message: 'Data not persisted on Redis.',
        persistedPresidentialRacesData,
        persistedAllRacesData,
      }
    }

    return {
      message: 'Presidential data persisted on Redis.',
      persistedPresidentialRacesData,
      persistedAllRacesData,
    }
  },
)
