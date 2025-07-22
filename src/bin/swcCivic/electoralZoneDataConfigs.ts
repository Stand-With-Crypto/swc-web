import { normalizeAUDistrictName } from '@/bin/swcCivic/normalizers/normalizeAUDistricts'
import { normalizeCADistrictName } from '@/bin/swcCivic/normalizers/normalizeCADistricts'
import { normalizeGBAdministrativeArea } from '@/bin/swcCivic/normalizers/normalizeGBAdministrativeArea'
import {
  normalizeUSAdministrativeArea,
  normalizeUSDistrictName,
} from '@/bin/swcCivic/normalizers/normalizeUSDistrict'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface ElectoralZoneDataConfig {
  countryCode: SupportedCountryCodes
  dataFilePath: string
  administrativeAreaFieldPath?: string
  normalizeAdministrativeArea?: (administrativeArea?: string) => string | undefined
  normalizeElectoralZoneName?: (electoralZoneName?: string) => string | undefined
  // If no administrativeAreaFilePath is provided, we will use the administrativeAreaFieldPath to get the administrative area from the data file
  administrativeAreaFilePath?: string
  electoralZoneNameField: string
}

// To specify which countries to update, use the COUNTRIES_TO_UPDATE environment variable.
// COUNTRIES_TO_UPDATE=us,ca,gb,au npm run db:seed-swc-civic
export const electoralZonesDataConfigs: ElectoralZoneDataConfig[] = [
  {
    countryCode: SupportedCountryCodes.GB,
    dataFilePath:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/swc-civic/uk_parliamentary_constituencies.geojson',
    administrativeAreaFieldPath: 'nuts118nm',
    normalizeAdministrativeArea: normalizeGBAdministrativeArea,
    administrativeAreaFilePath:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/NUTS_Level_1_January_2018_GCB_in_the_United_Kingdom_2022_-2753267915301604886_simplified.json',
    electoralZoneNameField: 'PCON24NM',
  },
  {
    countryCode: SupportedCountryCodes.US,
    dataFilePath:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/swc-civic/us_congressional_districts.geojson',
    electoralZoneNameField: 'NAMELSAD',
    administrativeAreaFieldPath: 'STATEFP',
    normalizeElectoralZoneName: normalizeUSDistrictName,
    normalizeAdministrativeArea: normalizeUSAdministrativeArea,
  },
  {
    countryCode: SupportedCountryCodes.CA,
    dataFilePath:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/swc-civic/FED_CA_2023_EN.kmz',
    electoralZoneNameField: 'Name',
    normalizeElectoralZoneName: normalizeCADistrictName,
  },
  {
    countryCode: SupportedCountryCodes.AU,
    dataFilePath:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/swc-civic/au/AUS_ELB_region.shp',
    electoralZoneNameField: 'Elect_div',
    normalizeElectoralZoneName: normalizeAUDistrictName,
  },
] as const
