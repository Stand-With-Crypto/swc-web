import 'server-only'

import pRetry from 'p-retry'

import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

const logger = getLogger('fetchDTSI')
/*
 View the DoTheySupportIt API explorer at https://www.dotheysupportit.com/api/graphql
 make sure to enter your API key in the headers tab at the bottom
*/

const DO_THEY_SUPPORT_IT_API_KEY = requiredEnv(
  process.env.DO_THEY_SUPPORT_IT_API_KEY,
  'DO_THEY_SUPPORT_IT_API_KEY',
)

export const fetchDTSI = async <R, V = object>(query: string, variables?: V) => {
  // we set USE_DTSI_PRODUCTION_API in code in some of out bin files.
  // To ensure that logic gets picked up, we check the process.env dynamically within the function itself
  const USE_DTSI_PRODUCTION_API =
    toBool(process.env.USE_DTSI_PRODUCTION_API) || NEXT_PUBLIC_ENVIRONMENT === 'production'
  const API_ENDPOINT = USE_DTSI_PRODUCTION_API
    ? 'https://www.dotheysupportit.com/api/graphql'
    : 'https://testing.dotheysupportit.com/api/graphql'
  if (USE_DTSI_PRODUCTION_API && NEXT_PUBLIC_ENVIRONMENT !== 'production') {
    logger.info(`OVERRIDE: production DTSI API`)
  }
  logger.debug(`fetchDTSI called`)
  const response = await pRetry(
    attemptCount =>
      fetchReq(
        API_ENDPOINT,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: DO_THEY_SUPPORT_IT_API_KEY,
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        },
        {
          withScope: scope => {
            const name = `fetchDTSI attempt #${attemptCount}`
            scope.setFingerprint([name])
            scope.setTags({ domain: 'fetchDTSI' })
            scope.setTag('attemptCount', attemptCount)
            scope.setTransactionName(name)
          },
        },
      ),
    { retries: 2, minTimeout: 4000 },
  )
  logger.debug(`fetchDTSI returned with status ${response.status}`)
  const json = (await response.json()) as { data: R } | { errors: any[] }
  if ('errors' in json) {
    throw new Error(`fetchDTSI threw with ${JSON.stringify(json.errors)}`)
  }
  return json.data
}
