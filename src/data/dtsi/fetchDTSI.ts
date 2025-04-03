import 'server-only'

import pRetry from 'p-retry'

import { IS_DEVELOPING_OFFLINE } from '@/utils/shared/executionEnvironment'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'

const logger = getLogger('fetchDTSI')
/*
 View the DoTheySupportIt API explorer at https://www.dotheysupportit.com/api/graphql
 make sure to enter your API key in the headers tab at the bottom
*/

const DO_THEY_SUPPORT_IT_API_KEY = process.env.DO_THEY_SUPPORT_IT_API_KEY!
const IS_MOCKING_DTSI_DATA =
  IS_DEVELOPING_OFFLINE || (!DO_THEY_SUPPORT_IT_API_KEY && NEXT_PUBLIC_ENVIRONMENT === 'local')

export const fetchDTSI = async <R, V = object>(
  query: string,
  variables?: V,
  nextConfig?: { nextTags?: string[]; nextRevalidate?: number },
) => {
  if (toBool(IS_MOCKING_DTSI_DATA)) {
    // because this file will import faker, we want to avoid loading it in our serverless environments
    return import('@/mocks/dtsi/queryDTSIMockSchema').then(x =>
      x.queryDTSIMockSchema<R>(query, variables),
    )
  }
  if (!DO_THEY_SUPPORT_IT_API_KEY) {
    throw new Error('DO_THEY_SUPPORT_IT_API_KEY is not set')
  }
  // we set USE_DTSI_PRODUCTION_API in code in some of out bin files.
  // To ensure that logic gets picked up, we check the process.env dynamically within the function itself
  const USE_DTSI_PRODUCTION_API =
    toBool(process.env.USE_DTSI_PRODUCTION_API) || NEXT_PUBLIC_ENVIRONMENT === 'production'
  const API_ENDPOINT = USE_DTSI_PRODUCTION_API
    ? 'https://www.dotheysupportit.com/api/graphql'
    : 'https://testing.dotheysupportit.com/api/graphql'
  if (USE_DTSI_PRODUCTION_API && NEXT_PUBLIC_ENVIRONMENT !== 'production') {
    logger.debug(`OVERRIDE: production DTSI API`)
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
          next: {
            ...(nextConfig?.nextTags && { tags: nextConfig?.nextTags }),
            ...(nextConfig?.nextRevalidate && { revalidate: nextConfig?.nextRevalidate }),
          },
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
