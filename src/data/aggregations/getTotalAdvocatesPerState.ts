import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: number
}[]

const fetchAllFromPrisma = async (): Promise<TotalAdvocatesPerStateQuery> => {
  const result = await prismaClient.user.findMany({
    where: {
      address: {
        countryCode: 'US',
        administrativeAreaLevel1: {
          not: undefined,
        },
      },
    },
    select: {
      address: {
        select: {
          administrativeAreaLevel1: true,
        },
      },
    },
    distinct: ['id'],
  })

  const stateCounts = result.reduce(
    (acc, user) => {
      const state = user.address?.administrativeAreaLevel1
      if (state) {
        acc[state] = (acc[state] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const multiplier =
    NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? 1
      : Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000

  const formattedResult = Object.entries(stateCounts)
    .map(([state, totalAdvocates]) => ({
      state,
      totalAdvocates: parseInt(totalAdvocates.toString(), 10) * multiplier,
    }))
    .sort((a, b) => a.state.localeCompare(b.state))

  return formattedResult
}

export const getTotalAdvocatesPerState = async () => {
  return await fetchAllFromPrisma()
}

export type TotalAdvocatesPerState = Awaited<ReturnType<typeof getTotalAdvocatesPerState>>
export interface AdvocatePerState {
  state: string
  totalAdvocates: number
}
