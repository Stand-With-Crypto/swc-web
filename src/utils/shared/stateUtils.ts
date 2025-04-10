import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { getGBCountryNameFromCode } from '@/utils/shared/stateMappings/gbCountryUtils'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
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
