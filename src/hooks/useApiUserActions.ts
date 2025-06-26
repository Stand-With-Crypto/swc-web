'use client'

import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export interface UserActionsResponse {
  userActions: SensitiveDataClientUserAction[]
}

export function useApiUserActions(
  config?: Pick<FullConfiguration, 'revalidateOnMount' | 'revalidateOnFocus'>,
) {
  return useSWR(
    apiUrls.internal.userActions(),
    (url: string) =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as UserActionsResponse),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      refreshInterval: 0, // No automatic refresh for debugging data
      ...config,
    },
  )
}
