import 'server-only'

import { Prisma } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: bigint
}[]

const fetchAllFromPrisma = async (stateCode?: string) => {
  const stateCondition = stateCode
    ? Prisma.sql`address.administrative_area_level_1 = ${stateCode}`
    : Prisma.sql`address.administrative_area_level_1 != ''`

  return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.country_code = 'US'
    AND ${stateCondition}
    GROUP BY address.administrative_area_level_1;
  `
}

const parseTotalAdvocatesPerState = (totalAdvocatesPerState: TotalAdvocatesPerStateQuery) => {
  const multiplier =
    NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? 1
      : Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000

  return totalAdvocatesPerState
    .map(({ state, totalAdvocates }) => ({
      state,
      totalAdvocates: parseInt(totalAdvocates.toString(), 10) * multiplier,
    }))
    .filter(({ state }) => state.length <= 2)
}

export const getTotalAdvocatesPerState = async (stateCode?: string) => {
  const rawTotalAdvocatesPerState = await fetchAllFromPrisma(stateCode)
  const totalAdvocatesPerState = parseTotalAdvocatesPerState(rawTotalAdvocatesPerState)

  return totalAdvocatesPerState
}
