import { normalizeAUDistrictName } from '@/bin/swcCivic/normalizers/normalizeAUDistricts'
import { normalizeCADistrictName } from '@/bin/swcCivic/normalizers/normalizeCADistricts'
import { normalizeGBAdministrativeArea } from '@/bin/swcCivic/normalizers/normalizeGBAdministrativeArea'
import {
  normalizeUSDistrictName,
  normalizeUSStateCode,
} from '@/bin/swcCivic/normalizers/normalizeUSDistrict'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const electoralZonesDataConfigs = [
  {
    countryCode: SupportedCountryCodes.GB,
    dataFilePath: 'data/uk_parliamentary_constituencies.geojson',
    administrativeAreaFieldPath: 'nuts118nm',
    normalizeAdministrativeArea: normalizeGBAdministrativeArea,
    administrativeAreaFilePath:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/NUTS_Level_1_January_2018_GCB_in_the_United_Kingdom_2022_-2753267915301604886_simplified.json',
    electoralZoneNameField: 'PCON24NM',
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.US,
    dataFilePath: 'data/us_congressional_districts.geojson',
    electoralZoneNameField: 'NAMELSAD',
    // TODO: replace this with administrativeAreaFieldPath
    stateCodeField: 'STATEFP',
    normalizeElectoralZoneName: normalizeUSDistrictName,
    // TODO: replace this with normalizeAdministrativeArea
    normalizeStateCode: normalizeUSStateCode,
    persist: false,
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
