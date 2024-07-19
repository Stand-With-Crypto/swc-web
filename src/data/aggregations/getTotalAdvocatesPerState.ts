import 'server-only'

import { Prisma } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: bigint
}[]

const fetchAllFromPrisma = async () => {
  const allStatesWithCountPromises: Prisma.PrismaPromise<TotalAdvocatesPerStateQuery>[] = []

  Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).forEach(usState => {
    allStatesWithCountPromises.push(
      prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
        SELECT
          address.administrative_area_level_1 AS state,
          COUNT(DISTINCT user.id) AS totalAdvocates
        FROM
          address
        JOIN user ON user.address_id = address.id
        JOIN user_action ON user_action.user_id = user.id
        WHERE
          address.country_code = 'US'
          AND address.administrative_area_level_1 = ${usState}
        GROUP BY
          address.administrative_area_level_1; 
      `,
    )
  })

  return Promise.all(allStatesWithCountPromises)
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
  const totalAdvocatesPerState = parseTotalAdvocatesPerState(rawTotalAdvocatesPerState.flat())

  return totalAdvocatesPerState
}

export type TotalAdvocatesPerState = Awaited<ReturnType<typeof getTotalAdvocatesPerState>>
export interface AdvocatePerState {
  state: string
  totalAdvocates: number
}
