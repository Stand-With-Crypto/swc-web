import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { PollResultsDataResponse } from '@/data/polls/getPollsData'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function usePollsResultsData(
  fallbackData: Record<string, PollResultsDataResponse>,
  config?: Pick<FullConfiguration, 'revalidateOnMount'>,
) {
  const countryCode = useCountryCode()

  return useSWR(
    apiUrls.pollsResultsData({ countryCode }),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as Record<string, PollResultsDataResponse>),
    { fallbackData, ...config, refreshInterval: 1000 * 30 }, // 30 seconds
  )
}
