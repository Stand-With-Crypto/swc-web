'use client'
import { apiResponseForUserPerformedUserActionTypes } from '@/app/api/identified-user/performed-user-action-types/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

// TODO determine if we want to be more conservative about revalidation https://swr.vercel.app/docs/revalidation
export function useApiResponseForUserPerformedUserActionTypes() {
  return useSWR(apiUrls.userPerformedUserActionTypes(), url =>
    fetchReq(url)
      .then(res => res.json())
      .then(data => data as Awaited<ReturnType<typeof apiResponseForUserPerformedUserActionTypes>>),
  )
}
