import {
  getAUAdvocatesCountByDistrict,
  getAUReferralsCountByDistrict,
} from '@/utils/server/districtRankings/au/getRankingData'
import {
  getCAAdvocatesCountByDistrict,
  getCAReferralsCountByDistrict,
} from '@/utils/server/districtRankings/ca/getRankingData'
import {
  getUSAdvocatesCountByDistrict,
  getUSReferralsCountByDistrict,
} from '@/utils/server/districtRankings/us/getRankingData'
import { AUStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { CAProvinceOrTerritoryCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface AdvocatesCountResult {
  state: USStateCode | CAProvinceOrTerritoryCode | AUStateCode
  district: string
  count: number
}

interface StateCode {
  [SupportedCountryCodes.US]: USStateCode
  [SupportedCountryCodes.GB]: string // TODO: Implement
  [SupportedCountryCodes.CA]: CAProvinceOrTerritoryCode
  [SupportedCountryCodes.AU]: AUStateCode
}

type GetAdvocatesFunction<T extends SupportedCountryCodes> = (
  stateCode: StateCode[T],
) => Promise<AdvocatesCountResult[]>

const GET_ADVOCATES_BY_COUNTRY_CODE_MAP: {
  [K in SupportedCountryCodes]: GetAdvocatesFunction<K>
} = {
  [SupportedCountryCodes.US]: getUSAdvocatesCountByDistrict,
  [SupportedCountryCodes.GB]: async () => {
    throw new Error('Not implemented')
  },
  [SupportedCountryCodes.CA]: getCAAdvocatesCountByDistrict,
  [SupportedCountryCodes.AU]: getAUAdvocatesCountByDistrict,
}

const GET_REFERRALS_BY_COUNTRY_CODE_MAP: {
  [K in SupportedCountryCodes]: GetAdvocatesFunction<K>
} = {
  [SupportedCountryCodes.US]: getUSReferralsCountByDistrict,
  [SupportedCountryCodes.GB]: async () => {
    throw new Error('Not implemented')
  },
  [SupportedCountryCodes.CA]: getCAReferralsCountByDistrict,
  [SupportedCountryCodes.AU]: getAUReferralsCountByDistrict,
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
