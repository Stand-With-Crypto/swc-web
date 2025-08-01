import { AUStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { CAProvinceOrTerritoryCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

export type StateCode = USStateCode | CAProvinceOrTerritoryCode | AUStateCode

export interface AdvocatesCountByDistrictQueryResult {
  state: string
  district: string | null
  count: number
}

export interface ReferralsCountByDistrictQueryResult {
  state: string
  district: string | null
  refer_actions_count: number
  referrals: number
}
