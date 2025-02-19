'use client'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { UserActionType } from '@prisma/client'
import { useMemo } from 'react'
import useSWR from 'swr'

export function ReferralsCounter() {
  const userResponse = useApiResponseForUserFullProfileInfo({
    refreshInterval: 1000 * 60 * 1, // 1 minute
  })
  const user = userResponse.data?.user

  const referrals = useMemo(() => {
    const referAction = user?.userActions.find(action => action.actionType === UserActionType.REFER)

    return referAction?.referralsCount ?? 0
  }, [user])

  const address = useMemo(() => user?.address, [user])
  const districtResponse = useGetDistrictFromAddress(address?.formattedDescription)

  const district = useMemo(() => {
    if (!districtResponse.data) {
      return null
    }
    if ('districtNumber' in districtResponse.data) {
      return districtResponse.data.districtNumber.toString()
    }
    return null
  }, [districtResponse.data])

  const districtRankingResponse = useSWR(
    address && district
      ? apiUrls.districtRanking({
          state: address.administrativeAreaLevel1,
          district,
        })
      : null,
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as number | null),
    {
      refreshInterval: 1000 * 60 * 1, // 1 minute
    },
  )

  return (
    <div className="flex w-full gap-4">
      <div className="flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-primary-cta p-4 text-white">
        <p className="text-sm font-medium">Your referrals</p>
        {userResponse.isLoading ? (
          <Skeleton className="h-12 w-14" />
        ) : (
          <AnimatedNumericOdometer size={48} value={referrals.toString()} />
        )}
      </div>

      <div className="flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-secondary p-4">
        <p className="text-sm font-medium">District ranking</p>
        {districtRankingResponse.isLoading || userResponse.isLoading ? (
          <Skeleton className="h-12 w-14 bg-primary-cta/10" />
        ) : (
          <div className="flex gap-1">
            <span className="text-4xl font-semibold">#</span>
            <AnimatedNumericOdometer
              size={48}
              value={districtRankingResponse.data?.toString() ?? ''}
              className="justify-start"
            />
          </div>
        )}
      </div>
    </div>
  )
}
