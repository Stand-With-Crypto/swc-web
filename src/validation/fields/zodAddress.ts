import { number, object, string, ZodIssueCode } from 'zod'

import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { GB_REGIONS, GBRegion } from '@/utils/shared/stateMappings/gbCountryUtils'

export const zodAddress = object({
  googlePlaceId: string().optional(),
  formattedDescription: string(),
  streetNumber: string(),
  route: string(),
  subpremise: string(),
  locality: string(),
  administrativeAreaLevel1: string(),
  administrativeAreaLevel2: string(),
  postalCode: string(),
  postalCodeSuffix: string(),
  countryCode: string().length(2),
  swcCivicAdministrativeArea: string().optional(),
  electoralZone: string().optional(),
  latitude: number().optional().nullable(),
  longitude: number().optional().nullable(),
})

export const zodUSStateDistrict = object({
  state: string().refine(
    (val): val is USStateCode => val in US_STATE_CODE_TO_DISPLAY_NAME_MAP,
    'Invalid state code',
  ),
  district: string(),
}).superRefine((data, ctx) => {
  if (!(data.state in US_STATE_CODE_TO_DISPLAY_NAME_MAP)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'Invalid state code',
      path: ['state'],
    })
    return
  }

  if (data.district.toString() === 'At-Large') return

  const districtCount = US_STATE_CODE_TO_DISTRICT_COUNT_MAP[data.state as USStateCode]
  const districtNum = parseInt(data.district, 10)
  if (isNaN(districtNum) || districtNum <= 0 || districtNum > districtCount) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `District must be a number between 1 and ${districtCount}`,
      path: ['district'],
    })
    return
  }
})

export const zodAUStateDistrict = object({
  state: string().refine(
    (val): val is AUStateCode => val in AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
    'Invalid state code',
  ),
  district: string(),
})

export const zodCAProvinceDistrict = object({
  state: string().refine(
    (val): val is CAProvinceOrTerritoryCode =>
      val in CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
    'Invalid province/territory code',
  ),
  district: string(),
})

export const zodGbRegionConstituency = object({
  state: string().refine((val): val is GBRegion => GB_REGIONS.includes(val), 'Invalid state code'),
  district: string(),
})
