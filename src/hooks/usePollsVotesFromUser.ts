import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function usePollsVotesFromUser(
  userId?: string,
  config?: Pick<FullConfiguration, 'revalidateOnMount'>,
) {
  return useSWR(
    userId ? apiUrls.pollsVotesFromUser({ userId }) : null,
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PollsVotesFromUserResponse),
    config,
  )
}
