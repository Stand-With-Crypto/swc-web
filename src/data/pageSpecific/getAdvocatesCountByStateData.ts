import 'server-only'

import { getAdvocatesCountByState } from '@/data/aggregations/getAdvocatesCountByState'

export async function getAdvocatesCountByStateData(stateCode: string) {
  const advocatesCountByState = await getAdvocatesCountByState(stateCode)

  return {
    advocatesCountByState: advocatesCountByState.advocatesCount,
  }
}

export type GetAdvocatesCountByStateDataResponse = Awaited<
  ReturnType<typeof getAdvocatesCountByStateData>
>
