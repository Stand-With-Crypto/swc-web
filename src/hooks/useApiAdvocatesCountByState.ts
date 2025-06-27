import useSWR from 'swr'

import { GetAdvocatesCountByStateDataResponse } from '@/data/pageSpecific/getAdvocatesCountByStateData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiAdvocatesCountByState(
  fallbackData: GetAdvocatesCountByStateDataResponse,
  stateCode: string,
) {
  return useSWR(
    apiUrls.advocatesCountByState(stateCode),
    url =>
      fetchReq(url)
        .then(response => response.json())
        .then(value => value as GetAdvocatesCountByStateDataResponse),
    {
      fallbackData,
    },
  )
}
