import { GetConstituencyResult } from '@/utils/server/swcCivic/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'

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

  return data
}
