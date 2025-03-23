import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import { AU_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './au/auCtas'
import { CA_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './ca/caCtas'
import { GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './gb/gbCtas'
import { US_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './us/usCtas'

const COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY: Record<SupportedCountryCodes, UserActionGridCTA> =
  {
    [SupportedCountryCodes.US]: US_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
    [SupportedCountryCodes.GB]: GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
    [SupportedCountryCodes.CA]: CA_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
    [SupportedCountryCodes.AU]: AU_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
  }

export function getUserActionCTAsByCountry(countryCode: SupportedCountryCodes) {
  if (countryCode in COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY) {
    return COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY[countryCode]
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

// For backward compatibility
export const USER_ACTION_CTAS_FOR_GRID_DISPLAY =
  COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY[DEFAULT_SUPPORTED_COUNTRY_CODE]
