import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import { AU_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './au/auCtas'
import { CA_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './ca/caCtas'
import { getEuUserActionCtasForGridDisplay } from './eu/euCtas'
import { GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './gb/gbCtas'
import { US_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './us/usCtas'

const COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY: Record<
  SupportedCountryCodes,
  (language?: SupportedLanguages) => UserActionGridCTA
> = {
  [SupportedCountryCodes.US]: () => US_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
  [SupportedCountryCodes.GB]: () => GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
  [SupportedCountryCodes.CA]: () => CA_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
  [SupportedCountryCodes.AU]: () => AU_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
  [SupportedCountryCodes.EU]: getEuUserActionCtasForGridDisplay,
}

export function getUserActionCTAsByCountry(
  countryCode: SupportedCountryCodes,
  language?: SupportedLanguages,
) {
  if (countryCode in COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY) {
    return COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY[countryCode](language)
  }

  return gracefullyError({
    msg: `Country config not found for country code: ${countryCode}`,
    fallback: COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY[DEFAULT_SUPPORTED_COUNTRY_CODE],
    hint: {
      level: 'error',
      tags: {
        domain: 'getUserActionCTAsByCountry',
      },
      extra: {
        countryCode,
      },
    },
  })
}
