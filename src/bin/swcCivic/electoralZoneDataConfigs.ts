import { normalizeAUDistrictName } from '@/bin/swcCivic/normalizers/normalizeAUDistricts'
import { normalizeCADistrictName } from '@/bin/swcCivic/normalizers/normalizeCADistricts'
import {
  normalizeUSDistrictName,
  normalizeUSStateCode,
} from '@/bin/swcCivic/normalizers/normalizeUSDistrict'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const electoralZonesDataConfigs = [
  {
    countryCode: SupportedCountryCodes.GB,
    dataFilePath: 'data/uk_parliamentary_constituencies.geojson',
    electoralZoneNameField: 'PCON24NM',
    persist: false,
  },
  {
    countryCode: SupportedCountryCodes.US,
    dataFilePath: 'data/us_congressional_districts.geojson',
    electoralZoneNameField: 'NAMELSAD',
    stateCodeField: 'STATEFP',
    normalizeElectoralZoneName: normalizeUSDistrictName,
    normalizeStateCode: normalizeUSStateCode,
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.CA,
    dataFilePath: 'data/FED_CA_2023_EN.kmz',
    electoralZoneNameField: 'Name',
    normalizeElectoralZoneName: normalizeCADistrictName,
    persist: false,
  },
  {
    countryCode: SupportedCountryCodes.AU,
    dataFilePath: 'data/au/AUS_ELB_region.shp',
    electoralZoneNameField: 'Elect_div',
    normalizeElectoralZoneName: normalizeAUDistrictName,
    persist: false,
  },
]
