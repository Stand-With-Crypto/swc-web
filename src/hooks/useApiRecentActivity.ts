'use client'
import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiRecentActivity(
  fallbackData: PublicRecentActivity,
  args: { limit: number; countryCode: string },
  config?: Pick<FullConfiguration, 'revalidateOnFocus'> & { refreshManually?: boolean },
) {
  return useSWR(
    apiUrls.recentActivity(args),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PublicRecentActivity),
    { fallbackData, refreshInterval: config?.refreshManually ? 0 : 1000 * 10, ...config },
  )
}
