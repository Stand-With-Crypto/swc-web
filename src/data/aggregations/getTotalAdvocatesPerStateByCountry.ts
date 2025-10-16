import 'server-only'

import { Prisma } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { AU_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/auStateUtils'
import { CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/caProvinceUtils'
import { GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/gbCountryUtils'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type TotalAdvocatesPerStateQuery = {
  state: string
  totalAdvocates: bigint
}[]

function getStatesForCountry(countryCode: SupportedCountryCodes): string[] {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return Object.keys(US_STATE_CODE_TO_DISTRICT_COUNT_MAP)
    case SupportedCountryCodes.CA:
      return Object.keys(CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP)
    case SupportedCountryCodes.AU:
      return Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)
    case SupportedCountryCodes.GB:
      return Object.keys(GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP)
    default:
      return []
  }
}

const fetchAllFromPrismaByCountry = async (countryCode: SupportedCountryCodes) => {
  const states = getStatesForCountry(countryCode)

  if (states.length === 0) {
    return []
  }

  // GB uses a different field for administrative area
  if (countryCode === SupportedCountryCodes.GB) {
    return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
      SELECT
        address.swc_civic_administrative_area AS state,
        COUNT(user.id) AS totalAdvocates
      FROM address
      JOIN user ON user.address_id = address.id
      WHERE address.country_code = ${countryCode}
      AND address.swc_civic_administrative_area IN (${Prisma.join(states)})
      GROUP BY address.swc_civic_administrative_area;
    `
  }

  return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.country_code = ${countryCode}
    AND address.administrative_area_level_1 IN (${Prisma.join(states)})
    GROUP BY address.administrative_area_level_1;
  `
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
