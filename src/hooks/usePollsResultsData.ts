import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { PollResultsDataResponse } from '@/data/polls/getPollsData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function usePollsResultsData(
  fallbackData: Record<string, PollResultsDataResponse>,
  config?: Pick<FullConfiguration, 'revalidateOnMount'>,
) {
  return useSWR(
    apiUrls.pollsResultsData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as Record<string, PollResultsDataResponse>),

    { fallbackData, config },
  )
}
