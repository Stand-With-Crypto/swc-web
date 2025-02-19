import useSWR, { SWRConfiguration } from 'swr'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[stateCode]/[districtNumber]/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { USStateCode } from '@/utils/shared/usStateUtils'

interface UseGetDistrictRankProps {
  stateCode: USStateCode
  districtNumber: string | null
  config?: SWRConfiguration<GetDistrictRankResponse>
}

export function useGetDistrictRank(props: UseGetDistrictRankProps) {
  const { stateCode, districtNumber, config } = props

  const districtRankingResponse = useSWR(
    stateCode && districtNumber
      ? apiUrls.districtRanking({
          stateCode,
          districtNumber,
        })
      : null,
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as number | null),
    {
      refreshInterval: 1000 * 60 * 1, // 1 minute
      ...config,
    },
  )

  return districtRankingResponse
}
