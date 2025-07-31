import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: bigint
}[]

const fetchAllFromPrismaByState = async (stateCode: USStateCode) => {
  return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.administrative_area_level_1 = ${stateCode}
    AND address.country_code = ${DEFAULT_SUPPORTED_COUNTRY_CODE}
    GROUP BY address.administrative_area_level_1;
  `
}

const parseTotalAdvocatesPerState = (totalAdvocatesPerState: TotalAdvocatesPerStateQuery) => {
  return totalAdvocatesPerState.map(({ state, totalAdvocates }) => ({
    state,
    totalAdvocates: parseInt(totalAdvocates.toString(), 10),
  }))
}

export const getTotalAdvocatesByState = async (stateCode: USStateCode) => {
  const rawTotalAdvocatesPerState = await fetchAllFromPrismaByState(stateCode)
  const totalAdvocatesPerState = parseTotalAdvocatesPerState(rawTotalAdvocatesPerState)

  return totalAdvocatesPerState
}
