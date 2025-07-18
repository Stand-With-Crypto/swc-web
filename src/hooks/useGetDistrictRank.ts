import useSWR, { SWRConfiguration } from 'swr'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import { StateCode } from '@/utils/server/districtRankings/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'

interface UseGetDistrictRankProps {
  countryCode: SupportedCountryCodes
  stateCode: StateCode | null
  districtNumber: string | null
  filteredByState?: boolean
  config?: SWRConfiguration<GetDistrictRankResponse>
}

export function useGetDistrictRank(props: UseGetDistrictRankProps) {
  const { countryCode, stateCode, districtNumber, filteredByState, config } = props

  const districtRankingResponse = useSWR(
    stateCode && districtNumber
      ? apiUrls.districtRanking({
          countryCode,
          stateCode,
          districtNumber,
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
