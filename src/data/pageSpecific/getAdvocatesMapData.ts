import 'server-only'

import { getTotalAdvocatesPerState } from '@/data/aggregations/getTotalAdvocatesPerState'

export async function getAdvocatesMapData() {
  const [totalAdvocatesPerState] = await Promise.all([getTotalAdvocatesPerState()])

  return {
    advocatesMapData: {
      totalAdvocatesPerState,
    },
  }
}

export type GetAdvocatesMapDataResponse = Awaited<ReturnType<typeof getAdvocatesMapData>>
