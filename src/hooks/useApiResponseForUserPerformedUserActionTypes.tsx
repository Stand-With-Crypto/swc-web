'use client'
import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

// TODO determine if we want to be more conservative about revalidation https://swr.vercel.app/docs/revalidation
export function useApiResponseForUserPerformedUserActionTypes(
  config?: Pick<FullConfiguration, 'revalidateOnMount'>,
) {
  return useSWR(
    apiUrls.userPerformedUserActionTypes(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetUserPerformedUserActionTypesResponse),
    config,
  )
}
