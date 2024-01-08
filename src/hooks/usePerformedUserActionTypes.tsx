'use client'
import { getPerformedUserActionTypes } from '@/app/api/identified-user/performed-user-action-types/route'
import { MaybeAuthenticatedApiResponse } from '@/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

// TODO determine if we want to be more conservative about revalidation https://swr.vercel.app/docs/revalidation
export function usePerformedUserActionTypes() {
  const props = useSWR(apiUrls.performedUserActionTypes(), url =>
    fetchReq(url)
      .then(res => res.json())
      .then(data => data as MaybeAuthenticatedApiResponse<typeof getPerformedUserActionTypes>),
  )

  return {
    ...props,
    data: props.data
      ? 'performedUserActionTypes' in props.data
        ? props.data
        : { performedUserActionTypes: [] }
      : undefined,
  }
}
