import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function usePollsVotesFromUser(
  userId?: string,
  config?: Pick<FullConfiguration, 'revalidateOnMount'>,
) {
  const countryCode = useCountryCode()

  return useSWR(
    userId ? apiUrls.pollsVotesFromUser({ userId, countryCode }) : null,
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PollsVotesFromUserResponse),
    config,
  )
}
