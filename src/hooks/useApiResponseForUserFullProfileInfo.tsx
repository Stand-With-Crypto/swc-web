'use client'
import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiResponseForUserFullProfileInfo(
  config?: Pick<FullConfiguration, 'revalidateOnMount'>,
) {
  return useSWR(
    apiUrls.userFullProfileInfo(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetUserFullProfileInfoResponse),
    config,
  )
}
