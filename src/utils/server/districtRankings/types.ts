import { AUStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { CAProvinceOrTerritoryCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

export type StateCode = USStateCode | CAProvinceOrTerritoryCode | AUStateCode
