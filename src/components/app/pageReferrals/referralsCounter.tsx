'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { USStateCode } from '@/utils/shared/usStateUtils'

export function ReferralsCounterContent() {
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

  const districtRankingResponse = useGetDistrictRank({
    stateCode: address?.administrativeAreaLevel1 as USStateCode,
    districtNumber: district,
  })

  const rank = districtRankingResponse.data?.rank

  const districtRanking = useMemo(() => {
    if (districtRankingResponse.isLoading || userResponse.isLoading || districtResponse.isLoading) {
      return <Skeleton className="h-12 w-14 bg-primary-cta/10" />
    }

    if (!address && !userResponse.isLoading) {
      return <p>Finish your profile to see your district ranking</p>
    }

    if (!rank || !districtRankingResponse.data) {
      return null
    }

    return (
      <div className="flex gap-1">
        <span className="text-4xl font-semibold">#</span>
        <AnimatedNumericOdometer className="justify-start" size={48} value={rank.toString()} />
      </div>
    )
  }, [
    districtRankingResponse.data,
    districtRankingResponse.isLoading,
    districtResponse.isLoading,
    userResponse.isLoading,
    address,
    rank,
  ])

  return (
    <div className="flex w-full gap-4">
      <div className="flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-primary-cta p-4 text-white">
        <p className="font-medium">Your referrals</p>
        {userResponse.isLoading ? (
          <Skeleton className="h-12 w-14" />
        ) : (
          <AnimatedNumericOdometer size={48} value={referrals.toString()} />
        )}
      </div>

      <div className="flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-secondary p-4">
        <p className="font-medium">District ranking</p>
        {districtRanking}
      </div>
    </div>
  )
}

export function ReferralsCounter() {
  const { isLoggedIn, isLoading } = useSession()
  const hasHydrated = useHasHydrated()

  if (!isLoggedIn || isLoading || !hasHydrated) {
    return null
  }

  return <ReferralsCounterContent />
}
