'use client'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

export function useApiRecentActivity(fallbackData: PublicRecentActivity, args: { limit: number }) {
  return useSWR(
    apiUrls.recentActivity(args),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PublicRecentActivity),
    { fallbackData, refreshInterval: 1000 * 5 },
  )
}
