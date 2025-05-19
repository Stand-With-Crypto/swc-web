import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

interface AdvocatesCountByStateQuery {
  advocatesCount: number
}

const fetchDataFromPrisma = async (stateCode: string) => {
  return prismaClient.$queryRaw<AdvocatesCountByStateQuery[]>`
    SELECT COUNT(user.id) AS advocatesCount
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.country_code = 'US'
    AND address.administrative_area_level_1 = ${stateCode}
    GROUP BY address.administrative_area_level_1;
  `
}

const parseAdvocatesCountByState = (advocatesCountByState: AdvocatesCountByStateQuery) => {
  const multiplier =
    NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? 1
      : Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000

  return {
    ...advocatesCountByState,
    advocatesCount: parseInt(advocatesCountByState.advocatesCount.toString(), 10) * multiplier,
  }
}

export const getAdvocatesCountByState = async (stateCode: string) => {
  const rawAdvocatesCountByState = await fetchDataFromPrisma(stateCode)
  const advocatesCountByState = parseAdvocatesCountByState(rawAdvocatesCountByState[0])

  return advocatesCountByState
}
