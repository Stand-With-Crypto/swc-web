import 'server-only'

import { getAdvocatesCountByState } from '@/data/aggregations/getAdvocatesCountByState'

export async function getAdvocatesCountByStateData(stateCode: string) {
  const [advocatesCountByState] = await Promise.all([getAdvocatesCountByState(stateCode)])

  return {
    advocatesCountByStateData: {
      advocatesCountByState,
    },
  }
}

export type GetAdvocatesCountByStateDataResponse = Awaited<
  ReturnType<typeof getAdvocatesCountByStateData>
>
