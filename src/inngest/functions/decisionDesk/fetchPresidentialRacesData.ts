import fs from 'fs'
import path from 'path'

import { getAllCongressData } from '@/data/aggregations/decisionDesk/getAllCongressData'
import { getAllRacesData } from '@/data/aggregations/decisionDesk/getAllRacesData'
import { getDtsiPresidentialWithVotingData } from '@/data/aggregations/decisionDesk/getDtsiPresidentialWithVotingData'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { setDecisionDataOnRedis } from '@/utils/server/decisionDesk/cachedData'
import { GetRacesParams } from '@/utils/server/decisionDesk/schemas'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

const FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME = 'script/fetch-presidential-races-data'
const FETCH_PRESIDENTIAL_RACES_INNGEST_FUNCTION_ID = 'script.fetch-presidential-races-data'

export interface FetchPresidentialRacesInngestEventSchema {
  name: typeof FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME
  data: GetRacesParams & {
    persist?: boolean
  }
}

const FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_ID = 'script.fetch-presidential-races-cron-job'
const FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_SCHEDULE = 'TZ=America/New_York */15 * * * *' // Every 15 minutes

const DECISION_RATE_LIMIT_REQUESTS_PER_MINUTE = 40

export const fetchPresidentialRacesDataCron = inngest.createFunction(
  { id: FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_ID },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT !== 'local'
      ? { cron: FETCH_PRESIDENTIAL_RACES_INNGEST_CRON_JOB_SCHEDULE }
      : { event: FETCH_PRESIDENTIAL_RACES_INNGEST_EVENT_NAME }),
  },
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

const persistFile = NEXT_PUBLIC_ENVIRONMENT === 'local' && false
const rootDir = path.join(__dirname, 'raceWinners')

if (persistFile) {
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true })
  }
}

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
      office = 'President',
      limit = '150',
      name = 'General Election',
      year = '2024',
      persist,
      ...rest
    } = event.data

    logger.info('Fetching presidential race data from getDtsiPresidentialWithVotingData.')

    let requestsMade = 0

    const presidentialRacesData = await step.run(
      `fetch-presidential-races-data-requests-${requestsMade}`,
      async () => getDtsiPresidentialWithVotingData(year),
    )

    requestsMade += 1

    if (!presidentialRacesData) {
      logger.error('Presidential data not fetched.')
    }

    const allRacesData = await step.run(`fetch-all-races-data-requests-${requestsMade}`, async () =>
      getAllRacesData({
        year,
        limit,
        name,
        office,
        race_date,
        ...rest,
      }),
    )

    requestsMade += 1

    if (!allRacesData) {
      logger.error('All races data not fetched.')
    }

    const allSenateData = await step.run(
      `fetch-all-senate-data-requests-${requestsMade}`,
      async () =>
        getAllRacesData({
          year,
          limit,
          name,
          race_date,
          office: 'US Senate',
          ...rest,
        }),
    )

    requestsMade += 1

    if (!allSenateData) {
      logger.error('Senate data not fetched.')
    }

    const allHouseData = await step.run(`fetch-all-house-data-requests-${requestsMade}`, async () =>
      getAllRacesData({
        year,
        limit,
        name,
        race_date,
        office: 'US House',
        ...rest,
      }),
    )

    requestsMade += 1

    if (!allHouseData) {
      logger.error('House data not fetched.')
    }

    const laHouseData = await step.run(`fetch-la-house-data-requests-${requestsMade}`, async () =>
      getAllRacesData({
        year,
        limit,
        race_date,
        office: 'US House',
        state: 'LA',
        election_type: '1',
      }),
    )

    const laSenateData = await step.run(`fetch-la-senate-data-requests-${requestsMade}`, async () =>
      getAllRacesData({
        year,
        limit,
        race_date,
        office: 'US Senate',
        state: 'LA',
        election_type: '1',
      }),
    )

    const senateDataWithoutLA = allSenateData.filter(
      currentSenateData => currentSenateData.state !== 'LA',
    )
    const houseDataWithoutLA = allHouseData.filter(
      currentHouseData => currentHouseData.state !== 'LA',
    )

    const senateData = senateDataWithoutLA.concat(laSenateData)
    const houseData = houseDataWithoutLA.concat(laHouseData)

    const allCongressData = await step.run(
      `fetch-all-congress-data-requests-${requestsMade}`,
      async () => getAllCongressData({ senateData, houseData }),
    )

    if (!persist) {
      return {
        message: 'Dry run. Races data not persisted on Redis.',
        allRacesData,
        allCongressData,
        presidentialRacesData,
      }
    }

    const persistedAllRacesData = await step.run('persist-all-races-data-on-redis', async () => {
      logger.info('Persisting all races data')

      if (persistFile) {
        fs.writeFileSync(
          path.join(rootDir, 'SWC_ALL_RACES_DATA.json'),
          JSON.stringify(allRacesData, null, 2),
        )
      }

      if (!allRacesData || allRacesData?.length === 0) {
        logger.info('No valid all races data fetched.')
        return
      }

      return await setDecisionDataOnRedis('SWC_ALL_RACES_DATA', JSON.stringify(allRacesData), {
        ex: undefined,
      })
    })

    const persistedAllSenateData = await step.run('persist-all-senate-data-on-redis', async () => {
      logger.info('Persisting all senate data')

      if (persistFile) {
        fs.writeFileSync(
          path.join(rootDir, 'SWC_ALL_SENATE_DATA.json'),
          JSON.stringify(allCongressData.senateDataWithDtsi, null, 2),
        )
      }

      if (
        !allCongressData?.senateDataWithDtsi?.candidatesWithVotes ||
        allCongressData?.senateDataWithDtsi?.candidatesWithVotes?.length === 0
      ) {
        logger.info('No valid all senate data fetched.')
        return
      }

      return await setDecisionDataOnRedis(
        'SWC_ALL_SENATE_DATA',
        JSON.stringify(allCongressData.senateDataWithDtsi),
        { ex: undefined },
      )
    })

    const persistedAllHouseData = await step.run('persist-all-house-data-on-redis', async () => {
      logger.info('Persisting all house data')

      if (persistFile) {
        fs.writeFileSync(
          path.join(rootDir, 'SWC_ALL_HOUSE_DATA.json'),
          JSON.stringify(allCongressData.houseDataWithDtsi, null, 2),
        )
      }

      if (
        !allCongressData?.houseDataWithDtsi?.candidatesWithVotes ||
        allCongressData?.houseDataWithDtsi?.candidatesWithVotes?.length === 0
      ) {
        logger.info('No valid all house data fetched.')
        return
      }

      return await setDecisionDataOnRedis(
        'SWC_ALL_HOUSE_DATA',
        JSON.stringify(allCongressData.houseDataWithDtsi),
        { ex: undefined },
      )
    })

    const persistedPresidentialRacesData = await step.run(
      'persist-presidential-races-data-on-redis',
      async () => {
        logger.info('Persisting presidential races data')

        if (persistFile) {
          fs.writeFileSync(
            path.join(rootDir, 'SWC_PRESIDENTIAL_RACES_DATA.json'),
            JSON.stringify(presidentialRacesData, null, 2),
          )
        }

        if (!presidentialRacesData || presidentialRacesData?.length === 0) {
          logger.info('No valid presidential race data fetched.')
          return
        }

        return await setDecisionDataOnRedis(
          'SWC_PRESIDENTIAL_RACES_DATA',
          JSON.stringify(presidentialRacesData),
          { ex: undefined },
        )
      },
    )

    const stateKeys = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)
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

      const isLAState = stateKey === 'LA'
      const currentStateKey = stateKey as USStateCode

      // Louisiana is somewhat different in that their elections on November 5th are technically primaries even
      // though they are treated like the General Election. Recommendation here would be to adjust the query to use Election Type of 1
      const getAllRacesPerStateParams = isLAState
        ? {
            year,
            limit,
            race_date,
            state: currentStateKey,
            election_type: '1',
          }
        : {
            year,
            limit,
            name,
            race_date,
            state: currentStateKey,
          }

      try {
        const stateRacesData = await step.run(
          `fetch-${currentStateKey}-and-persist-races-data`,
          async () => {
            return getAllRacesData({
              ...getAllRacesPerStateParams,
            })
          },
        )

        requestsMade += 1

        timeTakenInSeconds = (new Date().getTime() - startDate.getTime()) / 1000

        const stateRacesDataOnly = stateRacesData.filter(
          currentStateRacesData =>
            currentStateRacesData?.office?.officeName === 'US House' ||
            currentStateRacesData?.office?.officeName === 'US Senate',
        )

        if (stateRacesDataOnly.length === 0) {
          logger.info(`No valid state race data fetched for ${currentStateKey}.`)
        }

        if (!persist) {
          logger.info(`Dry run. State data not persisted on Redis for ${currentStateKey}.`)
          continue
        }

        logger.info(`Persisting SWC_${currentStateKey}_STATE_RACES_DATA on Redis.`)

        if (persistFile) {
          fs.writeFileSync(
            path.join(rootDir, `SWC_${currentStateKey}_STATE_RACES_DATA.json`),
            JSON.stringify(
              stateRacesDataOnly.length > 0 ? stateRacesDataOnly : stateRacesData,
              null,
              2,
            ),
          )
        }

        if (
          (!stateRacesDataOnly || stateRacesDataOnly?.length === 0) &&
          (!stateRacesData || stateRacesData?.length === 0)
        ) {
          logger.info(`No valid race data fetched for ${currentStateKey}. Skipping persisting.`)
          continue
        }

        const persistedState = await setDecisionDataOnRedis(
          `SWC_${currentStateKey}_STATE_RACES_DATA`,
          JSON.stringify(stateRacesDataOnly.length > 0 ? stateRacesDataOnly : stateRacesData),
          { ex: undefined },
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

    return {
      message: 'Presidential data persisted on Redis.',
      persistedPresidentialRacesData,
      persistedAllSenateData,
      persistedAllHouseData,
      persistedAllRacesData,
      persistedStates,
    }
  },
)
