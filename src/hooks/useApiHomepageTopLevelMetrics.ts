'use client'
import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

export function useApiHomepageTopLevelMetrics(initial: GetHomepageTopLevelMetricsResponse) {
  const mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease: GetHomepageTopLevelMetricsResponse =
    {
      sumDonations: {
        amountUsd: initial.sumDonations.amountUsd - 99,
      },
      countUsers: {
        count: initial.countUsers.count - 1,
      },
      countPolicymakerContacts: {
        countUserActionCalls: initial.countPolicymakerContacts.countUserActionCalls - 1,
        countUserActionEmailRecipients:
          initial.countPolicymakerContacts.countUserActionEmailRecipients - 1,
      },
    }
  return useSWR(
    apiUrls.homepageTopLevelMetrics(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetHomepageTopLevelMetricsResponse),
    {
      fallbackData: mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease,
      refreshInterval: 1000 * 5,
    },
  )
}
