import 'server-only'

import pRetry from 'p-retry'

import { API_ENDPOINT } from '@/data/decisionDesk/constants'
import { GetRacesParams } from '@/data/decisionDesk/schemas'
import {
  GetBearerTokenResponse,
  GetDelegatesResponse,
  GetElectoralCollegeResponse,
  GetRacesResponse,
} from '@/data/decisionDesk/types'
import { redis } from '@/utils/server/redis'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const DECISION_DESK_BEARER_TOKEN = 'decisionDeskBearerToken'
const DECISION_DESK_CLIENT_ID = requiredEnv(
  process.env.DECISION_DESK_CLIENT_ID,
  'DECISION_DESK_CLIENT_ID',
)
const DECISION_DESK_SECRET = requiredEnv(process.env.DECISION_DESK_SECRET, 'DECISION_DESK_SECRET')

const logger = getLogger('decisionDesk services')

async function fetchBearerToken() {
  logger.info('fetchBearerToken called')

  if (!DECISION_DESK_CLIENT_ID || !DECISION_DESK_SECRET) {
    throw new Error('DECISION_DESK_CLIENT_ID or DECISION_DESK_SECRET not set')
  }

  const response = await pRetry(
    attemptCount =>
      fetchReq(
        `${API_ENDPOINT}/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: DECISION_DESK_CLIENT_ID,
            client_secret: DECISION_DESK_SECRET,
          }),
        },
        {
          withScope: scope => {
            const name = `fetchBearerToken attempt #${attemptCount}`
            scope.setFingerprint([name])
            scope.setTags({ domain: 'fetchBearerToken' })
            scope.setTag('attemptCount', attemptCount)
            scope.setTransactionName(name)
          },
        },
      ),
    {
      retries: 1,
      minTimeout: 4000,
    },
  )

  logger.info(`fetchBearerToken returned with status ${response.status}`)

  const json = (await response.json()) as GetBearerTokenResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchBearerToken threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}

async function getBearerToken() {
  logger.info('getBearerToken called')

  const hasCachedBearerToken = await redis.get<GetBearerTokenResponse>(DECISION_DESK_BEARER_TOKEN)

  if (hasCachedBearerToken) {
    logger.info('getBearerToken found cached token')
    return hasCachedBearerToken.access_token
  }

  logger.info('getBearerToken did not find cached token')

  const bearerToken = await fetchBearerToken()

  await redis.set(DECISION_DESK_BEARER_TOKEN, bearerToken, {
    ex: bearerToken.expires_in,
  })

  logger.info('getBearerToken set new token in cache')

  return bearerToken.access_token
}

export async function fetchRacesData(params?: GetRacesParams) {
  logger.info('fetchRacesData called')

  const endpointURL = new URL(`${API_ENDPOINT}/races`)
  const paramsEntries = Object.entries(params ?? {})
  const currentURLSearchParams = new URLSearchParams({
    year: '2024',
  })

  if (paramsEntries.length > 0) {
    logger.info('fetchRacesData received params', params)

    paramsEntries.forEach(([key, value]) => {
      currentURLSearchParams.set(key, value.toString())
    })
  }

  endpointURL.search = currentURLSearchParams.toString()

  const bearerToken = await getBearerToken()

  if (!bearerToken) {
    throw new Error('Bearer key not found')
  }

  const response = await pRetry(
    attemptCount =>
      fetchReq(
        endpointURL.href,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
        {
          withScope: scope => {
            const name = `fetchRacesData attempt #${attemptCount}`
            scope.setFingerprint([name])
            scope.setTags({ domain: 'fetchRacesData' })
            scope.setTag('attemptCount', attemptCount)
            scope.setTransactionName(name)
          },
        },
      ),
    {
      retries: 1,
      minTimeout: 4000,
    },
  )

  logger.info(`fetchRacesData returned with status ${response.status}`)

  const json = (await response.json()) as GetRacesResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchRacesData threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}

export async function fetchDelegatesData(year = '2024') {
  logger.info('fetchDelegatesData called')

  const endpointURL = new URL(`${API_ENDPOINT}/delegates/${year}`)

  const bearerToken = await getBearerToken()

  if (!bearerToken) {
    throw new Error('Bearer key not found')
  }

  const response = await pRetry(
    attemptCount =>
      fetchReq(
        endpointURL.href,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
        {
          withScope: scope => {
            const name = `fetchDelegatesData attempt #${attemptCount}`
            scope.setFingerprint([name])
            scope.setTags({ domain: 'fetchDelegatesData' })
            scope.setTag('attemptCount', attemptCount)
            scope.setTransactionName(name)
          },
        },
      ),
    {
      retries: 1,
      minTimeout: 4000,
    },
  )

  logger.info(`fetchDelegatesData returned with status ${response.status}`)

  const json = (await response.json()) as GetDelegatesResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchDelegatesData threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}

export async function fetchElectoralCollege(year = '2024') {
  logger.info('fetchElectoralCollege called')

  const endpointURL = new URL(`${API_ENDPOINT}/electoral_college/${year}`)

  const bearerToken = await getBearerToken()

  if (!bearerToken) {
    throw new Error('Bearer key not found')
  }

  const response = await pRetry(
    attemptCount =>
      fetchReq(
        endpointURL.href,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
        {
          withScope: scope => {
            const name = `fetchElectoralCollege attempt #${attemptCount}`
            scope.setFingerprint([name])
            scope.setTags({ domain: 'fetchElectoralCollege' })
            scope.setTag('attemptCount', attemptCount)
            scope.setTransactionName(name)
          },
        },
      ),
    {
      retries: 1,
      minTimeout: 4000,
    },
  )

  logger.info(`fetchElectoralCollege returned with status ${response.status}`)

  const json = (await response.json()) as GetElectoralCollegeResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchElectoralCollege threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}
