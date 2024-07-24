import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: bigint
}[]

const fetchAllFromPrisma = async () => {
  return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(DISTINCT user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.country_code = 'US'
    AND address.administrative_area_level_1 != ''
    GROUP BY address.administrative_area_level_1;
  `
}

const parseTotalAdvocatesPerState = (totalAdvocatesPerState: TotalAdvocatesPerStateQuery) => {
  const multiplier =
    NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? 1
      : Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000

  return totalAdvocatesPerState.map(({ state, totalAdvocates }) => ({
    state,
    totalAdvocates: parseInt(totalAdvocates.toString(), 10) * multiplier,
  }))
}

export const getTotalAdvocatesPerState = async () => {
  const rawTotalAdvocatesPerState = await fetchAllFromPrisma()
  const totalAdvocatesPerState = parseTotalAdvocatesPerState(rawTotalAdvocatesPerState)

  return totalAdvocatesPerState
}

export type TotalAdvocatesPerState = Awaited<ReturnType<typeof getTotalAdvocatesPerState>>
export interface AdvocatePerState {
  state: string
  totalAdvocates: number
}
