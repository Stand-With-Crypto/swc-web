'use client'
import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

export function useApiHomepageTopLevelMetrics(fallbackData: GetHomepageTopLevelMetricsResponse) {
  return useSWR(
    apiUrls.homepageTopLevelMetrics(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetHomepageTopLevelMetricsResponse),
    { fallbackData, refreshInterval: 1000 * 5 },
  )
}
