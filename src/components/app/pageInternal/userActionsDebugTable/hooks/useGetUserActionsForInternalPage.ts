import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { fetchReq } from '@/utils/shared/fetchReq'

export interface UserActionsResponse {
  userActions: SensitiveDataClientUserAction[]
}

export function useGetUserActionsForInternalPage(
  config?: Pick<FullConfiguration, 'revalidateOnMount' | 'revalidateOnFocus'>,
) {
  const userActionsApiUrl = '/api/internal/user-actions'
  return useSWR(
    userActionsApiUrl,
    (url: string) =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as UserActionsResponse),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      refreshInterval: 0,
      ...config,
    },
  )
}
