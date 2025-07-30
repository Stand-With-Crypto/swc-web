'use client'

import { useMemo } from 'react'

import { useUserAddress } from '@/components/app/pageReferrals/userAddress.context'
import { UserLocationRank } from '@/components/app/pageReferrals/userLocationRank'

export function UsUserDistrictRank({ className }: { className?: string }) {
  const { address, isLoading, electoralZone, electoralZoneRanking } = useUserAddress()

  const districtRanking = useMemo(() => {
    if (isLoading) {
      return <UserLocationRank.Skeleton />
    }

    if (!address?.description) {
      return <p>Finish your profile to see your district ranking</p>
    }

    if (!electoralZoneRanking?.rank || !electoralZone) {
      return <p>N/A</p>
    }

    return <UserLocationRank.RankOdometer rank={electoralZoneRanking.rank ?? 0} />
  }, [address?.description, electoralZoneRanking, electoralZone, isLoading])

  return (
    <UserLocationRank.Wrapper className={className}>
      <UserLocationRank.Label>District ranking</UserLocationRank.Label>
      {districtRanking}
    </UserLocationRank.Wrapper>
  )
}
