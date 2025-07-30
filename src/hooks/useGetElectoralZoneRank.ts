import useSWR, { SWRConfiguration } from 'swr'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import { StateCode } from '@/utils/server/districtRankings/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'

interface useGetElectoralZoneRankProps {
  countryCode: SupportedCountryCodes
  stateCode: StateCode | null
  electoralZone: string | null
  filteredByState?: boolean
  config?: SWRConfiguration<GetDistrictRankResponse>
}

export function useGetElectoralZoneRank(props: useGetElectoralZoneRankProps) {
  const { countryCode, stateCode, electoralZone, filteredByState, config } = props

  const districtRankingResponse = useSWR(
    stateCode && electoralZone
      ? apiUrls.electoralZoneRanking({
          countryCode,
          stateCode,
          electoralZone,
          filteredByState,
        })
      : null,
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetDistrictRankResponse),
    {
      refreshInterval: 1000 * 60 * 1, // 1 minute
      ...config,
    },
  )

  return districtRankingResponse
}
