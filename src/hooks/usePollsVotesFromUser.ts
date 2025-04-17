'use client'

import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function usePollsVotesFromUser(config?: Pick<FullConfiguration, 'revalidateOnMount'>) {
  const countryCode = useCountryCode()

  return useSWR(
    apiUrls.pollsVotesFromUser({ countryCode }),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PollsVotesFromUserResponse),
    config,
  )
}
