import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { AU_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/auStateUtils'
import { CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/caProvinceUtils'
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
    default:
      return []
  }
}

const fetchAllFromPrismaByCountry = async (countryCode: SupportedCountryCodes) => {
  switch (countryCode) {
    case SupportedCountryCodes.GB:
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
    default:
      return prismaClient.$queryRaw<TotalAdvocatesPerStateQuery>`
        SELECT
          address.administrative_area_level_1 AS state,
          COUNT(user.id) AS totalAdvocates
        FROM address
        JOIN user ON user.address_id = address.id
        WHERE address.country_code = ${countryCode}
        GROUP BY address.administrative_area_level_1;
      `
  }
}

const parseTotalAdvocatesPerState = (
  countryCode: SupportedCountryCodes,
  totalAdvocatesPerState: TotalAdvocatesPerStateQuery,
) => {
  const states = getStatesForCountry(countryCode)

  const filteredTotalAdvocatesPerState =
    countryCode === SupportedCountryCodes.GB
      ? totalAdvocatesPerState
      : totalAdvocatesPerState.filter(({ state }) => states.includes(state))

  return filteredTotalAdvocatesPerState.map(({ state, totalAdvocates }) => ({
    state,
    totalAdvocates: parseInt(totalAdvocates.toString(), 10),
  }))
}

export const getTotalAdvocatesPerStateByCountry = async (countryCode: SupportedCountryCodes) => {
  const rawTotalAdvocatesPerState = await fetchAllFromPrismaByCountry(countryCode)
  const totalAdvocatesPerState = parseTotalAdvocatesPerState(countryCode, rawTotalAdvocatesPerState)

  return totalAdvocatesPerState
}
