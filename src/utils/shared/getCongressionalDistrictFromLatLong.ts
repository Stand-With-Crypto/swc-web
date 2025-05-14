import { GetConstituencyResult } from '@/utils/server/swcCivic/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { US_STATE_NUMBER_TO_STATE_CODE } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'

const STATE_NORMALIZATION_MAP: Record<SupportedCountryCodes, (stateCode: string) => string> = {
  [SupportedCountryCodes.US]: (stateCode: string) =>
    US_STATE_NUMBER_TO_STATE_CODE[Number(stateCode)],
  [SupportedCountryCodes.GB]: (stateCode: string) => stateCode,
  [SupportedCountryCodes.CA]: (stateCode: string) => stateCode,
  [SupportedCountryCodes.AU]: (stateCode: string) => stateCode,
}

export async function getCongressionalDistrictFromLatLong({
  latitude,
  longitude,
  countryCode,
}: {
  latitude: number
  longitude: number
  countryCode: SupportedCountryCodes
}) {
  if (!latitude || !longitude) {
    return
  }

  const response = await fetchReq(
    apiUrls.congressionalDistrictFromLatLong({
      latitude,
      longitude,
      countryCode,
    }),
  )

  const data = (await response.json()) as GetConstituencyResult

  if (countryCode === SupportedCountryCodes.US && data.stateCode) {
    return {
      name: data.name,
      stateCode: data.stateCode ? STATE_NORMALIZATION_MAP[countryCode](data.stateCode) : undefined,
    }
  }

  return data
}
