'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface ReferralsCounterProps {
  children: React.ReactNode
  className?: string
}

export function ReferralsCounter(props: ReferralsCounterProps) {
  const { children, className } = props

  const { isLoggedIn, isLoading } = useSession()
  const hasHydrated = useHasHydrated()

  if (!isLoggedIn || isLoading || !hasHydrated) {
    return null
  }

  return <div className={cn('flex w-full gap-4', className)}>{children}</div>
}

export function UserReferralsCount({ className }: { className?: string }) {
  const userResponse = useApiResponseForUserFullProfileInfo({
    refreshInterval: 1000 * 60 * 1, // 1 minute
  })
  const user = userResponse.data?.user

  const referralsCount = useMemo(() => {
    if (!user?.userActions?.length) return 0

    return user.userActions
      .filter(action => action.actionType === UserActionType.REFER)
      .reduce((total, action) => total + (action.referralsCount || 0), 0)
  }, [user])

  return (
    <div
      className={cn(
        'flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-primary-cta p-4 text-white',
        className,
      )}
    >
      <p className="font-medium">Your referrals</p>
      {userResponse.isLoading ? (
        <Skeleton className="h-12 w-14" />
      ) : (
        <AnimatedNumericOdometer size={48} value={referralsCount.toString()} />
      )}
    </div>
  )
}
ReferralsCounter.UserReferralsCount = UserReferralsCount

export function UserElectoralZoneRank({
  className,
  countryCode,
}: {
  className?: string
  countryCode: SupportedCountryCodes
}) {
  const { address } = useMutableCurrentUserAddress()
  const districtResponse = useGetDistrictFromAddress({
    address: address === 'loading' ? null : address?.description,
    placeId: address === 'loading' ? null : address?.place_id,
  })

  const district = useMemo(() => {
    if (!districtResponse.data) return null
    if ('notFoundReason' in districtResponse.data) return null
    if (!districtResponse.data.zoneName) return null

    return districtResponse.data
  }, [districtResponse.data])

  const districtRankingResponse = useGetDistrictRank({
    countryCode,
    stateCode: district?.stateCode as USStateCode,
    districtNumber: district?.zoneName?.toString() ?? null,
  })

  const rank = districtRankingResponse.data?.rank

  const districtRanking = useMemo(() => {
    if (districtRankingResponse.isLoading || districtResponse.isLoading || address === 'loading') {
      return <Skeleton className="h-12 w-14 bg-primary-cta/10" />
    }

    if (!address) {
      return <p>Finish your profile to see your district ranking</p>
    }

    if (!rank || !districtRankingResponse.data) {
      return <p>N/A</p>
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
    address,
    rank,
  ])

  return (
    <div
      className={cn(
        'flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-secondary p-4',
        className,
      )}
    >
      <p className="font-medium">District ranking</p>
      {districtRanking}
    </div>
  )
}

ReferralsCounter.UserElectoralZoneRank = UserElectoralZoneRank
