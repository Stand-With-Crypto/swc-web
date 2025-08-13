/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useSession } from '@/hooks/useSession'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function usePollsVotesFromUser(config?: Pick<FullConfiguration, 'revalidateOnMount'>) {
  const { isLoggedIn } = useSession()
  const countryCode = useCountryCode()

  const shouldFetch = isLoggedIn ? apiUrls.pollsVotesFromUser({ countryCode }) : null

  return useSWR(
    shouldFetch,
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PollsVotesFromUserResponse),
    config,
  )
}
