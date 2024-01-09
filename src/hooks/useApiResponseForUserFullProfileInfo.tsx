'use client'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

export function useApiResponseForUserFullProfileInfo() {
  return useSWR(apiUrls.userFullProfileInfo(), url =>
    fetchReq(url)
      .then(res => res.json())
      .then(data => data as GetUserFullProfileInfoResponse),
  )
}
