import 'server-only'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { getLogger } from '@/utils/shared/logger'

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
  logger.debug(`fetchDTSI called`)
  const response = await fetchReq('https://www.dotheysupportit.com/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: DO_THEY_SUPPORT_IT_API_KEY,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
  logger.debug(`fetchDTSI returned with status ${response.status}`)
  const json = (await response.json()) as { data: R } | { errors: any[] }
  if ('errors' in json) {
    throw new Error(`fetchDTSI threw with ${JSON.stringify(json.errors)}`)
  }
  return json.data
}
