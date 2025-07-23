import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: bigint
}[]

const fetchAllFromPrismaByCountry = async (countryCode: SupportedCountryCodes) => {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.administrative_area_level_1 != ''
    AND address.country_code = ${countryCode}
    GROUP BY address.administrative_area_level_1;
  `
    default:
      return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
    SELECT
      address.swc_civic_administrative_area AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.swc_civic_administrative_area != ''
    AND address.country_code = ${countryCode}
    GROUP BY address.swc_civic_administrative_area;
  `
  }
}

const parseTotalAdvocatesPerState = (totalAdvocatesPerState: TotalAdvocatesPerStateQuery) => {
  return totalAdvocatesPerState.map(({ state, totalAdvocates }) => ({
    state,
    totalAdvocates: parseInt(totalAdvocates.toString(), 10),
  }))
}

export const getTotalAdvocatesPerStateByCountry = async (countryCode: SupportedCountryCodes) => {
  const rawTotalAdvocatesPerState = await fetchAllFromPrismaByCountry(countryCode)
  const totalAdvocatesPerState = parseTotalAdvocatesPerState(rawTotalAdvocatesPerState)

  return totalAdvocatesPerState
}
