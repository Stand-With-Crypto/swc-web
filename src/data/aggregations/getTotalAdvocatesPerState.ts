import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: bigint
}[]

const fetchAllFromPrisma = async (countryCode: SupportedCountryCodes) => {
  return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE LOWER(address.country_code) = LOWER(${countryCode})
    AND address.administrative_area_level_1 != ''
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

export const getTotalAdvocatesPerState = async (countryCode: SupportedCountryCodes) => {
  const rawTotalAdvocatesPerState = await fetchAllFromPrisma(countryCode)
  const totalAdvocatesPerState = parseTotalAdvocatesPerState(rawTotalAdvocatesPerState)

  return totalAdvocatesPerState
}
