import 'server-only'

import { getTotalAdvocatesPerState } from '@/data/aggregations/getTotalAdvocatesPerState'

export async function getAdvocatesMapData(stateCode?: string) {
  const [totalAdvocatesPerState] = await Promise.all([getTotalAdvocatesPerState(stateCode)])

  return {
    advocatesMapData: {
      totalAdvocatesPerState,
    },
  }
}

export type GetAdvocatesMapDataResponse = Awaited<ReturnType<typeof getAdvocatesMapData>>
