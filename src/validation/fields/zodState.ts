import { enum as zodEnum } from 'zod'

import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import {
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  GBCountryCode,
} from '@/utils/shared/stateMappings/gbCountryUtils'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const COUNTRY_CODE_TO_ZOD_STATE_MAP: Record<
  SupportedCountryCodes,
  {
    stateMap: Record<string, string>
    zodOptions: {
      required_error: string
    }
  }
> = {
  [SupportedCountryCodes.US]: {
    stateMap: US_STATE_CODE_TO_DISPLAY_NAME_MAP,
    zodOptions: {
      required_error: 'Please enter a valid US state',
    },
  },
  [SupportedCountryCodes.GB]: {
    stateMap: GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
    zodOptions: {
      required_error: 'Please enter a valid GB country',
    },
  },
  [SupportedCountryCodes.CA]: {
    stateMap: CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
    zodOptions: {
      required_error: 'Please enter a valid CA state',
    },
  },
  [SupportedCountryCodes.AU]: {
    stateMap: AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
    zodOptions: {
      required_error: 'Please enter a valid AU state',
    },
  },
}

type ZodStateReturn<T extends SupportedCountryCodes> = T extends SupportedCountryCodes.US
  ? USStateCode
  : T extends SupportedCountryCodes.GB
    ? GBCountryCode
    : T extends SupportedCountryCodes.CA
      ? CAProvinceOrTerritoryCode
      : AUStateCode

export const zodState = {
  parse: <T extends SupportedCountryCodes>(
    stateCode: string,
    countryCode: T,
  ): ZodStateReturn<T> => {
    const upperCountryCode =
      countryCode?.toLowerCase() as keyof typeof COUNTRY_CODE_TO_ZOD_STATE_MAP
    const countryCodeMap =
      COUNTRY_CODE_TO_ZOD_STATE_MAP[upperCountryCode] ||
      COUNTRY_CODE_TO_ZOD_STATE_MAP[SupportedCountryCodes.US]

    const [firstState, ...otherStates] = Object.keys(countryCodeMap.stateMap)

    return zodEnum([firstState, ...otherStates], countryCodeMap.zodOptions).parse(
      stateCode,
    ) as ZodStateReturn<T>
  },
}
