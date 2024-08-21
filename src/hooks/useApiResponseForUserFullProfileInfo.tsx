'use client'
import useSWR, { SWRConfiguration } from 'swr'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiResponseForUserFullProfileInfo(
  config?: SWRConfiguration<GetUserFullProfileInfoResponse>,
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
