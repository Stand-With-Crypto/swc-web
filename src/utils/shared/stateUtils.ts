import {
  getAUStateNameFromStateCode,
  isValidAUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import {
  getCAProvinceOrTerritoryNameFromCode,
  isValidCAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import {
  getGBCountryCodeFromName,
  getGBCountryNameFromCode,
  isValidGBCountryCode,
} from '@/utils/shared/stateMappings/gbCountryUtils'
import {
  getUSStateNameFromStateCode,
  isValidUSStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const GET_STATE_NAME_BY_COUNTRY_CODE_MAP: Record<SupportedCountryCodes, (code: string) => string> =
  {
    [SupportedCountryCodes.AU]: getAUStateNameFromStateCode,
    [SupportedCountryCodes.CA]: getCAProvinceOrTerritoryNameFromCode,
    [SupportedCountryCodes.GB]: getGBCountryNameFromCode,
    [SupportedCountryCodes.US]: getUSStateNameFromStateCode,
  }

export function getStateNameResolver(countryCode: SupportedCountryCodes) {
  return GET_STATE_NAME_BY_COUNTRY_CODE_MAP[countryCode]
}

const TERRITORY_DIVISION_BY_COUNTRY_CODE: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.AU]: 'State',
  [SupportedCountryCodes.CA]: 'Province',
  [SupportedCountryCodes.GB]: 'Country',
  [SupportedCountryCodes.US]: 'State',
}

export function getTerritoryDivisionByCountryCode(countryCode: SupportedCountryCodes) {
  return TERRITORY_DIVISION_BY_COUNTRY_CODE[countryCode]
}

const ELECTORAL_ZONE_DESCRIPTOR_BY_COUNTRY_CODE: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]: 'district',
  [SupportedCountryCodes.GB]: 'constituency',
  [SupportedCountryCodes.CA]: 'constituency',
  [SupportedCountryCodes.AU]: 'constituency',
}

export function getElectoralZoneDescriptorByCountryCode(countryCode: SupportedCountryCodes) {
  return ELECTORAL_ZONE_DESCRIPTOR_BY_COUNTRY_CODE[countryCode]
}

const IS_VALID_STATE_CODE_BY_COUNTRY_CODE: Record<
  SupportedCountryCodes,
  (code: string) => boolean
> = {
  [SupportedCountryCodes.US]: isValidUSStateCode,
  [SupportedCountryCodes.GB]: isValidGBCountryCode,
  [SupportedCountryCodes.CA]: isValidCAProvinceOrTerritoryCode,
  [SupportedCountryCodes.AU]: isValidAUStateCode,
}

export function isValidStateCodeByCountryCode(countryCode: SupportedCountryCodes, code: string) {
  // Google Places API returns the full country name for the UK, so we need to convert it to the country code
  if (countryCode === SupportedCountryCodes.GB) {
    const gbCountryCode = getGBCountryCodeFromName(code)

    if (gbCountryCode) {
      return IS_VALID_STATE_CODE_BY_COUNTRY_CODE[countryCode](gbCountryCode)
    }
  }

  return IS_VALID_STATE_CODE_BY_COUNTRY_CODE[countryCode](code.toUpperCase())
}
