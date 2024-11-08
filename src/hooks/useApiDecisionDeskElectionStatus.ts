import useSWR from 'swr'

import { AllCompletedRacesResponse } from '@/utils/server/decisionDesk/getElectionStatus'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export const useApiDecisionDeskElectionStatus = (
  initialData: AllCompletedRacesResponse | undefined,
) => {
  const swrData = useSWR(
    apiUrls.decisionDeskElectionStatusData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as AllCompletedRacesResponse),
    {
      fallbackData: initialData,
      refreshInterval: 60 * 1000, // 1 MINUTE
      errorRetryInterval: 30 * 1000, // 30 SECONDS
      refreshWhenHidden: true,
    },
  )

  return swrData
}
