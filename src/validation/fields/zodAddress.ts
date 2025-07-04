import { number, object, string, ZodIssueCode } from 'zod'

import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

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
  usCongressionalDistrict: string().optional(),
  electoralZone: string().optional(),
  latitude: number().optional().nullable(),
  longitude: number().optional().nullable(),
})

export const zodStateDistrict = object({
  state: string().refine(
    (val): val is USStateCode => val in US_STATE_CODE_TO_DISTRICT_COUNT_MAP,
    'Invalid state code',
  ),
  district: string(),
}).superRefine((data, ctx) => {
  if (!(data.state in US_STATE_CODE_TO_DISTRICT_COUNT_MAP)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'Invalid state code',
      path: ['state'],
    })
    return
  }

  const districtCount = US_STATE_CODE_TO_DISTRICT_COUNT_MAP[data.state as USStateCode]
  if (districtCount === 0) {
    // Special case for DC
    if (data.district !== 'N/A' && data.district.toString() !== '1') {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'District must be N/A or 1 for this state',
        path: ['district'],
      })
    }
    return
  }

  const districtNum = parseInt(data.district, 10)
  if (isNaN(districtNum) || districtNum <= 0 || districtNum > districtCount) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `District must be a number between 1 and ${districtCount}`,
      path: ['district'],
    })
  }
})
