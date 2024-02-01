'use client'
import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { useEffect, useState } from 'react'
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
  const initialDelayToShowAnimation = 1500
  const [refreshInterval, setRefreshInterval] = useState(initialDelayToShowAnimation)
  /*
    After we initially fetch data we can slow down how often we check for additional data
  */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setRefreshInterval(1000 * 10)
    }, initialDelayToShowAnimation * 2)
    return () => clearTimeout(timeout)
  }, [initialDelayToShowAnimation])
  return useSWR(
    apiUrls.homepageTopLevelMetrics(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetHomepageTopLevelMetricsResponse),
    {
      revalidateOnMount: false,
      fallbackData: mockDecreaseInValuesOnInitialLoadSoWeCanAnimateIncrease,
      refreshInterval,
    },
  )
}
