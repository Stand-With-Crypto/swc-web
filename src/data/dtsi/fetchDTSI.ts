import { toBool } from '@/utils/shared/toBool'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import pRetry from 'p-retry'
import 'server-only'

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
  // we set USE_DTSI_PRODUCTION_API_ON_LOCAL in code in some of out bin files.
  // To ensure that logic gets picked up, we check the process.env dynamically within the function itself
  const USE_DTSI_PRODUCTION_API_ON_LOCAL = toBool(process.env.USE_DTSI_PRODUCTION_API_ON_LOCAL)
  const API_ENDPOINT =
    USE_DTSI_PRODUCTION_API_ON_LOCAL || NEXT_PUBLIC_ENVIRONMENT !== 'local'
      ? 'https://www.dotheysupportit.com/api/graphql'
      : 'https://testing.dotheysupportit.com/api/graphql'
  if (USE_DTSI_PRODUCTION_API_ON_LOCAL) {
    logger.info(`using production DTSI API on local`)
  }
  logger.debug(`fetchDTSI called`)
  const response = await pRetry(
    attemptCount =>
      fetchReq(
        API_ENDPOINT,
        {
          body: JSON.stringify({
            query,
            variables,
          }),
          headers: {
            Authorization: DO_THEY_SUPPORT_IT_API_KEY,
            'Content-Type': 'application/json',
          },
          method: 'POST',
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
    { minTimeout: 4000, retries: 2 },
  )
  logger.debug(`fetchDTSI returned with status ${response.status}`)
  const json = (await response.json()) as { data: R } | { errors: any[] }
  if ('errors' in json) {
    throw new Error(`fetchDTSI threw with ${JSON.stringify(json.errors)}`)
  }
  return json.data
}
