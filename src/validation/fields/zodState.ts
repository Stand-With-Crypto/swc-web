import { enum as zodEnum } from 'zod'

import {
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  GBCountryCode,
} from '@/utils/shared/gbCountryUtils'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
} from '@/utils/shared/caProvinceUtils'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AU_STATE_CODE_TO_DISPLAY_NAME_MAP, AUStateCode } from '@/utils/shared/auStateUtils'

const [firstUsState, ...otherUsStates] = Object.keys(
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
) as USStateCode[]
const [firstGbState, ...otherGbStates] = Object.keys(
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
) as GBCountryCode[]
const [firstCaState, ...otherCaStates] = Object.keys(
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
) as CAProvinceOrTerritoryCode[]
const [firstAuState, ...otherAuStates] = Object.keys(
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
) as AUStateCode[]

const COUNTRY_CODE_TO_ZOD_STATE_MAP = {
  [SupportedCountryCodes.US]: zodEnum([firstUsState, ...otherUsStates], {
    required_error: 'Please enter a valid US state',
  }),
  [SupportedCountryCodes.GB]: zodEnum([firstGbState, ...otherGbStates], {
    required_error: 'Please enter a valid GB country',
  }),
  [SupportedCountryCodes.CA]: zodEnum([firstCaState, ...otherCaStates], {
    required_error: 'Please enter a valid CA state',
  }),
  [SupportedCountryCodes.AU]: zodEnum([firstAuState, ...otherAuStates], {
    required_error: 'Please enter a valid AU state',
  }),
}

export const zodState = {
  parse: (stateCode: string, countryCode?: string) => {
    const upperCountryCode =
      countryCode?.toUpperCase() as keyof typeof COUNTRY_CODE_TO_ZOD_STATE_MAP

    return (
      COUNTRY_CODE_TO_ZOD_STATE_MAP[upperCountryCode] ||
      COUNTRY_CODE_TO_ZOD_STATE_MAP[SupportedCountryCodes.US]
    ).parse(stateCode)
  },
}
