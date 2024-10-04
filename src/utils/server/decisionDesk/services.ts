import 'server-only'

import pRetry from 'p-retry'

import {
  getDecisionDataFromRedis,
  setDecisionDataOnRedis,
} from '@/utils/server/decisionDesk/cachedData'
import { API_ENDPOINT } from '@/utils/server/decisionDesk/constants'
import { GetRacesParams } from '@/utils/server/decisionDesk/schemas'
import {
  GetBearerTokenResponse,
  GetDelegatesResponse,
  GetElectoralCollegeResponse,
  GetRacesResponse,
} from '@/utils/server/decisionDesk/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const DECISION_DESK_CLIENT_ID = requiredEnv(
  process.env.DECISION_DESK_CLIENT_ID,
  'DECISION_DESK_CLIENT_ID',
)
const DECISION_DESK_SECRET = requiredEnv(process.env.DECISION_DESK_SECRET, 'DECISION_DESK_SECRET')

const logger = getLogger('decisionDesk services')

async function fetchBearerToken() {
  logger.debug('fetchBearerToken called')

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

  logger.debug(`fetchBearerToken returned with status ${response.status}`)

  const json = (await response.json()) as GetBearerTokenResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchBearerToken threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}

async function getBearerToken() {
  logger.debug('getBearerToken called')

  const hasCachedBearerToken = await getDecisionDataFromRedis<GetBearerTokenResponse>(
    'DECISION_DESK_BEARER_TOKEN',
  )

  if (hasCachedBearerToken) {
    logger.debug('getBearerToken found cached token')
    return hasCachedBearerToken.access_token
  }

  logger.debug('getBearerToken did not find cached token')

  const bearerToken = await fetchBearerToken()

  await setDecisionDataOnRedis('DECISION_DESK_BEARER_TOKEN', JSON.stringify(bearerToken), {
    ex: bearerToken.expires_in,
  })

  logger.debug('getBearerToken set new token in cache')

  return bearerToken.access_token
}

/**
 * Don't call directly, fetch it from src/data/decisionDesk/cachedData.ts, unless
 * you know what you're doing as decisionDesk has rate limiting of 40 requests per minute
 */
export async function fetchRacesData(params?: GetRacesParams) {
  logger.debug('fetchRacesData called')

  const endpointURL = new URL(`${API_ENDPOINT}/races`)
  const paramsEntries = Object.entries(params ?? {})
  const currentURLSearchParams = new URLSearchParams({
    year: '2024',
  })

  if (paramsEntries.length > 0) {
    logger.debug('fetchRacesData received params', params)

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

  logger.debug(`fetchRacesData returned with status ${response.status}`)

  const json = (await response.json()) as GetRacesResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchRacesData threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}

/**
 * Don't call directly, fetch it from src/data/decisionDesk/cachedData.ts, unless
 * you know what you're doing as decisionDesk has rate limiting of 40 requests per minute
 */
export async function fetchDelegatesData(year = '2024') {
  logger.debug('fetchDelegatesData called')

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

  logger.debug(`fetchDelegatesData returned with status ${response.status}`)

  const json = (await response.json()) as GetDelegatesResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchDelegatesData threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}

/**
 * Don't call directly, fetch it from src/data/decisionDesk/cachedData.ts, unless
 * you know what you're doing as decisionDesk has rate limiting of 40 requests per minute
 */
export async function fetchElectoralCollege(year = '2024') {
  logger.debug('fetchElectoralCollege called')

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

  logger.debug(`fetchElectoralCollege returned with status ${response.status}`)

  const json = (await response.json()) as GetElectoralCollegeResponse | { errors: any[] }

  if ('errors' in json) {
    throw new Error(`fetchElectoralCollege threw with ${JSON.stringify(json.errors)}`)
  }

  return json
}
