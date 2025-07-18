import 'server-only'

import pRetry from 'p-retry'

import { getTotalAdvocatesByState } from '@/data/aggregations/getTotalAdvocatesPerState'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'

export async function getAdvocatesMapData() {
  const stateCodes = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP) as USStateCode[]
  const advocatesPerStatePromises = stateCodes.map(stateCode =>
    pRetry(async () => await getTotalAdvocatesByState(stateCode)),
  )

  const results = await Promise.all(advocatesPerStatePromises)
  const totalAdvocatesPerState = results.flat()

  return {
    advocatesMapData: {
      totalAdvocatesPerState,
    },
  }
}
export type GetAdvocatesMapDataResponse = Awaited<ReturnType<typeof getAdvocatesMapData>>
