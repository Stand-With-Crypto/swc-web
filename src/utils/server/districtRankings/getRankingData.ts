import {
  getAUAdvocatesCountByDistrict,
  getAUReferralsCountByDistrict,
} from '@/utils/server/districtRankings/au/getRankingData'
import {
  getCAAdvocatesCountByDistrict,
  getCAReferralsCountByDistrict,
} from '@/utils/server/districtRankings/ca/getRankingData'
import {
  getEUAdvocatesCountByDistrict,
  getEUReferralsCountByDistrict,
} from '@/utils/server/districtRankings/eu/getRankingData'
import {
  getGBAdvocatesCountByConstituency,
  getGBReferralsCountByConstituency,
} from '@/utils/server/districtRankings/gb/getRankingData'
import {
  getUSAdvocatesCountByDistrict,
  getUSReferralsCountByDistrict,
} from '@/utils/server/districtRankings/us/getRankingData'
import { AUStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { CAProvinceOrTerritoryCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { GBRegion } from '@/utils/shared/stateMappings/gbCountryUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface AdvocatesCountResult {
  // string because GB regions are string on the database
  state: USStateCode | CAProvinceOrTerritoryCode | AUStateCode | GBRegion
  district: string
  count: number
}

interface StateCode {
  [SupportedCountryCodes.US]: USStateCode
  [SupportedCountryCodes.GB]: GBRegion
  [SupportedCountryCodes.CA]: CAProvinceOrTerritoryCode
  [SupportedCountryCodes.AU]: AUStateCode
  // TODO(EU): Add EU country codes when applicable
  [SupportedCountryCodes.EU]: string
}

type GetAdvocatesFunction<T extends SupportedCountryCodes> = (
  stateCode: StateCode[T],
) => Promise<AdvocatesCountResult[]>

const GET_ADVOCATES_BY_COUNTRY_CODE_MAP: {
  [K in SupportedCountryCodes]: GetAdvocatesFunction<K>
} = {
  [SupportedCountryCodes.US]: getUSAdvocatesCountByDistrict,
  [SupportedCountryCodes.GB]: getGBAdvocatesCountByConstituency,
  [SupportedCountryCodes.CA]: getCAAdvocatesCountByDistrict,
  [SupportedCountryCodes.AU]: getAUAdvocatesCountByDistrict,
  [SupportedCountryCodes.EU]: getEUAdvocatesCountByDistrict,
}

const GET_REFERRALS_BY_COUNTRY_CODE_MAP: {
  [K in SupportedCountryCodes]: GetAdvocatesFunction<K>
} = {
  [SupportedCountryCodes.US]: getUSReferralsCountByDistrict,
  [SupportedCountryCodes.GB]: getGBReferralsCountByConstituency,
  [SupportedCountryCodes.CA]: getCAReferralsCountByDistrict,
  [SupportedCountryCodes.AU]: getAUReferralsCountByDistrict,
  [SupportedCountryCodes.EU]: getEUReferralsCountByDistrict,
}

export async function getAdvocatesCountByDistrict<T extends SupportedCountryCodes>(
  countryCode: T,
  stateCode: StateCode[T],
): Promise<AdvocatesCountResult[]> {
  const result = await GET_ADVOCATES_BY_COUNTRY_CODE_MAP[countryCode](stateCode)

  return result
}

export async function getReferralsCountByDistrict<T extends SupportedCountryCodes>(
  countryCode: T,
  stateCode: StateCode[T],
): Promise<AdvocatesCountResult[]> {
  return GET_REFERRALS_BY_COUNTRY_CODE_MAP[countryCode](stateCode)
}
