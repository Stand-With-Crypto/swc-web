import 'server-only'

import { getTotalAdvocatesPerState } from '@/data/aggregations/getTotalAdvocatesPerState'

export async function getAdvocatesMapData(topStatesLimit = 5) {
  const [totalAdvocatesPerState] = await Promise.all([getTotalAdvocatesPerState()])

  const topAdvocateStates =
    totalAdvocatesPerState.length > 0
      ? totalAdvocatesPerState
          .sort((a, b) => b.totalAdvocates - a.totalAdvocates)
          .slice(0, Math.max(0, Math.min(topStatesLimit, totalAdvocatesPerState.length)))
      : []

  return {
    advocatesMapData: {
      totalAdvocatesPerState,
      topAdvocateStates,
    },
  }
}

export type GetAdvocatesMapDataResponse = Awaited<ReturnType<typeof getAdvocatesMapData>>
