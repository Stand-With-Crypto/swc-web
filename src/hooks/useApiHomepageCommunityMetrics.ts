'use client'
import { GetHomepageCommunityMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

export function useApiHomepageCommunityMetrics(fallbackData: GetHomepageCommunityMetricsResponse) {
  return useSWR(
    apiUrls.homepageCommunityMetrics(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetHomepageCommunityMetricsResponse),
    { fallbackData, refreshInterval: 1000 * 5 },
  )
}
